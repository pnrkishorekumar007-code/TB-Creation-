const fs = require('fs');
const os = require('os');
const path = require('path');
const MediaBlob = require('../models/MediaBlob');

/**
 * Storage driver for uploaded files.
 *
 *  disk (default, local dev): files live in backend/uploads.
 *  db   (MEDIA_STORAGE=db, or automatically on Vercel): files are written to a
 *       writable temp dir for fast serving AND persisted in MongoDB. If the
 *       temp copy disappears (redeploy, cold start, new instance) it is
 *       restored from MongoDB on the next request.
 *
 * Set MEDIA_STORAGE=disk to force plain disk storage anywhere.
 */
const useDb =
  process.env.MEDIA_STORAGE === 'db' ||
  (!!process.env.VERCEL && process.env.MEDIA_STORAGE !== 'disk');

const UPLOAD_ROOT = useDb
  ? path.join(os.tmpdir(), 'tb-uploads')
  : path.join(__dirname, '..', 'uploads');

const toDisk = (fullPath) => path.join(UPLOAD_ROOT, fullPath.replace(/^\/uploads\//, ''));

/** Persist an already-written upload ("/uploads/covers/x.png") to MongoDB. */
const persistFile = async (fullPath) => {
  if (!useDb) return;
  try {
    const data = await fs.promises.readFile(toDisk(fullPath));
    await MediaBlob.findOneAndUpdate(
      { file: fullPath },
      { $set: { data, size: data.length } },
      { upsert: true }
    );
  } catch (err) {
    console.error('[media] could not persist', fullPath, err.message);
  }
};

/**
 * Make sure a file ("/covers/x.png", relative to the uploads root) exists on
 * local disk, restoring it from MongoDB when needed. Returns true if servable.
 */
const ensureLocal = async (relative) => {
  const absolute = path.join(UPLOAD_ROOT, relative);
  try {
    await fs.promises.access(absolute, fs.constants.R_OK);
    return true;
  } catch (e) {
    if (!useDb) return false;
  }
  try {
    const blob = await MediaBlob.findOne({ file: `/uploads${relative}` });
    if (!blob) return false;
    await fs.promises.mkdir(path.dirname(absolute), { recursive: true });
    await fs.promises.writeFile(absolute, blob.data);
    return true;
  } catch (err) {
    console.error('[media] could not restore', relative, err.message);
    return false;
  }
};

/** Remove a file from disk and (in db mode) from MongoDB. Best effort. */
const removeFile = async (fullPath) => {
  try {
    await fs.promises.unlink(toDisk(fullPath));
  } catch (e) {
    /* already gone */
  }
  if (useDb) {
    try {
      await MediaBlob.deleteOne({ file: fullPath });
    } catch (e) {
      /* best effort */
    }
  }
};

module.exports = { UPLOAD_ROOT, useDb, persistFile, ensureLocal, removeFile };
