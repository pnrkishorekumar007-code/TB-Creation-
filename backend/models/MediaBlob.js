const mongoose = require('mongoose');

/**
 * Durable copy of an uploaded file. Only used when MEDIA_STORAGE=db (or on
 * Vercel), where the local disk is read-only/ephemeral and would otherwise
 * lose every upload on redeploy or scale-to-zero. Access control still lives
 * in the Media collection + signed URLs; this just keeps the bytes safe.
 */
const mediaBlobSchema = new mongoose.Schema(
  {
    file: { type: String, required: true, unique: true, trim: true },
    data: { type: Buffer, required: true },
    size: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MediaBlob', mediaBlobSchema);
