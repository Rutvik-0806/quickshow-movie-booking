const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    ref: 'BookingData'
  },
  login_name: {
    type: String,
    required: true,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi'],
    required: true
  },
  // Card payment fields
  cardnumber: {
    type: String,
    required: function() {
      return this.paymentMethod === 'card';
    },
    validate: {
      validator: function(v) {
        if (this.paymentMethod === 'card') {
          return /^\d{16}$/.test(v.replace(/\s/g, '')); // 16 digits for card
        }
        return true;
      },
      message: 'Card number must be 16 digits'
    }
  },
  expirydate: {
    type: String,
    required: function() {
      return this.paymentMethod === 'card';
    },
    validate: {
      validator: function(v) {
        if (this.paymentMethod === 'card') {
          return /^(0[1-9]|1[0-2])\/\d{2}$/.test(v); // MM/YY format
        }
        return true;
      },
      message: 'Expiry date must be in MM/YY format'
    }
  },
  cvv: {
    type: String,
    required: function() {
      return this.paymentMethod === 'card';
    },
    validate: {
      validator: function(v) {
        if (this.paymentMethod === 'card') {
          return /^\d{3}$/.test(v); // 3 digits for CVV
        }
        return true;
      },
      message: 'CVV must be 3 digits'
    }
  },
  // UPI payment field
  upiid: {
    type: String,
    required: function() {
      return this.paymentMethod === 'upi';
    },
    validate: {
      validator: function(v) {
        if (this.paymentMethod === 'upi') {
          return /^[\w\.-]+@[\w\.-]+$/.test(v); // Basic UPI ID format
        }
        return true;
      },
      message: 'Invalid UPI ID format'
    }
  },
  // Common fields
  totalamount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Create indexes for faster queries
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ login_name: 1, paymentDate: -1 });
paymentSchema.index({ transactionId: 1 });

const PaymentData = mongoose.model('PaymentData', paymentSchema);

module.exports = PaymentData;