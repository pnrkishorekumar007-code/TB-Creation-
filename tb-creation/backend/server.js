require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
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

connectDB();

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

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

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const multer = require('multer');
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err) {
    console.error(err);
    return res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
  next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
