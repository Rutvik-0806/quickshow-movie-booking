require('dotenv').config();

const mongoose = require('mongoose');

const connectDB = async () => {
  const uri =
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movieproject';

  try {
    const conn = await mongoose.connect(uri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;