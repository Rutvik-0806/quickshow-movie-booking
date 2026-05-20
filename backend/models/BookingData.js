const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  login_name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  moviename: {
    type: String,
    required: true,
    trim: true
  },
  selectedseatname: [{
    type: String,
    required: true
  }],
  totalseat: {
    type: Number,
    required: true,
    min: 1
  },
  ticket: {
    type: Number,
    required: true,
    min: 1
  },
  theater: {
    type: String,
    required: true,
    trim: true
  },
  time: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  ticketdownload: {
    type: String,
    enum: ['yes', 'no'],
    default: 'no'
  },
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['confirmed', 'completed', 'cancelled'],
    default: 'confirmed'
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Create index for faster queries
bookingSchema.index({ login_name: 1, bookingDate: -1 });
bookingSchema.index({ bookingId: 1 });

const BookingData = mongoose.model('BookingData', bookingSchema);

module.exports = BookingData;