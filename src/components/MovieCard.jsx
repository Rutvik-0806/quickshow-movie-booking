import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon, ClockIcon } from '@heroicons/react/24/solid';

const MovieCard = ({ movie, index = 0, scrollToTopOnNav }) => {
  const handleNav = (to) => {
    window.location.href = to;
    if (scrollToTopOnNav) {
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-gray-800 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
    >
      <div className="relative overflow-hidden">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-yellow-500 text-black px-2 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
          <StarIcon className="h-3 w-3" />
          <span>{movie.rating}</span>
        </div>

        {/* Upcoming Badge */}
        {movie.isUpcoming && (
          <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-full text-sm font-bold">
            Upcoming
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => handleNav(`/movie/${movie.id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200 transform scale-90 group-hover:scale-100"
          >
            View Details
          </button>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
          {movie.title}
        </h3>
        
        <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
          <div className="flex items-center space-x-1">
            <ClockIcon className="h-4 w-4" />
            <span>{movie.duration} min</span>
          </div>
          <span>{movie.language}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {movie.genre.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs"
            >
              {genre}
            </span>
          ))}
        </div>

        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
          {movie.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-gray-500 text-sm">
            {new Date(movie.releaseDate).toLocaleDateString()}
          </span>
          {!movie.isUpcoming && (
            <button
              onClick={() => handleNav(`/booking/${movie.id}`)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Book Now
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
