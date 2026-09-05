const mongoose = require('mongoose');

const comicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    genre: { type: String, default: 'General' },
    tags: [{ type: String }],
    status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
    approvalStatus: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'draft' },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

comicSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Comic', comicSchema);
