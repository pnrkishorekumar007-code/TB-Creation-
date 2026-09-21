const { serverError } = require('../utils/httpError');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const TOKEN_COOKIE = 'tb_token';
const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 30 * 24 * 60 * 60 * 1000,
  path: '/',
};

const setTokenCookie = (res, token) => {
  res.cookie(TOKEN_COOKIE, token, TOKEN_COOKIE_OPTIONS);
};

const clearTokenCookie = (res) => {
  res.clearCookie(TOKEN_COOKIE, { ...TOKEN_COOKIE_OPTIONS, maxAge: undefined });
};

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  bio: user.bio,
  avatarUrl: user.avatarUrl,
});

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const allowedRole = role === 'author' ? 'author' : 'reader';

    const user = await User.create({ name, email: email.toLowerCase(), password: hashed, role: allowedRole });
    const token = signToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({
      token,
      user: serializeUser(user),
    });
  } catch (err) {
    serverError(res, err);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user._id);
    setTokenCookie(res, token);
    res.json({
      token,
      user: serializeUser(user),
    });
  } catch (err) {
    serverError(res, err);
  }
};

const me = async (req, res) => {
  res.json({ user: serializeUser(req.user) });
};

const logout = async (req, res) => {
  clearTokenCookie(res);
  res.json({ message: 'Logged out' });
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always respond the same way whether or not the email exists, so no one can probe which emails are registered.
    if (!user) {
      return res.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${rawToken}`;

    // No email service is configured yet — log the link only outside
    // production (server logs are a sensitive place for reset credentials).
    // Wire this to a real provider (SendGrid, Postmark, SES, etc.) before
    // going to production.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Password reset requested for ${user.email}: ${resetUrl}`);
    }

    res.json({
      message: 'If that email is registered, a reset link has been sent.',
      devResetUrl: process.env.NODE_ENV === 'production' ? undefined : resetUrl,
    });
  } catch (err) {
    serverError(res, err);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired' });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password updated. You can now log in.' });
  } catch (err) {
    serverError(res, err);
  }
};

module.exports = { signup, login, me, logout, forgotPassword, resetPassword, serializeUser };
