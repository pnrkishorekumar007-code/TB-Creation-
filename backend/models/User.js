const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    password: { type: String, required: true },
    role: { type: String, enum: ['reader', 'author', 'admin'], default: 'reader' },
    isBanned: { type: Boolean, default: false },
    // Signup stays unusable until the address is proven reachable: fake or
    // typo'd emails never receive the link, so they can never log in.
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },
    bio: { type: String, default: '', maxlength: 500 },
    avatarUrl: { type: String, default: '' },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
