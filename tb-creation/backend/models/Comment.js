const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comic: { type: mongoose.Schema.Types.ObjectId, ref: 'Comic', required: true },
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    text: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

commentSchema.index({ comic: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
