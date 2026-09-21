require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// Production configuration guard. A serverless cold start has no process to
// exit cleanly — the old process.exit(1) here killed the whole Vercel function,
// so one missing env var turned every /api/* route into a blank 500. The gate
// is kept fail-closed (a weak secret must never sign auth/media URLs) but
// converted into a config error that an /api middleware rejects each request
// with, so the fix is a redeploy rather than a mysterious blanket outage.
let configError = null;
if (process.env.NODE_ENV === 'production') {
  const weakSecret = !process.env.JWT_SECRET
    || process.env.JWT_SECRET === 'replace_this_with_a_long_random_secret'
    || process.env.JWT_SECRET.length < 32;
  if (weakSecret) {
    // eslint-disable-next-line no-console
    console.error('CONFIG ERROR: NODE_ENV=production requires a real JWT_SECRET (>= 32 chars) in the Vercel environment.');
    configError = 'Server is awaiting configuration (JWT_SECRET missing or weak).';
  }
  // MEDIA_SIGNING_SECRET falls back to JWT_SECRET, so it never weakens the
  // gate; it only exists so the media URL key can be rotated independently.
}
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const comicRoutes = require('./routes/comicRoutes');
const scriptRoutes = require('./routes/scriptRoutes');
const authorRoutes = require('./routes/authorRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const commentRoutes = require('./routes/commentRoutes');
const followRoutes = require('./routes/followRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const readingHistoryRoutes = require('./routes/readingHistoryRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const likeRoutes = require('./routes/likeRoutes');
const feedRoutes = require('./routes/feedRoutes');
const reportRoutes = require('./routes/reportRoutes');
const searchRoutes = require('./routes/searchRoutes');
const statsRoutes = require('./routes/statsRoutes');

connectDB();

const app = express();

// Vercel (and most proxies) terminate TLS and forward the real client IP in
// X-Forwarded-For, which the rate limiters key on. Without this the limiters
// all see the proxy's IP and are effectively disabled.
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// When CLIENT_URL is unset, send no CORS headers at all (fail closed) instead of
// falling back to the package default `*`. Same-origin requests never need CORS.
// Origins are allow-listed exactly: a callback that returns false emits no
// Access-Control-Allow-Origin header, so browsers refuse to share responses
// with any origin other than the configured frontend.
const allowedOrigins = process.env.CLIENT_URL ? new Set([process.env.CLIENT_URL]) : new Set();
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // same-origin / non-browser client
    cb(null, allowedOrigins.has(origin));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Fail-closed API gate: when boot validation detected a weak secret, reject
// every /api request with a clean 503 instead of crashing the cold start.
app.use('/api', (req, res, next) => {
  if (configError) return res.status(503).json({ message: configError });
  next();
});

// Uploaded files: the real content types were pinned by the magic-byte upload
// validation, so the only types on disk are images/pdf/txt/docx. Files are no
// longer served unconditionally — the gate streams approved/published content
// to everyone, draft/scheduled/rejected content only to the owner via a
// short-lived signed token the API embeds in the URLs it returns.
const serveMedia = require('./middleware/serveMedia');
app.use('/uploads', serveMedia);

// General API limiter — generous, just stops runaway scripts/bots.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please slow down and try again shortly.' },
});
app.use('/api', generalLimiter);

// Tighter limiter specifically for auth endpoints — these are the ones brute-force attacks target.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please wait a while before trying again.' },
});
app.use('/api/auth', authLimiter);

// Tighter limiter for content-creation / social write endpoints. The generous
// general limiter stops runaway scripts but a single logged-in client can still
// spam comments, votes, reports, bookmarks, likes and contact messages. This
// tier only applies to writes, so page loads and reads are unaffected.
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please slow down and try again shortly.' },
});
const WRITE_PREFIXES = [
  '/comments', '/reports', '/contact', '/likes', '/ratings', '/follows', '/bookmarks', '/history',
  // Content creation + uploads: cover/pages/script/avatar writes and admin review
  // actions share the same write budget (reads are never limited by this tier).
  '/comics', '/scripts', '/authors/me', '/admin',
];
app.use('/api', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();
  if (!WRITE_PREFIXES.some((p) => req.path.startsWith(p))) return next();
  return writeLimiter(req, res, next);
});

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState; // 0 disconnected, 1 connected, 2 connecting
  res.json({
    status: configError ? 'unconfigured' : 'ok',
    message: 'TB Creation API Running',
    db: dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/comics', comicRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/history', readingHistoryRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/stats', statsRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const multer = require('multer');
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id format' });
  }
  if (err) {
    console.error(err);
    const status = err.status || 500;
    if (status >= 500) return res.status(status).json({ message: 'Server error' });
    return res.status(status).json({ message: err.message || 'Request error' });
  }
  next();
});

// Start the HTTP listener only when this file is run directly
// (`node backend/server.js` or `npm run server`). When Vercel loads the app
// through api/index.js, require.main is the function bootstrap, so no
// persistent listener is created — the exported `app` serves the requests.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export the Express app so the Vercel serverless function (api/index.js) mounts
// the exact same application instance instead of an empty module.
module.exports = app;
