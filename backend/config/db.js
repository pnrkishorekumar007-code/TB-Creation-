const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    // In serverless (Vercel) we must NOT process.exit — it kills the whole
    // function and returns an empty 500 with no error details.
    console.error('MongoDB connection error:', err.message);
    if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
