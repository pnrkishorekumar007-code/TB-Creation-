const serverError = (res, err) => {
  console.error('[API error]', err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id format' });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: 'That value is already in use' });
  }
  // Errors deliberately tagged as client errors (e.g. malformed query params)
  // must surface as their status, not as an opaque 500.
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ message: err.message || 'Bad request' });
  }
  res.status(500).json({ message: 'An unexpected error occurred' });
};

module.exports = { serverError };