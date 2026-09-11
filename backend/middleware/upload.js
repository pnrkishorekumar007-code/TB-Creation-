const multer = require('multer');
const path = require('path');
const fs = require('fs');

const makeStorage = (subfolder) => {
  const dir = path.join(__dirname, '..', 'uploads', subfolder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
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

const uploadCover = multer({ storage: makeStorage('covers'), fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadPages = multer({ storage: makeStorage('pages'), fileFilter: imageFilter, limits: { fileSize: 8 * 1024 * 1024 } });
const uploadScript = multer({ storage: makeStorage('scripts'), fileFilter: scriptFilter, limits: { fileSize: 15 * 1024 * 1024 } });
const uploadAvatar = multer({ storage: makeStorage('avatars'), fileFilter: imageFilter, limits: { fileSize: 3 * 1024 * 1024 } });

module.exports = { uploadCover, uploadPages, uploadScript, uploadAvatar };
