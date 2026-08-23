const multer = require('multer');

// Vercel serverless functions cap request bodies at ~4.5MB, so every
// per-file limit here must stay below that. Files are kept in memory and
// persisted to MongoDB (see models/File.js) — disk storage doesn't survive
// on serverless platforms.
const MAX_FILE_BYTES = 4 * 1024 * 1024;

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};

const scriptFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only PDF, DOC, DOCX, or TXT files are allowed'));
};

const uploadCover = multer({ storage: multer.memoryStorage(), fileFilter: imageFilter, limits: { fileSize: MAX_FILE_BYTES } });
const uploadPages = multer({ storage: multer.memoryStorage(), fileFilter: imageFilter, limits: { fileSize: MAX_FILE_BYTES } });
const uploadScript = multer({ storage: multer.memoryStorage(), fileFilter: scriptFilter, limits: { fileSize: MAX_FILE_BYTES } });
const uploadAvatar = multer({ storage: multer.memoryStorage(), fileFilter: imageFilter, limits: { fileSize: MAX_FILE_BYTES } });

module.exports = { uploadCover, uploadPages, uploadScript, uploadAvatar };
