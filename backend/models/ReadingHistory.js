const mongoose = require('mongoose');

const readingHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comic: { type: mongoose.Schema.Types.ObjectId, ref: 'Comic', required: true },
    lastChapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  },
  { timestamps: true }
);

readingHistorySchema.index({ user: 1, comic: 1 }, { unique: true });
readingHistorySchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('ReadingHistory', readingHistorySchema);
