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
  res.status(500).json({ message: 'An unexpected error occurred' });
};

module.exports = { serverError };