const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getToken = (req) => {
  // Prefer the httpOnly session cookie (set at login). Fall back to the
  // Authorization header for clients/scripts not using cookies.
  if (req.cookies && req.cookies.tb_token) return req.cookies.tb_token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) return authHeader.split(' ')[1];
  return null;
};

const protect = async (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  const token = getToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

module.exports = { protect, requireRole, optionalAuth };
