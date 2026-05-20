import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  StarIcon, 
  ClockIcon, 
  CalendarIcon, 
  PlayIcon,
  UserIcon,
  FilmIcon
} from '@heroicons/react/24/solid';
import { useMovies } from '../contexts/MovieContext';

const MovieDetails = () => {
  const { id } = useParams();
  const { getMovieById } = useMovies();
  
  const movie = getMovieById(id || '');

  if (!movie) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold text-white mb-2">Movie Not Found</h2>
          <p className="text-gray-400 mb-6">The movie you're looking for doesn't exist.</p>
          <Link
            to="/movies"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-screen flex items-center"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/80 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${movie.backdrop})`,
          }}
        />
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Movie Poster */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex justify-center lg:justify-start"
            >
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-80 h-auto rounded-2xl shadow-2xl"
              />
            </motion.div>

            {/* Movie Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {movie.title}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mb-6">
                <div className="flex items-center space-x-2">
                  <StarIcon className="h-5 w-5 text-yellow-500" />
                  <span className="text-yellow-500 font-bold">{movie.rating}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-400">{movie.duration} min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-400">{new Date(movie.releaseDate).getFullYear()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6 justify-center lg:justify-start">
                {movie.genre.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                {movie.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {!movie.isUpcoming && (
                  <Link
                    to={`/booking/${movie.id}`}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <span>Book Tickets</span>
                  </Link>
                )}
                
                <button className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2">
                  <PlayIcon className="h-5 w-5" />
                  <span>Watch Trailer</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Movie Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Synopsis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Synopsis</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                {movie.description}
              </p>
            </motion.div>

            {/* Cast */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="text-3xl font-bold text-white mb-6">Cast</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {movie.cast.map((actor, index) => (
                  <div key={index} className="text-center">
                    <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-3 mx-auto">
                      <UserIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-white font-medium">{actor}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Trailer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-white mb-6">Trailer</h2>
              <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                <iframe
                  src={movie.trailer}
                  title={`${movie.title} Trailer`}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Movie Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Movie Info</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FilmIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Director</p>
                    <p className="text-white">{movie.director}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Duration</p>
                    <p className="text-white">{movie.duration} minutes</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Release Date</p>
                    <p className="text-white">{new Date(movie.releaseDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <StarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Rating</p>
                    <p className="text-white">{movie.rating}/10</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Showtimes */}
            {!movie.isUpcoming && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-gray-800 rounded-xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4">Showtimes Today</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['2:00 PM', '5:00 PM', '8:00 PM', '11:00 PM'].map((time) => (
                    <button
                      key={time}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Book Tickets */}
            {!movie.isUpcoming && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4">Ready to Watch?</h3>
                <p className="text-gray-300 mb-4">
                  Book your tickets now for the best seats in the house!
                </p>
                <Link
                  to={`/booking/${movie.id}`}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
                >
                  Book Tickets Now
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
