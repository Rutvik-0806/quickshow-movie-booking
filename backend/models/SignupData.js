const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const signupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  otp: {
    type: String,
    required: true
  },
  signupTime: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  otpVerifiedAt: {
    type: Date,
    default: Date.now
  },
  profileImage: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'signup'
});

// Hash password before saving
signupSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
signupSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Index for better query performance
signupSchema.index({ email: 1 });
signupSchema.index({ createdAt: -1 });

const SignupData = mongoose.model('SignupData', signupSchema);

module.exports = SignupData;