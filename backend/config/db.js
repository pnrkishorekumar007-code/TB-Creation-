const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    // Log a generic message only: Mongo connection errors can echo the full
    // connection string (including embedded credentials) back out. Do NOT
    // process.exit(1) here — in a Vercel serverless cold start that kills the
    // whole function and turns every /api/* route into a blank 500. Without
    // the exit, requests fail at the query site with a clean JSON 500 and the
    // next cold start re-attempts the connection after the env is fixed.
    console.error('MongoDB connection error:', err.name || 'Unknown error');
  }
};

module.exports = connectDB;
