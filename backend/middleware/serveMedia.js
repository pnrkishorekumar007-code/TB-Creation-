const path = require('path');
const fs = require('fs');
const { findMedia, verifyMediaUrl, registerMedia } = require('../utils/mediaAccess');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Only subfolder-relative names composed of safe characters. This also blocks
// path traversal ("..", absolute paths, encoded slashes never reach here).
const SAFE_PATH = /^\/[A-Za-z0-9_-]+\/[A-Za-z0-9][A-Za-z0-9._-]*$/;

/**
 * Replaces the previous public express.static('/uploads') handler.
 *
 * Every file uploaded through the product is registered at upload time with
 * public: false, so its filename alone grants nothing. Files are streamed only
 * when:
 *   - their owning content is approved/published (public: true), or
 *   - the request carries a short-lived signed token that the API embeds in
 *     the URLs it returns to the owner/admin, or
 *   - the file predates this gate (migration: treated as public).
 */
const serveMedia = async (req, res) => {
  const relative = req.path;
  if (!SAFE_PATH.test(relative) || relative.includes('..')) {
    return res.status(404).json({ message: 'Not found' });
  }

  const absolute = path.join(UPLOAD_DIR, relative);
  if (!absolute.startsWith(path.join(UPLOAD_DIR) + path.sep)) {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    await fs.promises.access(absolute, fs.constants.R_OK);
  } catch (err) {
    return res.status(404).json({ message: 'Not found' });
  }

  const fullPath = `/uploads${relative}`;

  let record;
  try {
    record = await findMedia(fullPath);
  } catch (err) {
    record = { exists: false, public: false };
  }

  if (!record.public) {
    if (!record.exists) {
      // Legacy file that predates the access index: keep serving it, register
      // it as public so this decision is persisted.
      await registerMedia({ file: fullPath, owner: null, kind: 'legacy', ref: '', public: true });
    } else if (!verifyMediaUrl(fullPath, req.query)) {
      // Known private file without a valid token -> indistinguishable from 404.
      return res.status(404).json({ message: 'Not found' });
    }
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', record.public ? 'public, max-age=86400' : 'private, max-age=300');
  res.sendFile(relative, { root: UPLOAD_DIR }, (err) => {
    if (err && !res.headersSent) {
      res.status(err.status === 404 ? 404 : 500).json({ message: err.status === 404 ? 'Not found' : 'Server error' });
    }
  });
};

module.exports = serveMedia;