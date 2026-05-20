import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon, PlayIcon, StarIcon, ClockIcon } from '@heroicons/react/24/solid';
import { useMovies } from '../contexts/MovieContext';

const UpcomingReleases = () => {
  const { upcomingMovies } = useMovies();
  const [reminderSet, setReminderSet] = useState(new Set());
  const [activeMovie, setActiveMovie] = useState(null); // ✅ global trailer state

  // Extended upcoming movies list with real August-September 2025 releases
  const upcomingMoviesExtended = [
    ...upcomingMovies,
    {
      id: '12',
      title: 'Thama',
      poster: 'https://i.ibb.co/kgGF31dk/Thama-cover-306x393.jpg',
      backdrop: 'https://i.ibb.co/kgGF31dk/Thama-cover-306x393.jpg',
      genre: ['Comedy', 'Horror', 'Thriller'],
      duration: 155,
      rating: 0,
      releaseDate: '2025-10-20',
      description: 'This universe needed a love story. Unfortunately, its a bloody one.',
      trailer: 'https://www.youtube.com/embed/hSBwq8yrXf0',
      cast: ['Ayushmann Khurana', 'Rashmika Mandanna', 'Paresh Rawal'],
      director: 'Aditya Sarpotdar',
      language: 'Hindi',
      isUpcoming: true
    },
    {
      id: '13',
      title: 'Tehran',
      poster: 'https://i.ibb.co/50SQBGH/Tehran-7088-306x393.jpg',
      backdrop: 'https://i.ibb.co/50SQBGH/Tehran-7088-306x393.jpg',
      genre: ['Action', 'Thriller', 'Espionage'],
      duration: 148,
      rating: 0,
      releaseDate: '2025-10-03',
      description: 'An espionage thriller set in the heart of Tehran, featuring high-stakes international intrigue.',
      trailer: 'https://www.youtube.com/embed/mzr_F0NJMRs',
      cast: ['John Abraham', 'Manushi Chhillar', 'Emraan Hashmi'],
      director: 'Arun Gopalan',
      language: 'Hindi',
      isUpcoming: true
    },
    {
      id: '14',
      title: 'The Raja Saab',
      poster: 'https://i.ibb.co/ND5LfhQ/The-Raja-Saab-306x393.jpg',
      backdrop: 'https://i.ibb.co/ND5LfhQ/The-Raja-Saab-306x393.jpg',
      genre: ['Comedy', 'Horror', 'Romance','Thriller'],
      duration: 165,
      rating: 0,
      releaseDate: '2025-12-05',
      description: 'A young heir embraces both his royal heritage and rebellious spirit as he rises to power, establishing unprecedented rules during his reign as Raja Saab.',
      trailer: 'https://www.youtube.com/embed/k2DbnzJa9fk',
      cast: ['Prabhas', 'Nidhhi Agerwal', 'Sanjay Dutt'],
      director: 'Maruthi Dasari',
      language: 'Hindi',
      isUpcoming: true
    }
  ];

  const getCountdown = (releaseDate) => {
    const now = new Date();
    const release = new Date(releaseDate);
    const difference = release.getTime() - now.getTime();
    
    if (difference <= 0) return 'Released';
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days to go`;
  };

  const getDaysUntilRelease = (releaseDate) => {
    const now = new Date();
    const release = new Date(releaseDate);
    const difference = release.getTime() - now.getTime();
    return Math.floor(difference / (1000 * 60 * 60 * 24));
  };

  const handleWatchTrailer = (movie) => {
    setActiveMovie(movie); // ✅ set clicked movie as active
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSetReminder = (movieId) => {
    setReminderSet(prev => new Set([...prev, movieId]));
  };

  const featuredMovie = upcomingMoviesExtended.find(movie => getDaysUntilRelease(movie.releaseDate) >= 0) || upcomingMoviesExtended[0];

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Upcoming Releases
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Get ready for the most anticipated movies hitting Indian theaters. From Bollywood blockbusters to regional masterpieces.
          </p>
        </motion.div>

        {/* Featured Upcoming Movie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative bg-gradient-to-r from-gray-800/90 to-gray-900/90 rounded-3xl overflow-hidden mb-16 border border-purple-500/20 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${featuredMovie?.backdrop})`,
            }}
          />
          
          <div className="relative z-20 p-8 md:p-16">
            <div className="max-w-3xl">
              <div className="flex items-center space-x-6 mb-6">
                <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  🎬 Coming Soon
                </span>
                <div className="flex items-center space-x-2 text-gray-200">
                  <CalendarIcon className="h-5 w-5 text-purple-400" />
                  <span className="text-lg font-medium">
                    {new Date(featuredMovie?.releaseDate).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {featuredMovie?.title}
              </h2>
              
              <p className="text-xl text-gray-200 mb-8 line-clamp-3 leading-relaxed">
                {featuredMovie?.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 mb-8">
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-400/30 px-4 py-2 rounded-xl">
                  <span className="text-2xl font-bold text-purple-300">
                    {getCountdown(featuredMovie?.releaseDate)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-gray-300">
                  <ClockIcon className="h-5 w-5" />
                  <span>{featuredMovie?.duration} min</span>
                </div>
                <div className="flex space-x-3">
                  {featuredMovie?.genre.slice(0, 3).map((g) => (
                    <span key={g} className="px-3 py-1 bg-gray-800/60 backdrop-blur-sm border border-gray-600/40 text-gray-200 rounded-full text-sm font-medium">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <button
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center space-x-3 text-lg"
                  onClick={() => handleWatchTrailer(featuredMovie)}
                >
                  <PlayIcon className="h-6 w-6" />
                  <span>Watch Trailer</span>
                </button>
                {reminderSet.has(featuredMovie?.id) ? (
                  <button
                    className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold transition-colors duration-200 opacity-80 cursor-not-allowed text-lg"
                    disabled
                  >
                    ✓ Reminder Set
                  </button>
                ) : (
                  <button
                    className="bg-gray-700/80 hover:bg-gray-600 backdrop-blur-sm border border-gray-600/40 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-lg"
                    onClick={() => handleSetReminder(featuredMovie?.id)}
                  >
                    🔔 Set Reminder
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-3xl md:text-4xl font-bold text-white mb-12 text-center"
        >
          More Upcoming Movies
        </motion.h2>

        {/* Upcoming Movies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {upcomingMoviesExtended.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 min-h-[600px] flex flex-col hover:border-purple-500/30"
            >
              <div className="relative overflow-hidden">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Countdown Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500/90 to-pink-600/90 backdrop-blur-sm text-white px-3 py-2 rounded-xl text-sm font-bold shadow-lg">
                  {getCountdown(movie.releaseDate)}
                </div>

                {/* Language Badge */}
                <div className="absolute top-4 left-4 bg-gray-800/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                  {movie.language}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <button
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform scale-90 group-hover:scale-100 flex items-center space-x-2 shadow-xl"
                    onClick={() => handleWatchTrailer(movie)}
                  >
                    <PlayIcon className="h-5 w-5" />
                    <span>Watch Trailer</span>
                  </button>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors line-clamp-2">
                  {movie.title}
                </h3>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4" />
                    <span>{movie.duration} min</span>
                  </div>
                  <span className="font-medium">{movie.director}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genre.slice(0, 3).map((genre) => (
                    <span
                      key={genre}
                      className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 rounded-full text-xs font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <p className="text-gray-400 text-sm line-clamp-3 mb-6 leading-relaxed">
                  {movie.description}
                </p>

                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-400">
                      <div className="text-xs text-gray-500">Release Date</div>
                      <div className="text-sm font-medium">
                        {new Date(movie.releaseDate).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <StarIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">{movie.rating || 'TBA'}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {reminderSet.has(movie.id) ? (
                      <button
                        className="flex-1 bg-green-600/80 text-white px-4 py-3 rounded-xl font-semibold transition-colors duration-200 opacity-80 cursor-not-allowed text-sm"
                        disabled
                      >
                        ✓ Set
                      </button>
                    ) : (
                      <button
                        className="flex-1 bg-gray-700/80 hover:bg-gray-600 backdrop-blur-sm border border-gray-600/40 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-sm"
                        onClick={() => handleSetReminder(movie.id)}
                      >
                        🔔 Remind Me
                      </button>
                    )}
                    <button
                      className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 text-purple-300 px-4 py-3 rounded-xl font-semibold transition-all duration-300 text-sm"
                      onClick={() => handleWatchTrailer(movie)}
                    >
                      ▶️
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Statistics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-8 text-center backdrop-blur-sm">
            <div className="text-4xl font-bold text-purple-400 mb-2">{upcomingMoviesExtended.length}</div>
            <div className="text-gray-300 font-medium">Upcoming Movies</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-8 text-center backdrop-blur-sm">
            <div className="text-4xl font-bold text-blue-400 mb-2">
              {upcomingMoviesExtended.filter(movie => movie.language === 'Hindi').length}
            </div>
            <div className="text-gray-300 font-medium">Bollywood Films</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-2xl p-8 text-center backdrop-blur-sm">
            <div className="text-4xl font-bold text-green-400 mb-2">
              {upcomingMoviesExtended.filter(movie => ['Tamil', 'Telugu', 'Bengali', 'Kannada'].includes(movie.language)).length}
            </div>
            <div className="text-gray-300 font-medium">Regional Films</div>
          </div>
        </motion.div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 border border-purple-500/30 rounded-3xl p-10 text-center backdrop-blur-sm"
        >
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Never Miss a Blockbuster! 🎬
            </h3>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Get exclusive updates on movie releases, trailer launches, advance booking notifications, and special offers directly in your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm text-lg"
              />
              <button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl text-lg">
                Subscribe Now
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Join 50,000+ movie lovers who trust us for the latest updates. Unsubscribe anytime.
            </p>
          </div>
        </motion.div>
      </div>

      {/* ✅ Global Trailer Modal */}
      {activeMovie && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-purple-500/30">
            <iframe
              src={activeMovie.trailer}
              title={`${activeMovie.title} Trailer`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="w-full h-full"
            />
            <button
              className="absolute top-4 right-4 bg-gray-800/90 hover:bg-gray-700 text-white rounded-full p-3 transition-colors duration-200 backdrop-blur-sm"
              onClick={() => setActiveMovie(null)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UpcomingReleases;
