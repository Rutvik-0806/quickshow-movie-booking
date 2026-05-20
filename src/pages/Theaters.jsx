import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, ClockIcon, StarIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

const Theaters = () => {
  const [selectedCity, setSelectedCity] = useState('All');
  const navigate = useNavigate();

  const theaters = [
    {
      id: '1',
      name: 'PVR Cinemas SG Highway',
      address: 'SG Highway, Ahmedabad',
      city: 'Ahmedabad',
      rating: 4.5,
      facilities: ['IMAX', 'Dolby Atmos', 'Recliner Seats', 'Food Court'],
      showtimes: ['10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM', '10:00 PM'],
      distance: '2.5 km'
    },
    {
      id: '2',
      name: 'Miraj Cinemas Bodakdev',
      address: 'Bodakdev, Ahmedabad',
      city: 'Ahmedabad',
      rating: 4.7,
      facilities: ['Luxury Seating', 'Dolby Vision', 'Valet Parking', 'Premium Dining'],
      showtimes: ['10:30 AM', '1:30 PM', '4:30 PM', '7:30 PM', '10:30 PM'],
      distance: '1.8 km'
    },
    {
      id: '3',
      name: 'INOX Rajouri Garden',
      address: 'Rajouri Garden, New Delhi',
      city: 'Delhi',
      rating: 4.3,
      facilities: ['4DX', 'VIP Lounge', 'Parking', 'Snack Bar'],
      showtimes: ['11:00 AM', '2:00 PM', '5:00 PM', '8:00 PM'],
      distance: '3.1 km'
    },
    {
      id: '4',
      name: 'PVR Phoenix Marketcity',
      address: 'Whitefield, Bangalore',
      city: 'Bangalore',
      rating: 4.2,
      facilities: ['IMAX', 'Gold Class', 'Food Court', 'Gaming Zone'],
      showtimes: ['9:30 AM', '12:30 PM', '3:30 PM', '6:30 PM', '9:30 PM'],
      distance: '4.5 km'
    },
    {
      id: '5',
      name: 'Forum Mall Cinemas',
      address: 'Koramangala, Bangalore',
      city: 'Bangalore',
      rating: 4.4,
      facilities: ['Premium Seats', 'Dolby Atmos', 'Cafe', 'Wheelchair Access'],
      showtimes: ['10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM', '10:00 PM'],
      distance: '3.8 km'
    },
    {
      id: '6',
      name: 'PVR Phoenix Mills',
      address: 'Lower Parel, Mumbai',
      city: 'Mumbai',
      rating: 4.6,
      facilities: ['IMAX', 'Director\'s Cut', 'Gourmet Counter', 'Valet Parking'],
      showtimes: ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '9:00 PM'],
      distance: '5.2 km'
    },
    {
      id: '7',
      name: 'INOX R-City Mall',
      address: 'Ghatkopar, Mumbai',
      city: 'Mumbai',
      rating: 4.1,
      facilities: ['MX4D', 'Club Lounge', 'Food Court', 'Gaming Zone'],
      showtimes: ['10:30 AM', '1:30 PM', '4:30 PM', '7:30 PM', '10:30 PM'],
      distance: '6.1 km'
    },
    {
      id: '8',
      name: 'Carnival Cinemas Andheri',
      address: 'Andheri West, Mumbai',
      city: 'Mumbai',
      rating: 4.0,
      facilities: ['Standard', 'Concessions', 'Wheelchair Access', 'Parking'],
      showtimes: ['11:00 AM', '2:00 PM', '5:00 PM', '8:00 PM', '11:00 PM'],
      distance: '4.2 km'
    }
  ];

  const cities = ['All', 'Ahmedabad', 'Bangalore', 'Mumbai', 'Delhi'];

  const filteredTheaters = theaters.filter(
    theater => selectedCity === 'All' || theater.city === selectedCity
  );

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Find Theaters
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover premium theaters near you with the best facilities and comfortable seating
          </p>
        </motion.div>

        {/* City Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <MapPinIcon className="h-5 w-5 text-gray-400" />
            <span className="text-lg font-semibold text-white">Select City</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedCity === city
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Theaters Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredTheaters.map((theater, index) => (
            <motion.div
              key={theater.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{theater.name}</h3>
                  <div className="flex items-center space-x-2 text-gray-400 mb-2">
                    <MapPinIcon className="h-4 w-4" />
                    <span className="text-sm">{theater.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <span className="text-sm">{theater.distance} away</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 bg-yellow-500 text-black px-2 py-1 rounded-full">
                  <StarIcon className="h-3 w-3" />
                  <span className="text-sm font-bold">{theater.rating}</span>
                </div>
              </div>

              {/* Facilities */}
              <div className="mb-4">
                <h4 className="text-white font-semibold mb-2">Facilities</h4>
                <div className="flex flex-wrap gap-2">
                  {theater.facilities.map(facility => (
                    <span
                      key={facility}
                      className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>

              {/* Showtimes */}
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-2 flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4" />
                  <span>Today's Showtimes</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {theater.showtimes.map(time => (
                    <button
                      key={time}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors duration-200"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/movies')}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  View Movies
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredTheaters.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Theaters Found</h3>
            <p className="text-gray-400">Try selecting a different city</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Theaters;