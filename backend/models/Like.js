const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comic: { type: mongoose.Schema.Types.ObjectId, ref: 'Comic' },
    script: { type: mongoose.Schema.Types.ObjectId, ref: 'Script' },
  },
  { timestamps: true }
);

likeSchema.index({ user: 1, comic: 1 }, { unique: true, sparse: true });
likeSchema.index({ user: 1, script: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Like', likeSchema);
