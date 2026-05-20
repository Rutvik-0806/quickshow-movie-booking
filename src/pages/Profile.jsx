import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  CalendarIcon, 
  TicketIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { apiUrl } from '../config/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [userBookings, setUserBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ticket price per seat
  const ticketPrice = 500;

  // Initialize edited fields when user data is available
  useEffect(() => {
    if (user) {
      // Extract username from email if name is not properly set
      const displayName = user.name && user.name !== 'John Doe' && user.name.trim() !== '' 
        ? user.name 
        : user.email ? user.email.split('@')[0] : 'User';
      
      setEditedName(displayName);
      setEditedEmail(user.email || '');
    }
  }, [user]);

  // Get actual user display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    
    // If name exists and is not the default "John Doe", use it
    if (user.name && user.name !== 'John Doe' && user.name.trim() !== '') {
      return user.name;
    }
    
    // Otherwise, extract from email or use saved name from localStorage
    if (user.email) {
      // Check if we have a custom name stored in localStorage
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          if (userData.name && userData.name !== 'John Doe') {
            return userData.name;
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
        }
      }
      
      // Extract username from email as fallback
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  // Fetch user bookings from database
  const fetchUserBookingsFromDB = async () => {
    const userName = getUserDisplayName();
    if (!userName) return [];
    
    try {
      const res = await axios.get(apiUrl(`/api/user-bookings/${userName}`));
      if (res.data.success) {
        return res.data.data.map(booking => ({
          bookingId: booking._id || `BK${Date.now()}`,
          movie: booking.moviename,
          theater: booking.theater,
          location: getTheaterLocation(booking.theater),
          showDate: booking.date,
          showTime: booking.time,
          seats: booking.selectedseatname || [],
          totalAmount: booking.totalamount || (booking.selectedseatname?.length || 0) * ticketPrice,
          bookingDate: booking.createdAt || new Date().toISOString(),
          status: 'confirmed',
          paymentMethod: booking.paymentMethod || 'card'
        }));
      }
    } catch (err) {
      console.error("Error fetching bookings from database:", err);
    }
    return [];
  };

  // Get theater location by name
  const getTheaterLocation = (theaterName) => {
    const theaterLocations = {
      'PVR Cinemas SG Highway': 'Ahmedabad',
      'Miraj Cinemas Bodakdev': 'Ahmedabad',
      'INOX Rajouri Garden': 'Delhi',
      'PVR Phoenix Marketcity': 'Bangalore',
      'Forum Mall Cinemas': 'Bangalore',
      'PVR Phoenix Mills': 'Mumbai',
      'INOX R-City Mall': 'Mumbai',
      'Carnival Cinemas Andheri': 'Mumbai'
    };
    return theaterLocations[theaterName] || 'Unknown';
  };

  // Fetch user bookings from localStorage
  const fetchUserBookingsFromLocalStorage = () => {
    if (!user?.email) return [];
    
    try {
      const allBookings = JSON.parse(localStorage.getItem('userBookings') || '{}');
      const currentUserBookings = allBookings[user.email] || [];
      return currentUserBookings;
    } catch (error) {
      console.error('Error fetching bookings from localStorage:', error);
      return [];
    }
  };

  // Merge bookings from database and localStorage, removing duplicates
  const mergeBookings = (dbBookings, localBookings) => {
    const allBookings = [...dbBookings, ...localBookings];
    
    // Remove duplicates based on movie, theater, date, time, and seats
    const uniqueBookings = allBookings.filter((booking, index, self) => {
      return index === self.findIndex(b => 
        b.movie === booking.movie &&
        b.theater === booking.theater &&
        b.showDate === booking.showDate &&
        b.showTime === booking.showTime &&
        JSON.stringify(b.seats.sort()) === JSON.stringify(booking.seats.sort())
      );
    });
    
    // Sort by booking date (newest first)
    return uniqueBookings.sort((a, b) => 
      new Date(b.bookingDate) - new Date(a.bookingDate)
    );
  };

  // Load user's booking history from both sources
  useEffect(() => {
    const loadUserBookings = async () => {
      if (user?.email) {
        setIsLoading(true);
        
        try {
          // Fetch from both sources
          const [dbBookings, localBookings] = await Promise.all([
            fetchUserBookingsFromDB(),
            Promise.resolve(fetchUserBookingsFromLocalStorage())
          ]);
          
          // Merge and deduplicate
          const mergedBookings = mergeBookings(dbBookings, localBookings);
          setUserBookings(mergedBookings);
          
          console.log('Loaded bookings:', {
            database: dbBookings.length,
            localStorage: localBookings.length,
            merged: mergedBookings.length
          });
          
        } catch (error) {
          console.error('Error loading bookings:', error);
          // Fallback to localStorage only
          const localBookings = fetchUserBookingsFromLocalStorage();
          setUserBookings(localBookings);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    loadUserBookings();
  }, [user]);

  const formatDate = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate total for each booking
  const calculateTotal = (seats) => {
    return (seats?.length || 0) * ticketPrice;
  };

  // Generate professional PDF ticket
  const generateProfessionalPDF = (booking) => {
    // Check if jsPDF is available
    if (typeof window !== 'undefined' && window.jsPDF) {
      const { jsPDF } = window.jsPDF;
      const doc = new jsPDF();
      
      // Set background
      doc.setFillColor(15, 23, 42); // Dark blue background
      doc.rect(0, 0, 210, 297, 'F');
      
      // Header
      doc.setFillColor(59, 130, 246); // Blue header
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('🎬 MOVIE TICKET', 105, 25, { align: 'center' });
      
      // Booking ID and status
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Booking ID: ${booking.bookingId}`, 20, 55);
      
      // Status badge
      doc.setFillColor(34, 197, 94);
      doc.rect(150, 48, 45, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('CONFIRMED', 172.5, 55, { align: 'center' });
      
      // Movie title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(booking.movie, 20, 75);
      
      // Movie details box
      doc.setFillColor(30, 41, 59);
      doc.rect(15, 85, 180, 80, 'F');
      doc.setDrawColor(75, 85, 99);
      doc.rect(15, 85, 180, 80, 'S');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      // Show details
      doc.text('🏢 Theater:', 25, 105);
      doc.setFont('helvetica', 'bold');
      doc.text(booking.theater, 60, 105);
      
      doc.setFont('helvetica', 'normal');
      doc.text('📍 Location:', 25, 120);
      doc.setFont('helvetica', 'bold');
      doc.text(booking.location, 65, 120);
      
      doc.setFont('helvetica', 'normal');
      doc.text('📅 Date:', 25, 135);
      doc.setFont('helvetica', 'bold');
      doc.text(booking.showDate, 50, 135);
      
      doc.setFont('helvetica', 'normal');
      doc.text('🕐 Time:', 25, 150);
      doc.setFont('helvetica', 'bold');
      doc.text(booking.showTime, 50, 150);
      
      // Seats section
      doc.setFillColor(34, 197, 94);
      doc.rect(15, 175, 180, 40, 'F');
      doc.setDrawColor(22, 163, 74);
      doc.rect(15, 175, 180, 40, 'S');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('💺 SEATS', 25, 190);
      doc.setFontSize(18);
      doc.text((booking.seats || []).join(', '), 25, 205);
      
      // Payment details
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('🎫 Tickets:', 25, 235);
      doc.setFont('helvetica', 'bold');
      doc.text(`${booking.seats?.length || 0} x ₹${ticketPrice.toLocaleString('en-IN')}`, 65, 235);
      
      doc.setFontSize(16);
      doc.setTextColor(34, 197, 94);
      doc.setFont('helvetica', 'bold');
      doc.text(`💰 Total: ₹${booking.totalAmount || calculateTotal(booking.seats)}`, 25, 255);
      
      // QR Code placeholder
      doc.setFillColor(255, 255, 255);
      doc.rect(140, 225, 40, 40, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.text('QR CODE', 160, 245, { align: 'center' });
      doc.text('SCAN AT THEATER', 160, 252, { align: 'center' });
      
      // Footer
      doc.setTextColor(156, 163, 175);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Terms: Please arrive 15 minutes early • Carry valid ID • No outside food', 20, 275);
      doc.text(`Generated on: ${formatDate(new Date())} at ${formatTime(new Date())}`, 20, 285);
      
      // Customer details - Use display name instead of hardcoded values
      const displayName = getUserDisplayName();
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(`Customer: ${displayName}`, 25, 290);
      doc.text(`Email: ${user?.email || 'N/A'}`, 120, 290);
      
      // Save PDF
      doc.save(`MovieTicket_${booking.bookingId}_${booking.movie.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } else {
      // Fallback to text file if jsPDF is not available
      generateTextTicket(booking);
    }
  };

  // Fallback text ticket generator
  const generateTextTicket = (booking) => {
    const displayName = getUserDisplayName();
    
    const ticketContent = `
🎬 MOVIE TICKET BOOKING CONFIRMATION
=====================================

Booking ID: ${booking.bookingId}
Status: CONFIRMED
Movie: ${booking.movie}
Theater: ${booking.theater}
Location: ${booking.location}

Show Details:
📅 Date: ${booking.showDate}
🕐 Time: ${booking.showTime}

💺 Seats: ${(booking.seats || []).join(', ')}
🎫 Number of Tickets: ${booking.seats?.length || 0}
💰 Price per Ticket: ₹${ticketPrice.toLocaleString('en-IN')}
💰 Total Amount: ₹${booking.totalAmount || calculateTotal(booking.seats)}

Customer Details:
👤 Name: ${displayName}
📧 Email: ${user?.email || 'N/A'}

Booking Details:
📅 Booked on: ${formatDate(booking.bookingDate)}
🕐 Booking Time: ${formatTime(booking.bookingDate)}

Terms & Conditions:
• Please arrive 15 minutes before showtime
• Carry a valid ID for verification
• No outside food or beverages allowed
• No cancellation or refund after booking

Thank you for booking with us! 🎭
Generated on: ${formatDate(new Date())} at ${formatTime(new Date())}

---
This is your official ticket. Please show this at the theater entrance.
    `.trim();

    const blob = new Blob([ticketContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MovieTicket_${booking.bookingId}_${booking.movie.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    // Save the updated name to localStorage for persistence
    if (editedName && editedName.trim() !== '') {
      const userData = {
        name: editedName.trim(),
        email: editedEmail || user?.email,
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      
      // Update user context if possible (you might need to add an update method to AuthContext)
      // user.name = editedName.trim();
      
      setIsEditing(false);
      alert('✅ Profile updated successfully!');
    } else {
      alert('❌ Please enter a valid name');
    }
  };

  const handleCancel = () => {
    const displayName = getUserDisplayName();
    setEditedName(displayName);
    setEditedEmail(user?.email || '');
    setIsEditing(false);
  };

  // Determine booking status based on show date and time
  const getBookingStatus = (booking) => {
    try {
      const showDateTime = new Date(booking.showDate + ' ' + booking.showTime);
      const now = new Date();
      
      if (showDateTime > now) {
        return 'confirmed'; // Future show
      } else {
        return 'completed'; // Past show
      }
    } catch (error) {
      return booking.status || 'confirmed';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const displayName = getUserDisplayName();

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-800 rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            
            {/* Profile Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {displayName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
                <h1 className="text-3xl font-bold text-white">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-blue-500"
                      placeholder="Enter your name"
                    />
                  ) : (
                    displayName
                  )}
                </h1>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                ) : (
                  <span className="text-gray-300">{user?.email || 'N/A'}</span>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start space-x-2 mb-6">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <span className="text-gray-300">Member since January 2024</span>
              </div>

              {/* Statistics */}
              <div className="flex justify-center md:justify-start space-x-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{userBookings.length}</div>
                  <div className="text-sm text-gray-400">Total Bookings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {userBookings.reduce((total, booking) => total + (booking.seats?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-400">Tickets Booked</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    ₹{userBookings.reduce((total, booking) => total + (booking.totalAmount || calculateTotal(booking.seats)), 0).toLocaleString('en-IN')}
                  </div>
                  <div className="text-sm text-gray-400">Total Spent</div>
                </div>
              </div>

              {isEditing ? (
                <div className="flex space-x-4 justify-center md:justify-start">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <CheckIcon className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              ) : (
                <div className="flex space-x-4 justify-center md:justify-start">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Booking History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-800 rounded-2xl p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <TicketIcon className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">My Booking History</h2>
            <span className="bg-blue-600 text-white text-sm px-2 py-1 rounded-full">
              {userBookings.length} bookings
            </span>
          </div>
          
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-400 text-lg">Loading your bookings...</p>
            </div>
          ) : userBookings.length > 0 ? (
            <div className="space-y-6">
              {userBookings.map((booking, index) => {
                const status = getBookingStatus(booking);
                const bookingSeats = booking.seats || [];
                const bookingTotal = booking.totalAmount || calculateTotal(bookingSeats);
                
                return (
                  <div
                    key={booking.bookingId || index}
                    className="bg-gray-700 rounded-xl p-6 border border-gray-600 hover:border-gray-500 transition-all duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                      
                      {/* Left: Booking Details */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-600 rounded-lg">
                              <TicketIcon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{booking.movie}</h3>
                              <span className="text-xs text-gray-500">#{booking.bookingId}</span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            status === 'confirmed' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {status === 'confirmed' ? '🎫 CONFIRMED' : '✅ COMPLETED'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300 mb-4">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-white font-medium">{booking.showDate}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">⏰ Time:</span>
                            <span className="text-white font-medium">{booking.showTime}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">🏢 Theater:</span>
                            <span className="text-white font-medium">{booking.theater}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">📍 Location:</span>
                            <span className="text-white font-medium">{booking.location}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 md:col-span-2">
                            <span className="text-gray-400">📅 Booked on:</span>
                            <span className="text-white text-sm">
                              {formatDate(booking.bookingDate)} at {formatTime(booking.bookingDate)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="mb-3 sm:mb-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-gray-400 text-sm">💺 Seats:</span>
                              <div className="flex flex-wrap gap-1">
                                {bookingSeats.map((seat) => (
                                  <span key={seat} className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                                    {seat}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <span className="text-gray-400 text-xs">
                              {bookingSeats.length} ticket{bookingSeats.length > 1 ? 's' : ''} purchased
                            </span>
                          </div>
                          
                          {/* Download PDF Button */}
                          <button
                            onClick={() => generateProfessionalPDF(booking)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 self-start sm:self-center"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            <span>Download Ticket</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Right: Price Details */}
                      <div className="text-center lg:text-right bg-gray-800 p-4 rounded-lg lg:ml-6 lg:min-w-[200px] border border-gray-600">
                        <div className="text-3xl font-bold text-green-400 mb-2">
                          ₹{bookingTotal.toLocaleString('en-IN')}
                        </div>
                        <div className="text-sm text-gray-400 mb-1">
                          {bookingSeats.length} × ₹{ticketPrice.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-gray-500">
                          Total Amount Paid
                        </div>
                        <div className="mt-3 pt-2 border-t border-gray-600">
                          <div className="text-xs text-gray-400">Payment Status</div>
                          <div className="text-sm text-green-400 font-medium">✅ Completed</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🎫</div>
              <h3 className="text-3xl font-bold text-white mb-4">No Bookings Yet</h3>
              <p className="text-gray-400 text-lg mb-8">
                You haven't booked any movies yet. Start exploring and book your favorite shows!
              </p>
              <button
                onClick={() => window.location.href = '/movies'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center space-x-2"
              >
                <TicketIcon className="h-5 w-5" />
                <span>Browse Movies</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        {userBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 bg-gray-800 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  // Download all tickets as a batch
                  userBookings.forEach((booking, index) => {
                    setTimeout(() => generateProfessionalPDF(booking), index * 500);
                  });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-3"
              >
                <ArrowDownTrayIcon className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Download All Tickets</div>
                  <div className="text-sm text-blue-200">Get all your tickets at once</div>
                </div>
              </button>
              
              <button
                onClick={() => window.location.href = '/movies'}
                className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-3"
              >
                <TicketIcon className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">Book New Movie</div>
                  <div className="text-sm text-green-200">Explore latest shows</div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  const totalSpent = userBookings.reduce((total, booking) => total + (booking.totalAmount || calculateTotal(booking.seats)), 0);
                  const totalTickets = userBookings.reduce((total, booking) => total + (booking.seats?.length || 0), 0);
                  const avgPerBooking = userBookings.length > 0 ? Math.round(totalSpent / userBookings.length) : 0;
                  
                  alert(`📊 Your Booking Statistics:\n\n🎫 Total Bookings: ${userBookings.length}\n🎭 Total Tickets: ${totalTickets}\n💰 Total Spent: ₹${totalSpent.toLocaleString('en-IN')}\n📈 Average per Booking: ₹${avgPerBooking.toLocaleString('en-IN')}\n\nThank you for being a valued customer! 🌟`);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-3"
              >
                <CalendarIcon className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">View Statistics</div>
                  <div className="text-sm text-purple-200">Your booking insights</div>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Profile;