const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 80 },
    email: { type: String, required: true, maxlength: 254 },
    message: { type: String, required: true, maxlength: 2000 },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
