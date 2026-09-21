const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Determine the real file type from its leading bytes (never trust the client's
// reported MIME type or filename extension).
const sniffFileType = (buf) => {
  for (const [ext, def] of Object.entries(FILETYPES)) {
    if (def.test(buf)) return { ext, mime: def.mime };
  }
  return null;
};

// Post-multer middleware: reads every uploaded file back off disk, verifies its
// magic bytes against an allow-list for this field, rewrites it to a safe
// extension derived from the sniffed type, and rejects the upload otherwise.
const validateUploads = (allowedExts) => {
  const validateFile = (file) => {
    const onDisk = path.join(file.destination, file.filename);

    let fd;
    let head;
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

    const sniffed = sniffFileType(head);
    if (!sniffed || !allowedExts.includes(sniffed.ext)) {
      try { fs.unlinkSync(onDisk); } catch (e) { /* best effort */ }
      const err = new Error(`File type not allowed. Accepted: ${allowedExts.join(', ')}`);
      err.status = 400;
      throw err;
    }

    const safeName = `${file.filename}.${sniffed.ext}`;
    fs.renameSync(onDisk, path.join(file.destination, safeName));
    file.filename = safeName;
    file.mimetype = sniffed.mime;
  };

  return (req, res, next) => {
    const files = (req.files && req.files.length) ? req.files : req.file ? [req.file] : [];
    try {
      for (const file of files) validateFile(file);
      next();
    } catch (err) {
      next(err);
    }
  };
};

const uploadCover = multer({ storage: makeStorage('covers'), fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadPages = multer({ storage: makeStorage('pages'), fileFilter: imageFilter, limits: { fileSize: 8 * 1024 * 1024 } });
const uploadScript = multer({ storage: makeStorage('scripts'), fileFilter: scriptFilter, limits: { fileSize: 15 * 1024 * 1024 } });
const uploadAvatar = multer({ storage: makeStorage('avatars'), fileFilter: imageFilter, limits: { fileSize: 3 * 1024 * 1024 } });

const validateImages = validateUploads(['jpg', 'png', 'gif', 'webp']);
const validateScript = validateUploads(['pdf', 'doc', 'docx', 'txt']);

module.exports = {
  uploadCover,
  uploadPages,
  uploadScript,
  uploadAvatar,
  validateImages,
  validateScript,
};