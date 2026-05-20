import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { useMovies } from '../contexts/MovieContext';
import MovieCard from '../components/MovieCard';

const Movies = () => {
  const { movies } = useMovies();
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState('title');

  const genres = [
    'All',
    'Action',
    'Adventure',
    'Comedy',
    'Drama',
    'Sci-Fi',
    'Thriller',
    'Fantasy',
    'Crime',
  ];

  // Only show movies that are now in cinema (not upcoming)
  const filteredMovies = movies.filter(
    (movie) =>
      (selectedGenre === 'All' || movie.genre.includes(selectedGenre)) &&
      !movie.isUpcoming
  );

  const sortedMovies = [...filteredMovies].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'duration':
        return b.duration - a.duration;
      case 'releaseDate':
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      default:
        return a.title.localeCompare(b.title);
    }
  });

  // Only show 8 movies
  const displayedMovies = sortedMovies.slice(0, 8);

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
            All Movies
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover and book tickets for the latest blockbusters and timeless classics
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-6 mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <span className="text-lg font-semibold text-white">Filters</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Genre Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Genre
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="title">Title (A-Z)</option>
                <option value="rating">Rating (High to Low)</option>
                <option value="duration">Duration (Long to Short)</option>
                <option value="releaseDate">Release Date (New to Old)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Movies Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {displayedMovies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              index={index}
              scrollToTopOnNav={true}
            />
          ))}
        </motion.div>

        {/* No Results */}
        {displayedMovies.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Movies Found</h3>
            <p className="text-gray-400">
              Try adjusting your filters to see more results
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Movies;
