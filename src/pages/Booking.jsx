import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  CreditCardIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';
import { useMovies } from '../contexts/MovieContext';
import { useAuth } from '../contexts/AuthContext';
import { apiUrl } from '../config/api';

const Booking = () => {
  const { movieId } = useParams();
  const { getMovieById } = useMovies();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const movie = getMovieById(movieId || '');
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedTheater, setSelectedTheater] = useState('');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [userBookings, setUserBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]); // New state for all user bookings
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);

  // Ticket price per seat
  const ticketPrice = 500;

  // Generate dynamic dates based on current date
  const generateDates = () => {
    const today = new Date();
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let dayLabel = '';
      if (i === 0) dayLabel = 'Today';
      else if (i === 1) dayLabel = 'Tomorrow';
      else dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      dates.push({
        date: date.toISOString().split('T')[0],
        day: dayLabel,
        fullDate: date.toLocaleDateString('en-IN', { 
          day: 'numeric', 
          month: 'short' 
        })
      });
    }
    
    return dates;
  };

  const dates = generateDates();

  // Get user bookings from database
  const getUserBookings = async () => {
    if (!user?.name) return [];
    try {
      const res = await axios.get(apiUrl(`/api/user-bookings/${user.name}`));
      if (res.data.success) {
        return res.data.data;
      }
    } catch (err) {
      console.error("Error fetching user bookings:", err);
    }
    return [];
  };

  // Get ALL bookings from database (from all users) for specific show
  const getAllBookingsForShow = async (movieTitle, theaterName, showDate, showTime) => {
    if (!movieTitle || !theaterName || !showDate || !showTime) return [];
    
    try {
      setLoadingSeats(true);
      const res = await axios.post(apiUrl('/api/get-show-bookings'), {
        moviename: movieTitle,
        theater: theaterName,
        date: showDate,
        time: showTime
      });
      
      if (res.data.success) {
        return res.data.data || [];
      }
    } catch (err) {
      console.error("Error fetching show bookings:", err);
    } finally {
      setLoadingSeats(false);
    }
    return [];
  };

  // Load user bookings on component mount
  useEffect(() => {
    const loadUserBookings = async () => {
      if (user?.name) {
        const bookings = await getUserBookings();
        setUserBookings(bookings);
      }
    };
    loadUserBookings();
  }, [user]);

  // Load all bookings when show details change
  useEffect(() => {
    const loadAllBookings = async () => {
      if (selectedTheater && selectedDate && selectedTime && movie) {
        const theaterName = theaters.find(t => t.id === selectedTheater)?.name;
        if (theaterName) {
          const allShowBookings = await getAllBookingsForShow(
            movie.title, 
            theaterName, 
            selectedDate, 
            selectedTime
          );
          setAllBookings(allShowBookings);
        }
      } else {
        setAllBookings([]);
      }
    };
    
    loadAllBookings();
  }, [selectedTheater, selectedDate, selectedTime, movie]);

  // Updated theaters data to match Theaters.jsx
  const theaters = [
    { id: '1', name: 'PVR Cinemas SG Highway', location: 'Ahmedabad' },
    { id: '2', name: 'Miraj Cinemas Bodakdev', location: 'Ahmedabad' },
    { id: '3', name: 'INOX Rajouri Garden', location: 'Delhi' },
    { id: '4', name: 'PVR Phoenix Marketcity', location: 'Bangalore' },
    { id: '5', name: 'Forum Mall Cinemas', location: 'Bangalore' },
    { id: '6', name: 'PVR Phoenix Mills', location: 'Mumbai' },
    { id: '7', name: 'INOX R-City Mall', location: 'Mumbai' },
    { id: '8', name: 'Carnival Cinemas Andheri', location: 'Mumbai' }
  ];

  const times = ['2:00 PM', '5:00 PM', '8:00 PM', '11:00 PM'];

  // Check if a time slot is in the past for today's date
  const isTimeSlotPast = (timeSlot, selectedDate) => {
    if (!selectedDate || !timeSlot) return false;
    
    const today = new Date();
    const todayDateString = today.toISOString().split('T')[0];
    
    if (selectedDate !== todayDateString) {
      return false;
    }
    
    const [time, period] = timeSlot.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    const timeSlotDate = new Date(today);
    timeSlotDate.setHours(hour24, minutes, 0, 0);
    
    const bufferTime = new Date(timeSlotDate.getTime() - 30 * 60 * 1000);
    
    return today >= bufferTime;
  };

  // Get available time slots for selected date
  const getAvailableTimeSlots = () => {
    return times.filter(time => !isTimeSlotPast(time, selectedDate));
  };

  // UPDATED: Get booked seats for current selection from database
  const getBookedSeats = () => {
    if (!selectedTheater || !selectedDate || !selectedTime || !movie || !user) {
      return { userSeats: [], otherSeats: [], allBookedSeats: [] };
    }
    
    const theaterName = theaters.find(t => t.id === selectedTheater)?.name;
    
    // Get current user's seats for this specific show
    const userBooking = userBookings.find(b => 
      b.moviename === movie.title &&
      b.theater === theaterName &&
      b.date === selectedDate &&
      b.time === selectedTime
    );
    const userSeats = userBooking ? userBooking.selectedseatname : [];
    
    // Get all seats booked by other users for this show
    const otherSeats = [];
    const allBookedSeats = [];
    
    allBookings.forEach(booking => {
      if (booking.selectedseatname && Array.isArray(booking.selectedseatname)) {
        booking.selectedseatname.forEach(seat => {
          allBookedSeats.push(seat);
          // If it's not current user's booking, add to other seats
          if (booking.login_name !== user.name) {
            otherSeats.push(seat);
          }
        });
      }
    });
    
    return { userSeats, otherSeats, allBookedSeats };
  };

  // Reset seats when show details change
  useEffect(() => {
    setSelectedSeats([]);
  }, [selectedTheater, selectedDate, selectedTime]);

  // Reset selected time if it becomes unavailable due to date change
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const availableSlots = getAvailableTimeSlots();
      if (!availableSlots.includes(selectedTime)) {
        setSelectedTime('');
      }
    }
  }, [selectedDate]);

  const generateSeats = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 10;
    
    const { userSeats, otherSeats, allBookedSeats } = getBookedSeats();
    
    return rows.map(row => ({
      row,
      seats: Array.from({ length: seatsPerRow }, (_, i) => {
        const seatNumber = `${row}${i + 1}`;
        return {
          id: seatNumber,
          isUserBooked: userSeats.includes(seatNumber),
          isOtherBooked: otherSeats.includes(seatNumber),
          isSelected: selectedSeats.includes(seatNumber),
          isUnavailable: allBookedSeats.includes(seatNumber) // Any seat booked by anyone
        };
      })
    }));
  };

  const handleSeatClick = (seatId) => {
    const seatRows = generateSeats();
    let targetSeat = null;
    
    for (const row of seatRows) {
      targetSeat = row.seats.find(seat => seat.id === seatId);
      if (targetSeat) break;
    }

    // Prevent booking if seat is unavailable (booked by anyone)
    if (targetSeat?.isUnavailable) {
      // Show alert if user tries to book already reserved seat
      if (targetSeat.isUserBooked) {
        alert('This seat is already booked by you for this show.');
      } else {
        alert('This seat is already reserved by another user. Please select a different seat.');
      }
      return;
    }

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else if (selectedSeats.length < 8) {
      setSelectedSeats([...selectedSeats, seatId]);
    } else {
      alert('Maximum 8 seats allowed per booking.');
    }
  };

  // Save booking to localStorage as well for immediate sync
  const saveToLocalStorage = (bookingData) => {
    try {
      const existingBookings = JSON.parse(localStorage.getItem('userBookings') || '{}');
      const userEmail = user.email;
      
      if (!existingBookings[userEmail]) {
        existingBookings[userEmail] = [];
      }
      
      // Create booking object for localStorage
      const localBooking = {
        bookingId: bookingData.bookingId || `BK${Date.now()}`,
        movie: bookingData.moviename,
        theater: bookingData.theater,
        location: theaters.find(t => t.name === bookingData.theater)?.location || 'Unknown',
        showDate: bookingData.date,
        showTime: bookingData.time,
        seats: bookingData.selectedseatname,
        totalAmount: bookingData.totalamount,
        bookingDate: new Date().toISOString(),
        status: 'confirmed',
        paymentMethod: bookingData.paymentMethod
      };
      
      existingBookings[userEmail].push(localBooking);
      localStorage.setItem('userBookings', JSON.stringify(existingBookings));
      
      console.log('Booking saved to localStorage:', localBooking);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // UPDATED: Enhanced booking function with seat availability check
  const handleBooking = async () => {
    if (!user) return;

    setIsLoading(true);
    const theaterName = theaters.find(t => t.id === selectedTheater)?.name;
    const theaterLocation = theaters.find(t => t.id === selectedTheater)?.location;
    const totalAmount = selectedSeats.length * ticketPrice;

    try {
      // Double-check seat availability before booking
      const latestBookings = await getAllBookingsForShow(
        movie.title, 
        theaterName, 
        selectedDate, 
        selectedTime
      );
      
      const allBookedSeats = [];
      latestBookings.forEach(booking => {
        if (booking.selectedseatname && Array.isArray(booking.selectedseatname)) {
          allBookedSeats.push(...booking.selectedseatname);
        }
      });
      
      // Check if any selected seats are now taken
      const conflictingSeats = selectedSeats.filter(seat => allBookedSeats.includes(seat));
      if (conflictingSeats.length > 0) {
        alert(`Sorry! The following seats were just booked by someone else: ${conflictingSeats.join(', ')}. Please refresh and select different seats.`);
        // Refresh the bookings
        setAllBookings(latestBookings);
        return;
      }

      const bookingData = {
        login_name: user.name,
        password: user.password || "default",
        moviename: movie.title,
        selectedseatname: selectedSeats,
        totalseat: selectedSeats.length,
        ticket: selectedSeats.length,
        theater: theaterName,
        time: selectedTime,
        date: selectedDate,
        paymentMethod,
        paymentDetails: paymentMethod === "card"
          ? { cardNumber, expiry, cvv }
          : { upiId },
        totalamount: totalAmount,
        bookingId: `BK${Date.now()}_${user.name.substring(0, 3).toUpperCase()}`
      };

      console.log('Booking data being sent:', bookingData);

      const res = await axios.post(apiUrl('/api/create-booking'), bookingData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (res.data.success) {
        // Save to localStorage immediately for sync
        saveToLocalStorage(bookingData);
        
        // Show success message
        alert("✅ Booking confirmed successfully!");
        
        // Refresh user bookings from database
        const updatedBookings = await getUserBookings();
        setUserBookings(updatedBookings);
        
        // Navigate to profile page with a small delay to ensure data is saved
        setTimeout(() => {
          navigate("/profile", { replace: true });
        }, 500);
        
      } else {
        throw new Error(res.data.message || 'Booking failed');
      }
    } catch (err) {
      console.error("❌ Booking failed:", err);
      
      // More specific error messages
      let errorMessage = "Booking failed. Please try again.";
      if (err.response?.status === 500) {
        errorMessage = "Server error. Please check if the backend is running.";
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || "Invalid booking data.";
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server. Please check your internet connection.";
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    return selectedSeats.length * ticketPrice;
  };

  if (!movie) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-white mb-2">Movie Not Found</h2>
          <p className="text-gray-400">The movie you're trying to book doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-2">Please Log In</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to book tickets.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Book Tickets</h1>
          <div className="flex items-center justify-center space-x-4">
            <img src={movie.poster} alt={movie.title} className="w-16 h-20 object-cover rounded-lg" />
            <div>
              <h2 className="text-xl font-semibold text-white">{movie.title}</h2>
              <p className="text-gray-400">{movie.genre.join(', ')} • {movie.duration} min</p>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-4">
            {[
              { step: 1, title: 'Select Show' },
              { step: 2, title: 'Choose Seats' },
              { step: 3, title: 'Payment' }
            ].map((item) => (
              <div key={item.step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= item.step 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {currentStep > item.step ? <CheckCircleIcon className="h-5 w-5" /> : item.step}
                </div>
                <span className={`ml-2 text-sm ${
                  currentStep >= item.step ? 'text-white' : 'text-gray-400'
                }`}>
                  {item.title}
                </span>
                {item.step < 3 && <div className="w-8 h-0.5 bg-gray-700 mx-4" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content (Steps) */}
          <div className="lg:col-span-2">
            
            {/* Step 1: Select Show */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Theater */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <MapPinIcon className="h-5 w-5 text-blue-400" />
                    <span>Select Theater</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {theaters.map((theater) => (
                      <button
                        key={theater.id}
                        onClick={() => setSelectedTheater(theater.id)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          selectedTheater === theater.id
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-left">
                          <h4 className="font-semibold text-white">{theater.name}</h4>
                          <p className="text-sm text-gray-400">{theater.location}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-blue-400" />
                    <span>Select Date</span>
                  </h3>
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {dates.map((date) => (
                      <button
                        key={date.date}
                        onClick={() => setSelectedDate(date.date)}
                        className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                          selectedDate === date.date
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-sm font-medium text-white">{date.day}</div>
                          <div className="text-xs text-gray-400">{date.fullDate}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-blue-400" />
                    <span>Select Time</span>
                  </h3>
                  {selectedDate ? (
                    <>
                      {isTimeSlotPast('', selectedDate) && selectedDate === new Date().toISOString().split('T')[0] && (
                        <div className="mb-4 p-3 bg-amber-500/20 border border-amber-500/50 rounded-lg">
                          <p className="text-amber-300 text-sm">
                            ⚠️ Some time slots may not be available as they have already passed or booking has closed (30 min buffer)
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {times.map((time) => {
                          const isPast = isTimeSlotPast(time, selectedDate);
                          return (
                            <button
                              key={time}
                              onClick={() => !isPast && setSelectedTime(time)}
                              disabled={isPast}
                              className={`py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                                isPast
                                  ? 'border-gray-600 bg-gray-700 text-gray-500 cursor-not-allowed'
                                  : selectedTime === time
                                  ? 'border-blue-500 bg-blue-500/20'
                                  : 'border-gray-600 hover:border-gray-500'
                              }`}
                            >
                              <span className={`font-medium ${isPast ? 'text-gray-500' : 'text-white'}`}>
                                {time}
                              </span>
                              {isPast && (
                                <div className="text-xs text-gray-500 mt-1">Unavailable</div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-400 text-center py-4">Please select a date first</p>
                  )}
                </div>

                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedTheater || !selectedDate || !selectedTime}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  Continue to Seat Selection
                </button>
              </motion.div>
            )}

            {/* Step 2: Seats */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gray-800 rounded-xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-6 text-center">Choose Your Seats</h3>
                
                {/* Show Info */}
                <div className="bg-gray-700 rounded-lg p-4 mb-6 text-center">
                  <p className="text-white font-medium">
                    {theaters.find(t => t.id === selectedTheater)?.name} • 
                    {dates.find(d => d.date === selectedDate)?.day} ({dates.find(d => d.date === selectedDate)?.fullDate}) • 
                    {selectedTime}
                  </p>
                </div>

                {/* Loading Seats Indicator */}
                {loadingSeats && (
                  <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
                    <p className="text-blue-300 text-sm text-center">
                      🔄 Loading latest seat availability...
                    </p>
                  </div>
                )}

                {/* Previous Booking Alert */}
                {(() => {
                  const { userSeats } = getBookedSeats();
                  return userSeats.length > 0 && (
                    <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4 mb-6">
                      <p className="text-orange-300 text-sm">
                        <span className="font-medium">⚠️ You have already booked seats for this show:</span> {userSeats.join(', ')}
                        <br />
                        <span className="text-xs">These seats are highlighted in orange and cannot be selected again.</span>
                      </p>
                    </div>
                  );
                })()}

                {/* Real-time Booking Warning */}
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                  <p className="text-red-300 text-sm">
                    <span className="font-medium">🔴 Live Seat Status:</span> Red seats are already reserved by other users.
                    <br />
                    <span className="text-xs">Seat availability updates in real-time. If you try to book a reserved seat, you'll be notified.</span>
                  </p>
                </div>

                {/* Screen */}
                <div className="mb-8">
                  <div className="w-full h-2 bg-gradient-to-r from-transparent via-gray-400 to-transparent rounded-full mb-2"></div>
                  <p className="text-center text-gray-400 text-sm">SCREEN</p>
                </div>

                {/* Seats */}
                <div className="space-y-2 mb-6">
                  {generateSeats().map((rowData) => (
                    <div key={rowData.row} className="flex items-center justify-center space-x-2">
                      <span className="text-gray-400 text-sm w-4 text-center">{rowData.row}</span>
                      {rowData.seats.map((seat) => (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat.id)}
                          disabled={seat.isUnavailable}
                          className={`w-8 h-8 rounded-t-lg text-xs font-medium transition-all duration-200 ${
                            seat.isUserBooked
                              ? 'bg-orange-600 text-white cursor-not-allowed border-2 border-orange-400'
                              : seat.isOtherBooked
                              ? 'bg-red-600 text-white cursor-not-allowed hover:bg-red-700'
                              : seat.isSelected
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          }`}
                          title={
                            seat.isUserBooked 
                              ? 'Your previous booking' 
                              : seat.isOtherBooked 
                              ? 'Reserved by another user - Click for details' 
                              : seat.isSelected 
                              ? 'Selected' 
                              : 'Available - Click to select'
                          }
                        >
                          {seat.id.slice(1)}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex justify-center space-x-4 mb-6 text-xs">
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-gray-600 rounded-t"></div>
                    <span className="text-gray-400">Available</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-blue-600 rounded-t"></div>
                    <span className="text-gray-400">Selected</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-red-600 rounded-t"></div>
                    <span className="text-gray-400">Reserved</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-orange-600 border-2 border-orange-400 rounded-t"></div>
                    <span className="text-gray-400">Your Booking</span>
                  </div>
                </div>

                {/* Selected Seats Info */}
                {selectedSeats.length > 0 && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <h4 className="text-white font-medium mb-2">Selected Seats:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map((seat) => (
                        <span key={seat} className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                          {seat}
                        </span>
                      ))}
                    </div>
                    <p className="text-blue-400 text-sm mt-2">
                      {selectedSeats.length} ticket{selectedSeats.length > 1 ? 's' : ''} • ₹{calculateTotal().toLocaleString('en-IN')}
                    </p>
                  </div>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    disabled={selectedSeats.length === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Continue to Payment ({selectedSeats.length} seats)
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gray-800 rounded-xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <CreditCardIcon className="h-5 w-5 text-blue-400" />
                  <span>Payment Details</span>
                </h3>
                
                {/* Final Seat Confirmation */}
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
                  <p className="text-green-300 text-sm">
                    <span className="font-medium">✅ Final Check:</span> Your selected seats will be confirmed after payment.
                    <br />
                    <span className="text-xs">If any seat becomes unavailable during payment, you'll be notified immediately.</span>
                  </p>
                </div>
                
                {/* Booking Summary */}
                <div className="bg-gray-700 rounded-lg p-4 mb-6">
                  <h4 className="text-white font-medium mb-3">Final Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Movie:</span>
                      <span className="text-white">{movie.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Theater:</span>
                      <span className="text-white">{theaters.find(t => t.id === selectedTheater)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date & Time:</span>
                      <span className="text-white">
                        {dates.find(d => d.date === selectedDate)?.day} ({dates.find(d => d.date === selectedDate)?.fullDate}) • {selectedTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Seats:</span>
                      <span className="text-white">{selectedSeats.join(', ')}</span>
                    </div>
                    <div className="border-t border-gray-600 pt-2 mt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-white">Total Amount:</span>
                        <span className="text-green-400">₹{calculateTotal().toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-xs text-gray-400 text-right">
                        {selectedSeats.length} tickets × ₹{ticketPrice.toLocaleString('en-IN')} each
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Payment Method
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 text-white">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="text-blue-600"
                        />
                        <span>Credit/Debit Card</span>
                      </label>
                      <label className="flex items-center space-x-2 text-white">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={paymentMethod === 'upi'}
                          onChange={() => setPaymentMethod('upi')}
                          className="text-blue-600"
                        />
                        <span>UPI</span>
                      </label>
                    </div>
                  </div>

                  {/* Card Payment */}
                  {paymentMethod === 'card' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                          required
                          maxLength={19}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            value={expiry}
                            onChange={e => setExpiry(e.target.value)}
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            required
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            CVV
                          </label>
                          <input
                            type="password"
                            value={cvv}
                            onChange={e => setCvv(e.target.value)}
                            placeholder="123"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            required
                            maxLength={3}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* UPI Payment */}
                  {paymentMethod === 'upi' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        placeholder="example@upi"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  )}
                </div>

                {paymentError && (
                  <p className="text-red-500 text-sm mb-4">{paymentError}</p>
                )}

                <div className="flex space-x-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (paymentMethod === 'card') {
                        if (!cardNumber || !expiry || !cvv) {
                          setPaymentError('Please fill all card details');
                          return;
                        }
                      } else if (paymentMethod === 'upi') {
                        if (!upiId) {
                          setPaymentError('Please enter a valid UPI ID');
                          return;
                        }
                      }
                      setPaymentError('');
                      handleBooking();
                    }}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors duration-200"
                  >
                    {isLoading ? 'Processing...' : `Pay ₹${calculateTotal().toLocaleString('en-IN')} & Confirm`}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Content (Summary) */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gray-800 rounded-xl p-6 sticky top-24"
            >
              <h3 className="text-xl font-bold text-white mb-4">Live Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Movie</span>
                  <span className="font-medium text-white">{movie.title}</span>
                </div>
                {selectedTheater && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Theater</span>
                    <span className="font-medium text-white">
                      {theaters.find(t => t.id === selectedTheater)?.name}
                    </span>
                  </div>
                )}
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date</span>
                    <span className="font-medium text-white">
                      {dates.find(d => d.date === selectedDate)?.fullDate}
                    </span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time</span>
                    <span className="font-medium text-white">{selectedTime}</span>
                  </div>
                )}
                {selectedSeats.length > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Seats</span>
                      <span className="font-medium text-white">
                        {selectedSeats.join(', ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tickets</span>
                      <span className="font-medium text-white">
                        {selectedSeats.length} × ₹{ticketPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-700 pt-3 mt-3">
                      <span className="text-white font-bold">Total</span>
                      <span className="font-bold text-green-400 text-lg">
                        ₹{calculateTotal().toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Real-time Status */}
              {selectedTheater && selectedDate && selectedTime && (
                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                  <h4 className="text-white font-medium mb-2 text-sm">
                    🔴 Live Status
                  </h4>
                  <p className="text-xs text-gray-300">
                    {loadingSeats ? 'Updating seat status...' : 'Seats updated in real-time'}
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">Live booking system active</span>
                  </div>
                </div>
              )}
              
              {/* Booking Guidelines */}
              <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                <h4 className="text-white font-medium mb-2 text-sm">Guidelines</h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Maximum 8 seats per booking</li>
                  <li>• Arrive 15 minutes early</li>
                  <li>• Carry valid ID</li>
                  <li>• No cancellations allowed</li>
                  <li>• Download ticket from profile</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;