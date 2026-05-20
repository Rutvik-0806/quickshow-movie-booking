const mongoose = require('mongoose');

const connectDB = async (retries = 5, delayMs = 5000) => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && !process.env.MONGODB_URI) {
    console.error(
      'FATAL: MONGODB_URI is not set. In Render → Environment, add your MongoDB Atlas connection string.'
    );
    process.exit(1);
  }

  const uri =
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movieproject';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      console.log(`Database Name: ${conn.connection.name}`);
      return;
    } catch (error) {
      console.error(
        `MongoDB connection attempt ${attempt}/${retries} failed:`,
        error.message
      );
      if (attempt === retries) {
        console.error(
          'Could not connect to MongoDB. Check MONGODB_URI and Atlas Network Access (allow 0.0.0.0/0).'
        );
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
};

module.exports = connectDB;
