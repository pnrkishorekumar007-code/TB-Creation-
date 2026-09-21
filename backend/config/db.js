const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    // Log a generic message only: Mongo connection errors can echo the full
    // connection string (including embedded credentials) back out.
    console.error('MongoDB connection error:', err.name || 'Unknown error');
    process.exit(1);
  }
};

module.exports = connectDB;
