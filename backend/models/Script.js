const mongoose = require('mongoose');

const scriptSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    synopsis: { type: String, default: '', maxlength: 2000 },
    genre: { type: String, default: 'General', maxlength: 50 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String, required: true, maxlength: 300 },
    approvalStatus: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'draft' },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

scriptSchema.index({ title: 'text', synopsis: 'text' });

module.exports = mongoose.model('Script', scriptSchema);
