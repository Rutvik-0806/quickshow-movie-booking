const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  isSuccessful: {
    type: Boolean,
    default: true
  },
  otpVerifiedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'login'
});

// Index for better query performance
loginSchema.index({ email: 1, loginTime: -1 });
loginSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

const LoginData = mongoose.model('LoginData', loginSchema);

module.exports = LoginData;