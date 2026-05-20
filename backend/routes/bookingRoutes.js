const express = require('express');
const router = express.Router();
const BookingData = require('../models/BookingData');
const PaymentData = require('../models/PaymentData');

// Create a new booking with payment
router.post('/create-booking', async (req, res) => {
  try {
    const {
      login_name,
      password,
      moviename,
      selectedseatname,
      totalseat,
      ticket,
      theater,
      time,
      date,
      paymentMethod,
      paymentDetails,
      totalamount
    } = req.body;

    // Check for seat conflicts before creating booking
    const existingBookings = await BookingData.find({
      moviename,
      theater,
      date,
      time
    });

    // Get all currently booked seats for this show
    const bookedSeats = [];
    existingBookings.forEach(booking => {
      if (booking.selectedseatname && Array.isArray(booking.selectedseatname)) {
        bookedSeats.push(...booking.selectedseatname);
      }
    });

    // Check if any of the requested seats are already booked
    const conflictSeats = selectedseatname.filter(seat => bookedSeats.includes(seat));
    if (conflictSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats already booked: ${conflictSeats.join(', ')}. Please select different seats.`,
        conflictSeats
      });
    }

    // Generate unique booking ID
    const bookingId = 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    
    // Generate unique transaction ID
    const transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 8).toUpperCase();

    // Create booking record
    const newBooking = new BookingData({
      login_name,
      password,
      moviename,
      selectedseatname,
      totalseat,
      ticket,
      theater,
      time,
      date,
      bookingId,
      ticketdownload: 'no', // Initially no
      status: 'confirmed'
    });

    // Save booking
    const savedBooking = await newBooking.save();

    // Create payment record
    let paymentData = {
      bookingId,
      login_name,
      paymentMethod,
      totalamount,
      transactionId,
      paymentStatus: 'completed'
    };

    // Add payment method specific fields
    if (paymentMethod === 'card') {
      paymentData.cardnumber = paymentDetails.cardNumber;
      paymentData.expirydate = paymentDetails.expiry;
      paymentData.cvv = paymentDetails.cvv;
    } else if (paymentMethod === 'upi') {
      paymentData.upiid = paymentDetails.upiId;
    }

    const newPayment = new PaymentData(paymentData);
    const savedPayment = await newPayment.save();

    res.status(201).json({
      success: true,
      message: 'Booking and payment created successfully',
      data: {
        booking: savedBooking,
        payment: {
          transactionId: savedPayment.transactionId,
          paymentMethod: savedPayment.paymentMethod,
          totalamount: savedPayment.totalamount,
          paymentStatus: savedPayment.paymentStatus
        }
      }
    });

  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

// NEW: Get all bookings for a specific show (for seat availability checking)
router.post('/get-show-bookings', async (req, res) => {
  try {
    const { moviename, theater, date, time } = req.body;

    // Validate required fields
    if (!moviename || !theater || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: moviename, theater, date, time'
      });
    }

    // Get all bookings for the specific show
    const bookings = await BookingData.find({
      moviename,
      theater,
      date,
      time,
      status: 'confirmed' // Only confirmed bookings
    }).select('login_name selectedseatname totalseat bookingId bookingDate');

    // Log for debugging
    console.log(`Found ${bookings.length} bookings for ${moviename} at ${theater} on ${date} ${time}`);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
      show: {
        moviename,
        theater,
        date,
        time
      }
    });

  } catch (error) {
    console.error('Get show bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch show bookings',
      error: error.message
    });
  }
});

// Get all bookings for a user
router.get('/user-bookings/:login_name', async (req, res) => {
  try {
    const { login_name } = req.params;
    
    const bookings = await BookingData.find({ login_name })
      .sort({ bookingDate: -1 }) // Latest first
      .limit(50); // Limit to 50 recent bookings

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

// Get booking details with payment info
router.get('/booking-details/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await BookingData.findOne({ bookingId });
    const payment = await PaymentData.findOne({ bookingId });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        booking,
        payment
      }
    });

  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking details',
      error: error.message
    });
  }
});

// Update ticket download status
router.patch('/update-download-status/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const updatedBooking = await BookingData.findOneAndUpdate(
      { bookingId },
      { ticketdownload: 'yes' },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Download status updated successfully',
      data: updatedBooking
    });

  } catch (error) {
    console.error('Update download status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update download status',
      error: error.message
    });
  }
});

// Get payment details for a booking
router.get('/payment-details/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const payment = await PaymentData.findOne({ bookingId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment details not found'
      });
    }

    // Hide sensitive payment information
    const safePayment = {
      transactionId: payment.transactionId,
      paymentMethod: payment.paymentMethod,
      totalamount: payment.totalamount,
      currency: payment.currency,
      paymentStatus: payment.paymentStatus,
      paymentDate: payment.paymentDate
    };

    // Show partial card number if card payment
    if (payment.paymentMethod === 'card' && payment.cardnumber) {
      safePayment.cardnumber = '**** **** **** ' + payment.cardnumber.slice(-4);
    }

    // Show partial UPI ID if UPI payment
    if (payment.paymentMethod === 'upi' && payment.upiid) {
      const upiParts = payment.upiid.split('@');
      safePayment.upiid = upiParts[0].slice(0, 3) + '***@' + upiParts[1];
    }

    res.status(200).json({
      success: true,
      data: safePayment
    });

  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
});

// Get booking statistics for a user
router.get('/booking-stats/:login_name', async (req, res) => {
  try {
    const { login_name } = req.params;
    
    // Get total bookings
    const totalBookings = await BookingData.countDocuments({ login_name });
    
    // Get total tickets
    const totalTicketsResult = await BookingData.aggregate([
      { $match: { login_name } },
      { $group: { _id: null, totalTickets: { $sum: '$ticket' } } }
    ]);
    const totalTickets = totalTicketsResult[0]?.totalTickets || 0;
    
    // Get total amount spent
    const totalAmountResult = await PaymentData.aggregate([
      { $match: { login_name } },
      { $group: { _id: null, totalAmount: { $sum: '$totalamount' } } }
    ]);
    const totalAmount = totalAmountResult[0]?.totalAmount || 0;

    // Get recent bookings
    const recentBookings = await BookingData.find({ login_name })
      .sort({ bookingDate: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        totalTickets,
        totalAmount,
        recentBookings
      }
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking statistics',
      error: error.message
    });
  }
});

// NEW: Get seat availability for a specific show
router.post('/check-seat-availability', async (req, res) => {
  try {
    const { moviename, theater, date, time, requestedSeats } = req.body;

    if (!moviename || !theater || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: moviename, theater, date, time'
      });
    }

    // Get all bookings for this show
    const existingBookings = await BookingData.find({
      moviename,
      theater,
      date,
      time,
      status: 'confirmed'
    });

    // Get all booked seats
    const bookedSeats = [];
    existingBookings.forEach(booking => {
      if (booking.selectedseatname && Array.isArray(booking.selectedseatname)) {
        bookedSeats.push(...booking.selectedseatname);
      }
    });

    // If specific seats are requested, check their availability
    let unavailableSeats = [];
    if (requestedSeats && Array.isArray(requestedSeats)) {
      unavailableSeats = requestedSeats.filter(seat => bookedSeats.includes(seat));
    }

    res.status(200).json({
      success: true,
      data: {
        bookedSeats,
        unavailableSeats,
        isAvailable: unavailableSeats.length === 0,
        totalBookedSeats: bookedSeats.length,
        show: { moviename, theater, date, time }
      }
    });

  } catch (error) {
    console.error('Check seat availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check seat availability',
      error: error.message
    });
  }
});

// NEW: Cancel booking (if needed)
router.patch('/cancel-booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { login_name } = req.body;

    // Find the booking
    const booking = await BookingData.findOne({ bookingId, login_name });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or unauthorized'
      });
    }

    // Check if booking can be cancelled (e.g., not too close to show time)
    const showDateTime = new Date(`${booking.date} ${booking.time}`);
    const now = new Date();
    const timeDifference = showDateTime - now;
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference < 2) { // Cannot cancel within 2 hours of show
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel booking within 2 hours of show time'
      });
    }

    // Update booking status to cancelled
    const updatedBooking = await BookingData.findOneAndUpdate(
      { bookingId, login_name },
      { status: 'cancelled' },
      { new: true }
    );

    // Update payment status
    await PaymentData.findOneAndUpdate(
      { bookingId },
      { paymentStatus: 'refunded' }
    );

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: updatedBooking
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
});

module.exports = router;