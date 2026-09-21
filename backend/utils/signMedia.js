const Media = require('../models/Media');
const { signMediaUrl } = require('./mediaAccess');

// A bare media path as stored in the DB, e.g. "/uploads/covers/x.bin.png".
// Already-signed URLs (they contain "?") are intentionally excluded.
const UPLOAD_RE = /^\/uploads\/[A-Za-z0-9][A-Za-z0-9._/()-]*$/;

const collectPaths = (value, out) => {
  if (typeof value === 'string') {
    if (UPLOAD_RE.test(value)) out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) collectPaths(v, out);
    return;
  }
  if (isPlainObject(value)) {
    for (const key of Object.keys(value)) collectPaths(value[key], out);
  }
};

// Rewriting must only descend into *plain* objects. Mongoose payloads carry
// Buffers (ObjectIds), Dates, and model subdocuments; converting those to
// {0:..., 1:...}-style objects corrupts ids and timestamps in every response.
// Passing them through untouched lets res.json() serialize them normally.
const isPlainObject = (value) =>
  value !== null && typeof value === 'object'
  && (value.constructor === Object || Object.getPrototypeOf(value) === null);

const rewrite = (value, publicSet) => {
  if (typeof value === 'string') {
    return UPLOAD_RE.test(value) && !publicSet.has(value) ? signMediaUrl(value) : value;
  }
  if (Array.isArray(value)) return value.map((v) => rewrite(v, publicSet));
  if (isPlainObject(value)) {
    const out = {};
    for (const key of Object.keys(value)) out[key] = rewrite(value[key], publicSet);
    return out;
  }
  return value;
};

/**
 * Walk a payload and replace every non-public /uploads path with a short-lived
 * signed URL. Public files (approved/published content, avatars) are left
 * untouched so they keep loading tokenless for everyone. Files with no index
 * entry yet are treated as legacy/public and left untouched.
 *
 * Returns a new plain object; never mutates the input (safe for mongoose docs).
 */
const signPayloadMedia = async (payload) => {
  if (payload === undefined || payload === null) return payload;
  const paths = [];
  collectPaths(payload, paths);
  if (paths.length === 0) return payload;

  const docs = await Media.find({ file: { $in: paths } }).select('file public').lean().catch(() => []);
  const publicSet = new Set(docs.filter((d) => d.public).map((d) => d.file));

  return rewrite(payload, publicSet);
};

module.exports = { signPayloadMedia };