const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    comic: { type: mongoose.Schema.Types.ObjectId, ref: 'Comic', required: true },
    title: { type: String, required: true },
    order: { type: Number, required: true },
    pageImages: [{ type: String }],
    publishAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chapter', chapterSchema);
