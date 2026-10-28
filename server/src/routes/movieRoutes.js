const express = require('express');
const router = express.Router();
const {
  addMovie,
  getMovies,
  getMovieById,
  updateMovieStatus,
  editMovie,
  deleteMovie,
  getWatchNext,
  getStats
} = require('../controllers/movieController');

// Specific endpoints first to avoid parameterized :id collision
router.get('/watch-next', getWatchNext);
router.get('/stats', getStats);

// Main collection endpoints
router.post('/', addMovie);
router.get('/', getMovies);

// Item specific endpoints
router.get('/:id', getMovieById);
router.put('/:id', editMovie);
router.patch('/:id/status', updateMovieStatus);
router.delete('/:id', deleteMovie);

module.exports = router;
