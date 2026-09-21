const mongoose = require('mongoose');

/**
 * Access index for uploaded media.
 *
 * Every uploaded file gets a row here at upload time. Files start private
 * (public: false) and are flipped to public only when their owning content
 * is approved/published (or, for avatars, immediately). The /uploads static
 * handler consults this index before streaming a file, so draft/scheduled/
 * rejected content is no longer reachable by a guessed filename.
 */
const mediaSchema = new mongoose.Schema(
  {
    file: { type: String, required: true, unique: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    kind: {
      type: String,
      enum: ['cover', 'page', 'script', 'avatar', 'legacy'],
      required: true,
    },
    ref: { type: String, default: '' },
    public: { type: Boolean, default: false },
  },
  { timestamps: true }
);

mediaSchema.index({ ref: 1, kind: 1 });

module.exports = mongoose.model('Media', mediaSchema);