const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Media = require('../models/Media');

// Short-lived capability token. A tokenised URL is only as good as a
// presigned S3 URL: whoever holds it can fetch the file until it expires.
const TOKEN_TTL_MS = 60 * 60 * 1000;

const secret = () => process.env.MEDIA_SIGNING_SECRET || process.env.JWT_SECRET;

// Once a file is public it never becomes private again (approval/publish is a
// one-way door), so a file→public map is always safe to trust after first
// resolution. Caches only monotone "true" entries.
const publicCache = new Map();

/** Record an uploaded file so the /uploads gate knows its owner + visibility. */
const registerMedia = async ({ file, owner, kind, ref = '', public: isPublic = false }) => {
  if (!file || typeof file !== 'string' || !file.startsWith('/uploads/')) return null;
  try {
    const doc = await Media.findOneAndUpdate(
      { file },
      {
        $setOnInsert: { file, kind, ref },
        $set: { owner, ...(isPublic ? { public: true } : {}) },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (isPublic) publicCache.set(file, true);
    else publicCache.delete(file);
    return doc;
  } catch (err) {
    // Indexing must never fail an upload or a content save.
    return null;
  }
};

/** Flip files to public once their content is approved or published. */
const publishFiles = async (files) => {
  const list = (files || []).filter((f) => typeof f === 'string' && f.startsWith('/uploads/'));
  if (list.length === 0) return;
  for (const file of list) publicCache.set(file, true);
  try {
    await Media.updateMany({ file: { $in: list } }, { $set: { public: true } });
  } catch (err) {
    // Best effort; the memory cache stays correct for the process lifetime.
  }
};

/** Look up whether a file is public, consulting the monotone cache first. */
const getMediaPublic = async (file) => {
  if (publicCache.get(file)) return true;
  const doc = await Media.findOne({ file }).select('public').lean().catch(() => null);
  const isPublic = !!(doc && doc.public);
  if (isPublic) publicCache.set(file, true);
  return isPublic;
};

/**
 * Permanently remove media rows, their cache entries, and (best effort) the
 * backing files on disk. Used when content (comic/script) is deleted so stale
 * private files and index rows don't accumulate.
 */
const deleteMedia = async (files) => {
  const list = (files || []).filter((f) => typeof f === 'string' && f.startsWith('/uploads/'));
  if (list.length === 0) return;
  for (const file of list) publicCache.delete(file);
  try {
    await Media.deleteMany({ file: { $in: list } });
  } catch (err) {
    // Best effort; the memory cache is already cleared for this process.
  }
  for (const file of list) {
    try {
      fs.unlinkSync(path.join(__dirname, '..', file));
    } catch (e) {
      // File already gone or on a read-only/ephemeral mount — fine.
    }
  }
};

/** Get the full visibility record (exists? public?) for the /uploads handler. */
const findMedia = async (file) => {
  const cached = publicCache.get(file);
  if (cached) return { exists: true, public: true };
  const doc = await Media.findOne({ file }).select('public').lean().catch(() => null);
  const record = { exists: !!doc, public: !!(doc && doc.public) };
  if (record.public) publicCache.set(file, true);
  return record;
};

/** Append a short-lived signed token to a media path. */
const signMediaUrl = (file) => {
  const expires = Date.now() + TOKEN_TTL_MS;
  const sig = crypto.createHmac('sha256', secret()).update(`${file}:${expires}`).digest('hex');
  return `${file}?e=${expires}&s=${sig}`;
};

/** Constant-time check that a URL carries a valid, unexpired token for `file`. */
const verifyMediaUrl = (file, query = {}) => {
  const { e, s } = query;
  if (!s || typeof s !== 'string') return false;
  const exp = Number(e);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = crypto.createHmac('sha256', secret()).update(`${file}:${exp}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(s);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

module.exports = {
  registerMedia,
  publishFiles,
  getMediaPublic,
  findMedia,
  signMediaUrl,
  verifyMediaUrl,
  deleteMedia,
};