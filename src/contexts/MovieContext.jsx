import React, { createContext, useContext, useState } from 'react';

const MovieContext = createContext(undefined);

export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
};

// Real movie data for August 2025 releases in Indian theaters
const mockMovies = [
  {
    id: '1',
    title: 'War 2',
    poster: 'https://i.ibb.co/7NzxFT3p/War2-306x393.jpg',
    backdrop: 'https://i.ibb.co/7NzxFT3p/War2-306x393.jpg',
    genre: ['Action', 'Thriller', 'Spy'],
    duration: 155,
    rating: 8.2,
    releaseDate: '2025-08-14',
    description:
      'Hrithik Roshan returns as Kabir alongside Jr NTR in this high-octane spy thriller sequel that promises explosive action and stunning visuals.',
    trailer: 'https://www.youtube.com/embed/mjBym9uKth4',
    cast: ['Hrithik Roshan', 'Jr NTR', 'Kiara Advani', 'Anil Kapoor'],
    director: 'Ayan Mukerji',
    language: 'Hindi',
  },
  {
    id: '2',
    title: 'Coolie',
    poster: 'https://i.ibb.co/QFkDs82V/rajinikanth-coolie-b-1006251001-306x393.jpg',
    backdrop: 'https://i.ibb.co/QFkDs82V/rajinikanth-coolie-b-1006251001-306x393.jpg',
    genre: ['Action', 'Drama', 'Thriller'],
    duration: 168,
    rating: 8.0,
    releaseDate: '2025-08-14',
    description:
      "Rajinikanth stars in Lokesh Kanagaraj's action-packed thriller about a railway coolie who uncovers a dangerous conspiracy.",
    trailer: 'https://www.youtube.com/embed/PuzNA314WCI',
    cast: ['Rajinikanth', 'Shruti Haasan', 'Upendra', 'Aamir Khan', 'Soubin Shahir'],
    director: 'Lokesh Kanagaraj',
    language: 'Tamil',
  },
  {
    id: '3',
    title: 'Saiyaara',
    poster: 'https://i.ibb.co/GQGdjR3Z/saiyaara.jpg',
    backdrop: 'https://i.ibb.co/GQGdjR3Z/saiyaara.jpg',
    genre: ['Romance', 'Drama', 'Musical'],
    duration: 142,
    rating: 7.5,
    releaseDate: '2025-08-07',
    description:
      'A romantic musical drama that captivates audiences with its emotional storyline and beautiful cinematography.',
    trailer: 'https://www.youtube.com/embed/9r-tT5IN0vg',
    cast: ['Aneet Padda', 'Ahaan Panday', 'Geeta Agarwal'],
    director: 'Mohit Suri',
    language: 'Hindi',
  },
  {
    id: '4',
    title: 'Mahavatar Narsimha',
    poster: 'https://i.ibb.co/7NLWZwVs/Narsimha.jpg',
    backdrop: 'https://i.ibb.co/7NLWZwVs/Narsimha.jpg',
    genre: ['Action', 'Animation', 'Fantasy'],
    duration: 147,
    rating: 7.8,
    releaseDate: '2025-07-25',
    description:
      'The demon Hiranyakashyap seeks revenge on Vishnu and declares himself a god. His son Prahlad remains devoted to Vishnu. Vishnu manifests as Narsimha to defeat the demon and restore balance.',
    trailer: 'https://www.youtube.com/embed/p7eE_dn9u4k',
    cast: ['Aditya Raj Sharma', 'Haripriya Matta', 'Priyanka Bhandari'],
    director: 'Ashwin Kumar',
    language: 'Hindi',
  },
  {
    id: '5',
    title: 'Andaaz 2',
    poster: 'https://i.ibb.co/Z1880WG1/Andaaz-2.jpg',
    backdrop: 'https://i.ibb.co/Z1880WG1/Andaaz-2.jpg',
    genre: ['Romance', 'Drama', 'Musical'],
    duration: 150,
    rating: 7.2,
    releaseDate: '2025-08-08',
    description:
      'The sequel to the romantic hit brings back the magic of love and music with stunning performances.',
    trailer: 'https://www.youtube.com/embed/quS0KgQzCQ0',
    cast: ['Aayush Kumar', 'Akaisha Vats', 'Natasha Fernandez'],
    director: 'Suneel Darshan',
    language: 'Hindi',
  },
  {
    id: '6',
    title: 'Weapons',
    poster: 'https://i.ibb.co/hkYjvLm/Weapons-306x393.jpg',
    backdrop: 'https://i.ibb.co/hkYjvLm/Weapons-306x393.jpg',
    genre: ['Action', 'Thriller', 'Crime'],
    duration: 138,
    rating: 7.6,
    releaseDate: '2025-08-08',
    description:
      'An intense action thriller about illegal arms trafficking and the fight against crime.',
    trailer: 'https://www.youtube.com/embed/OpThntO9ixc',
    cast: ['Julia Garner', 'Josh Brolin', 'Aldan Ehrenreich'],
    director: 'Zach Cregger',
    language: 'English',
  },
  {
    id: '7',
    title: 'Param Sundari',
    poster: 'https://i.ibb.co/YB3LQzHc/Param-Sundari.jpg',
    backdrop: 'https://i.ibb.co/YB3LQzHc/Param-Sundari.jpg',
    genre: ['Romance', 'Comedy', 'Drama'],
    duration: 140,
    rating: 7.6,
    releaseDate: '2025-08-29',
    description:
      "A heartwarming romantic comedy set in Kerala's backwaters, where North and South Indian cultures collide in love.",
    trailer: 'https://www.youtube.com/embed/fdWnfzsx-ks',
    cast: ['Janhvi Kapoor', 'Sidharth Malhotra', 'Sanjay Kapoor'],
    director: 'Tushar Jalota',
    language: 'Hindi',
    isUpcoming: true,
  },
  {
    id: '8',
    title: 'Jolly LLB 3',
    poster: 'https://i.ibb.co/s9YDKZ65/Jolly3.jpg',
    backdrop: 'https://i.ibb.co/s9YDKZ65/Jolly3.jpg',
    genre: ['Comedy', 'Drama', 'Legal'],
    duration: 145,
    rating: 8.0,
    releaseDate: '2025-09-19',
    description:
      'Akshay Kumar and Arshad Warsi return in this hilarious legal comedy that promises courtroom chaos.',
    trailer: 'https://www.youtube.com/embed/v1FAaUxF0kg',
    cast: ['Akshay Kumar', 'Arshad Warsi', 'Huma Qureshi'],
    director: 'Subhash Kapoor',
    language: 'Hindi',
    isUpcoming: true,
  },
  {
    id: '9',
    title: 'The Bengal Files',
    poster: 'https://i.ibb.co/hJhQ8hGr/The-Bengal-Files-1-306x393.jpg',
    backdrop: 'https://i.ibb.co/hJhQ8hGr/The-Bengal-Files-1-306x393.jpg',
    genre: ['Thriller', 'Mystery', 'Drama'],
    duration: 152,
    rating: 7.9,
    releaseDate: '2025-09-05',
    description:
      "A gripping political thriller that unveils dark secrets and conspiracies in Bengal's political landscape.",
    trailer: 'https://www.youtube.com/embed/3MfsZFAeNO8',
    cast: ['Eklavya Sood', 'Anupam Kher', 'Mithun Chakraborty'],
    director: 'Vivek Agnihotri',
    language: 'Bengali',
    isUpcoming: true,
  },
  {
    id: '10',
    title: 'Baaghi 4',
    poster: 'https://i.ibb.co/nqqcdYqY/Baaghi4.jpg',
    backdrop: 'https://i.ibb.co/nqqcdYqY/Baaghi4.jpg',
    genre: ['Action', 'Thriller', 'Romance'],
    duration: 150,
    rating: 8.1,
    releaseDate: '2025-09-05',
    description:
      'Tiger Shroff returns with high-octane action sequences and death-defying stunts in this adrenaline-pumping sequel.',
    trailer: 'https://www.youtube.com/embed/rbYNMvTkp8U',
    cast: ['Tiger Shroff', 'Kriti Sanon', 'Vijay Raaz'],
    director: 'Ahmed Khan',
    language: 'Hindi',
    isUpcoming: true,
  },
  {
    id: '11',
    title: 'Border 2',
    poster: 'https://i.ibb.co/B2NLpfjm/Border-2-306x393.jpg',
    backdrop: 'https://i.ibb.co/B2NLpfjm/Border-2-306x393.jpg',
    genre: ['Action', 'War', 'Drama'],
    duration: 145,
    rating: 7.8,
    releaseDate: '2026-01-22',
    description:
      '"Border 2" is an upcoming Bollywood war drama film, a sequel to the 1997 hit Border, directed by J.P. Dutta',
    trailer: 'https://www.youtube.com/embed/Tb-iW8FzYaA',
    cast: ['Sunny Deol', 'Suniel Shetty', 'Sonam Bajwa'],
    director: 'Anurag Singh',
    language: 'Hindi',
    isUpcoming: true,
  },
];

export const MovieProvider = ({ children }) => {
  const [movies] = useState(mockMovies);

  const searchMovies = (query) => {
    if (!query.trim()) return movies;
    return movies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(query.toLowerCase()) ||
        movie.genre.some((g) => g.toLowerCase().includes(query.toLowerCase())) ||
        movie.cast.some((actor) => actor.toLowerCase().includes(query.toLowerCase())) ||
        movie.director.toLowerCase().includes(query.toLowerCase())
    );
  };

  const getMovieById = (id) => {
    return movies.find((movie) => movie.id === id);
  };

  const nowShowing = movies.filter((movie) => !movie.isUpcoming);
  const upcomingMovies = movies.filter((movie) => movie.isUpcoming);

  return (
    <MovieContext.Provider
      value={{ movies, searchMovies, getMovieById, nowShowing, upcomingMovies }}
    >
      {children}
    </MovieContext.Provider>
  );
};
