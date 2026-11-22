const { serverError } = require('../utils/httpError');
const { sendMail } = require('../utils/mailer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const TOKEN_COOKIE = 'tb_token';
const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  // 'none' lets the cookie work cross-site (Vercel frontend -> Render API);
  // 'lax' keeps local http://localhost dev working, where 'none' is rejected.
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

// Stores a hashed, single-use token and emails the raw one. Returns the link
// only when nothing was emailed outside production, so local testing works
// without SMTP (same fallback as forgotPassword).
const issueVerificationEmail = async (user) => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.emailVerificationExpires = Date.now() + VERIFY_TTL_MS;
  await user.save();

  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email/${rawToken}`;
  const sent = await sendMail({
    to: user.email,
    subject: 'Verify your TB Creation email',
    text: `Confirm this address to finish creating your TB Creation account. The link works for 24 hours:\n${verifyUrl}\n\nIf you didn't sign up, ignore this email.`,
    html: `<p>Confirm this address to finish creating your TB Creation account. The link works for 24 hours:</p><p><a href="${verifyUrl}">Verify my email</a></p><p>If you didn't sign up, ignore this email.</p>`,
  }).catch((err) => {
    // eslint-disable-next-line no-console
    console.error('[mailer] verification email failed:', err.message);
    return false;
  });

  if (!sent && process.env.NODE_ENV !== 'production') {
    console.log(`Email verification requested for ${user.email}: ${verifyUrl}`);
  }
  return sent || process.env.NODE_ENV === 'production' ? undefined : verifyUrl;
};

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

    // No session yet: an unverified account must not be usable, otherwise a
    // typo'd or non-existent address is already "logged in".
    const devVerifyUrl = await issueVerificationEmail(user);

    res.status(201).json({
      message: 'Account created. Check your inbox to verify your email, then log in.',
      email: user.email,
      devVerifyUrl,
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
    if (user.isBanned) return res.status(403).json({ message: 'This account has been suspended.' });
    if (!user.emailVerified) {
      // `code` lets the UI offer "resend" without string-matching the message.
      return res.status(403).json({
        code: 'EMAIL_UNVERIFIED',
        message: 'Please verify your email address first. Check your inbox for the link we sent.',
      });
    }

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

// Session probe used on every page load. Guests get { user: null } (200) rather
// than a 401, so the browser console stays clean for logged-out visitors.
const me = async (req, res) => {
  res.json({ user: req.user ? serializeUser(req.user) : null });
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

    // Sent before responding (not fire-and-forget): on Vercel an unawaited send
    // is killed when the response returns. A delivery failure is logged but
    // never surfaced — only registered emails reach this line, so any different
    // response would reveal which accounts exist.
    const sent = await sendMail({
      to: user.email,
      subject: 'Reset your TB Creation password',
      text: `Someone requested a password reset for this account.\n\nIf it was you, open this link within 1 hour:\n${resetUrl}\n\nIf you didn't request it, ignore this email.`,
      html: `<p>Someone requested a password reset for this account.</p><p>If it was you, open this link within 1 hour:</p><p><a href="${resetUrl}">Reset your password</a></p><p>If you didn't request it, ignore this email.</p>`,
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[mailer] password reset delivery failed:', err.message);
      return false;
    });

    // No SMTP configured (or the send failed): log the link only outside
    // production — server logs are a sensitive place for reset credentials.
    if (!sent && process.env.NODE_ENV !== 'production') {
      console.log(`Password reset requested for ${user.email}: ${resetUrl}`);
    }

    res.json({
      message: 'If that email is registered, a reset link has been sent.',
      devResetUrl: sent || process.env.NODE_ENV === 'production' ? undefined : resetUrl,
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
    // Following a reset link already proves inbox access, so don't leave the
    // account stuck behind the verification wall afterwards.
    user.emailVerified = true;
    await user.save();

    res.json({ message: 'Password updated. You can now log in.' });
  } catch (err) {
    serverError(res, err);
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Verification token is required' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'This verification link is invalid or has expired' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.json({ message: 'Email verified. You can now log in.' });
  } catch (err) {
    serverError(res, err);
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: String(email).toLowerCase() });
    // Same answer whether the account is missing, already verified, or real,
    // so this cannot be used to probe which emails are registered.
    const devVerifyUrl = user && !user.emailVerified ? await issueVerificationEmail(user) : undefined;

    res.json({
      message: 'If that email needs verification, a new link has been sent.',
      devVerifyUrl,
    });
  } catch (err) {
    serverError(res, err);
  }
};

module.exports = {
  signup,
  login,
  me,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  serializeUser,
};
