const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, enabled: cloudEnabled } = require('../config/cloudinary');
const { KIND_RESOURCE } = require('../utils/mediaPath');

const makeStorage = (subfolder) => {
  const dir = path.join(__dirname, '..', 'uploads', subfolder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      // No extension from the client: the real extension is derived from
      // magic bytes by the validation middleware, so a client can never get
      // an arbitrary (e.g. .html) extension on disk.
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}.bin`);
    },
  });
};

// Cloud mode keeps the file in memory (a serverless / ephemeral disk is read
// only or wiped on redeploy) and streams it to Cloudinary in the validation
// step below. Local mode writes to disk exactly as before, and the disk folder
// is only created when actually needed (never on a read-only cloud host).
const storageFor = (subfolder) => (cloudEnabled ? multer.memoryStorage() : makeStorage(subfolder));

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else {
    const err = new Error('Only image files are allowed');
    err.status = 400;
    cb(err);
  }
};

const scriptFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else {
    const err = new Error('Only PDF, DOC, DOCX, or TXT files are allowed');
    err.status = 400;
    cb(err);
  }
};

const FILETYPES = {
  jpg: {
    mime: 'image/jpeg',
    test: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  png: {
    mime: 'image/png',
    test: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  gif: {
    mime: 'image/gif',
    test: (b) => b.length >= 4 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38,
  },
  webp: {
    mime: 'image/webp',
    test: (b) =>
      b.length >= 12 &&
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  pdf: {
    mime: 'application/pdf',
    test: (b) => b.length >= 5 && b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46,
  },
  doc: {
    mime: 'application/msword',
    test: (b) => b.length >= 4 && b[0] === 0xd0 && b[1] === 0xcf && b[2] === 0x11 && b[3] === 0xe0,
  },
  docx: {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    test: (b) => b.length >= 4 && b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04,
  },
  txt: {
    mime: 'text/plain',
    test: (b) => b.length > 0 && !b.some((byte) => byte === 0x00),
  },
};

// Which Cloudinary folder (and resource type) a multipart field maps to. The
// field name is fixed by each route (cover / pages / avatar / file).
const FIELD_KIND = { cover: 'covers', pages: 'pages', avatar: 'avatars', file: 'scripts' };

const filesOf = (req) => (req.files && req.files.length ? req.files : req.file ? [req.file] : []);

// Best-effort removal of files multer already wrote to disk. Called when a
// request fails validation (or a later file in the same request is rejected),
// so a partially-accepted multipart upload doesn't leave orphaned .bin files.
// In cloud mode the files only ever exist in memory, so there is nothing to do.
const cleanupFiles = (files) => {
  for (const file of files || []) {
    if (!file || file.buffer) continue;
    const onDisk = file.path || (file.destination && file.filename ? path.join(file.destination, file.filename) : null);
    if (!onDisk) continue;
    try {
      fs.unlinkSync(onDisk);
    } catch (e) {
      // Already removed or never written — fine.
    }
  }
};

const cleanupUploads = (req) => {
  cleanupFiles(filesOf(req));
};

// Determine the real file type from its leading bytes (never trust the client's
// reported MIME type or filename extension).
const sniffFileType = (buf) => {
  for (const [ext, def] of Object.entries(FILETYPES)) {
    if (def.test(buf)) return { ext, mime: def.mime };
  }
  return null;
};

const uploadBufferToCloudinary = (buffer, { publicId, resourceType }) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        resource_type: resourceType,
        overwrite: false,
        unique_filename: false,
        use_filename: false,
        invalidate: true,
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

// Post-multer middleware: verifies every uploaded file's magic bytes against an
// allow-list, gives it a safe name derived from the sniffed type, and either
// streams it to Cloudinary (cloud mode) or renames it on disk (local mode).
const persistUploads = (allowedExts) => async (req, res, next) => {
  const files = filesOf(req);

  try {
    for (const file of files) {
      const kind = FIELD_KIND[file.fieldname] || 'covers';
      const resourceType = KIND_RESOURCE[kind] || 'image';

      let head;
      if (cloudEnabled) {
        head = Buffer.from(file.buffer.subarray(0, 16));
      } else {
        const onDisk = path.join(file.destination, file.filename);
        let fd;
        try {
          fd = fs.openSync(onDisk, 'r');
          head = Buffer.alloc(16);
          fs.readSync(fd, head, 0, head.length, 0);
        } catch (readErr) {
          const e = new Error('Could not read uploaded file');
          e.status = 400;
          throw e;
        } finally {
          if (fd !== undefined) fs.closeSync(fd);
        }
      }

      const sniffed = sniffFileType(head);
      if (!sniffed || !allowedExts.includes(sniffed.ext)) {
        const err = new Error(`File type not allowed. Accepted: ${allowedExts.join(', ')}`);
        err.status = 400;
        throw err;
      }

      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const safeName = `${unique}.${sniffed.ext}`;

      if (cloudEnabled) {
        const publicId = resourceType === 'raw' ? `tb/${kind}/${safeName}` : `tb/${kind}/${unique}`;
        await uploadBufferToCloudinary(file.buffer, { publicId, resourceType });
        file.filename = safeName;
      } else {
        const onDisk = path.join(file.destination, file.filename);
        const finalName = `${file.filename}.${sniffed.ext}`;
        fs.renameSync(onDisk, path.join(file.destination, finalName));
        file.filename = finalName;
      }

      file.mimetype = sniffed.mime;
    }
    next();
  } catch (err) {
    // Drop every file from this request, including ones already accepted
    // before the failure, so nothing is orphaned.
    cleanupFiles(files);
    next(err);
  }
};

const uploadCover = multer({ storage: storageFor('covers'), fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadPages = multer({ storage: storageFor('pages'), fileFilter: imageFilter, limits: { fileSize: 8 * 1024 * 1024 } });
const uploadScript = multer({ storage: storageFor('scripts'), fileFilter: scriptFilter, limits: { fileSize: 15 * 1024 * 1024 } });
const uploadAvatar = multer({ storage: storageFor('avatars'), fileFilter: imageFilter, limits: { fileSize: 3 * 1024 * 1024 } });

const validateImages = persistUploads(['jpg', 'png', 'gif', 'webp']);
const validateScript = persistUploads(['pdf', 'doc', 'docx', 'txt']);

module.exports = {
  uploadCover,
  uploadPages,
  uploadScript,
  uploadAvatar,
  validateImages,
  validateScript,
  cleanupUploads,
};
