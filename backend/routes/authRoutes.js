const express = require('express');
const router = express.Router();
const LoginData = require('../models/LoginData');
const SignupData = require('../models/SignupData');

// Signup Route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, otp, signupTime } = req.body;

    // Check if user already exists
    const existingUser = await SignupData.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const newUser = new SignupData({
      name,
      email,
      password,
      otp,
      signupTime: signupTime || new Date(),
      isVerified: true,
      otpVerifiedAt: new Date()
    });

    await newUser.save();

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during signup',
      error: error.message
    });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password, otp, loginTime } = req.body;

    // Find user in signup collection
    const user = await SignupData.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Save login data
    const loginRecord = new LoginData({
      email,
      password, // In production, don't save plain password
      otp,
      loginTime: loginTime || new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      isSuccessful: true,
      otpVerifiedAt: new Date()
    });

    await loginRecord.save();

    // Update last login in user record
    user.lastLogin = new Date();
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      loginId: loginRecord._id
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// Get all login records (for admin)
router.get('/login-records', async (req, res) => {
  try {
    const loginRecords = await LoginData.find()
      .sort({ loginTime: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      records: loginRecords,
      count: loginRecords.length
    });

  } catch (error) {
    console.error('Error fetching login records:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get all users (for admin)
router.get('/users', async (req, res) => {
  try {
    const users = await SignupData.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      users: users,
      count: users.length
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get user profile
router.get('/profile/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await SignupData.findOne({ email }).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;