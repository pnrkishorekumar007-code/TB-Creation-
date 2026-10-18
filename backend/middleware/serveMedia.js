const path = require('path');
const fs = require('fs');
const { findMedia, verifyMediaUrl, registerMedia } = require('../utils/mediaAccess');
const { cloudinary, enabled: cloudEnabled } = require('../config/cloudinary');
const { parseMediaPath } = require('../utils/mediaPath');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Only subfolder-relative names composed of safe characters. This also blocks
// path traversal ("..", absolute paths, encoded slashes never reach here).
const SAFE_PATH = /^\/[A-Za-z0-9_-]+\/[A-Za-z0-9][A-Za-z0-9._-]*$/;

const CONTENT_TYPES = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
};
const contentTypeFor = (filename) =>
  CONTENT_TYPES[String(filename).split('.').pop().toLowerCase()] || 'application/octet-stream';

/**
 * Serves files under /uploads, replacing the previous public express.static.
 *
 * Every uploaded file is registered at upload time with public: false, so its
 * filename alone grants nothing. A file is streamed only when:
 *   - its owning content is approved/published (public: true), or
 *   - the request carries a short-lived signed token the API embeds in the
 *     URLs it returns to the owner/admin, or
 *   - the file predates this gate (migration: treated as public).
 *
 * The bytes live in Cloudinary when credentials are configured (the app proxies
 * them so the Cloudinary URL is never exposed and the access gate is preserved),
 * or on local disk otherwise.
 */
const serveMedia = async (req, res) => {
  const relative = req.path;
  if (!SAFE_PATH.test(relative) || relative.includes('..')) {
    return res.status(404).json({ message: 'Not found' });
  }

  const fullPath = `/uploads${relative}`;

  if (!cloudEnabled) {
    const absolute = path.join(UPLOAD_DIR, relative);
    if (!absolute.startsWith(UPLOAD_DIR + path.sep)) {
      return res.status(404).json({ message: 'Not found' });
    }
    try {
      await fs.promises.access(absolute, fs.constants.R_OK);
    } catch (err) {
      return res.status(404).json({ message: 'Not found' });
    }
  }

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

  if (cloudEnabled) {
    const parsed = parseMediaPath(fullPath);
    if (!parsed) return res.status(404).json({ message: 'Not found' });

    const url = cloudinary.url(parsed.publicId, {
      resource_type: parsed.resourceType,
      type: 'upload',
      secure: true,
      ...(parsed.format ? { format: parsed.format } : {}),
    });

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const upstream = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      if (!upstream.ok) return res.status(404).json({ message: 'Not found' });
      const buffer = Buffer.from(await upstream.arrayBuffer());
      res.setHeader('Content-Type', upstream.headers.get('content-type') || contentTypeFor(parsed.filename));
      return res.send(buffer);
    } catch (err) {
      return res.status(502).json({ message: 'Media temporarily unavailable' });
    }
  }

  return res.sendFile(relative, { root: UPLOAD_DIR }, (err) => {
    if (err && !res.headersSent) {
      res.status(err.status === 404 ? 404 : 500).json({ message: err.status === 404 ? 'Not found' : 'Server error' });
    }
  });
};

module.exports = serveMedia;
