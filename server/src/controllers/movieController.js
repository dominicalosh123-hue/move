const { Movie, GENRES, PLATFORMS, STATUSES } = require('../models/Movie');
const Counter = require('../models/Counter');

/**
 * Valid allowed status transitions
 */
const VALID_TRANSITIONS = {
  'To Watch': ['Watching', 'Watched'],
  'Watching': ['Watched', 'To Watch'],
  'Watched': [] // Terminal state, cannot be changed
};

/**
 * Controller: Add a new movie
 * POST /api/movies
 */
const addMovie = async (req, res) => {
  try {
    const { title, genre, releaseYear, runtime, platform, priority } = req.body;

    // Field presence checks
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
        data: null
      });
    }

    if (!genre) {
      return res.status(400).json({
        success: false,
        message: 'Genre is required',
        data: null
      });
    }

    if (!GENRES.includes(genre)) {
      return res.status(400).json({
        success: false,
        message: `Genre must be one of: ${GENRES.join(', ')}`,
        data: null
      });
    }

    const currentYear = new Date().getFullYear();
    const parsedYear = Number(releaseYear);
    if (!releaseYear || isNaN(parsedYear) || parsedYear < 1950 || parsedYear > currentYear) {
      return res.status(400).json({
        success: false,
        message: `Release Year must be between 1950 and ${currentYear}`,
        data: null
      });
    }

    const parsedRuntime = Number(runtime);
    if (!runtime || isNaN(parsedRuntime) || parsedRuntime < 30 || parsedRuntime > 300) {
      return res.status(400).json({
        success: false,
        message: 'Runtime must be between 30 and 300 minutes',
        data: null
      });
    }

    if (!platform) {
      return res.status(400).json({
        success: false,
        message: 'Platform is required',
        data: null
      });
    }

    if (!PLATFORMS.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: `Platform must be one of: ${PLATFORMS.join(', ')}`,
        data: null
      });
    }

    const parsedPriority = Number(priority);
    if (!priority || isNaN(parsedPriority) || parsedPriority < 1 || parsedPriority > 5) {
      return res.status(400).json({
        success: false,
        message: 'Priority must be between 1 and 5 (5 is highest)',
        data: null
      });
    }

    const trimmedTitle = title.trim();
    const titleLower = trimmedTitle.toLowerCase();

    // Duplicate check: Same Title and Release Year (case-insensitive)
    const existingMovie = await Movie.findOne({
      titleLower,
      releaseYear: parsedYear
    });

    if (existingMovie) {
      return res.status(409).json({
        success: false,
        message: `A movie with the title "${trimmedTitle}" and release year ${parsedYear} already exists in your watchlist.`,
        data: null
      });
    }

    // Auto-generate Movie Code: MV-<release year>-<3-digit sequence>
    // Sequence increases atomically per release year
    const counter = await Counter.findOneAndUpdate(
      { releaseYear: parsedYear },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const seqFormatted = String(counter.seq).padStart(3, '0');
    const movieCode = `MV-${parsedYear}-${seqFormatted}`;

    const newMovie = new Movie({
      movieCode,
      title: trimmedTitle,
      titleLower,
      genre,
      releaseYear: parsedYear,
      runtime: parsedRuntime,
      platform,
      priority: parsedPriority,
      status: 'To Watch',
      rating: null,
      watchedDate: null
    });

    const savedMovie = await newMovie.save();

    return res.status(201).json({
      success: true,
      message: 'Movie added successfully to watchlist',
      data: savedMovie
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A movie with this title and release year already exists.',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      data: null
    });
  }
};

/**
 * Controller: View Movies with filtering, searching, pagination (6 per page)
 * GET /api/movies
 */
const getMovies = async (req, res) => {
  try {
    const { status, genre, search, page = 1 } = req.query;

    const queryFilter = {};

    if (status && status !== 'All') {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status filter. Allowed: ${STATUSES.join(', ')}`,
          data: null
        });
      }
      queryFilter.status = status;
    }

    if (genre && genre !== 'All') {
      if (!GENRES.includes(genre)) {
        return res.status(400).json({
          success: false,
          message: `Invalid genre filter. Allowed: ${GENRES.join(', ')}`,
          data: null
        });
      }
      queryFilter.genre = genre;
    }

    if (search && search.trim()) {
      // Case-insensitive title search
      queryFilter.title = { $regex: search.trim(), $options: 'i' };
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = 6; // Fixed 6 movies per page as per requirement
    const skip = (pageNumber - 1) * limitNumber;

    const totalMovies = await Movie.countDocuments(queryFilter);
    const totalPages = Math.ceil(totalMovies / limitNumber) || 1;

    // Sorting rule:
    // "Movies in To Watch status must be sorted by Priority (high to low) first"
    // We achieve this seamlessly via aggregation so that when listing,
    // "To Watch" movies are grouped at the top sorted by Priority DESC,
    // followed by other statuses, or when filtered by "To Watch", priority is desc.
    const movies = await Movie.aggregate([
      { $match: queryFilter },
      {
        $addFields: {
          statusOrder: {
            $switch: {
              branches: [
                { case: { $eq: ['$status', 'To Watch'] }, then: 1 },
                { case: { $eq: ['$status', 'Watching'] }, then: 2 },
                { case: { $eq: ['$status', 'Watched'] }, then: 3 }
              ],
              default: 4
            }
          }
        }
      },
      {
        $sort: {
          statusOrder: 1,
          priority: -1,
          runtime: 1,
          createdAt: -1
        }
      },
      { $skip: skip },
      { $limit: limitNumber },
      {
        $project: {
          statusOrder: 0
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      message: 'Movies retrieved successfully',
      data: {
        movies,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalMovies,
          limit: limitNumber
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      data: null
    });
  }
};

/**
 * Controller: Get Single Movie
 * GET /api/movies/:id
 */
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Movie retrieved successfully',
      data: movie
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      data: null
    });
  }
};

/**
 * Controller: Status Workflow Transition
 * PATCH /api/movies/:id/status
 */
const updateMovieStatus = async (req, res) => {
  try {
    const { status: newStatus, rating } = req.body;
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        data: null
      });
    }

    const currentStatus = movie.status;

    // Check terminal status
    if (currentStatus === 'Watched') {
      return res.status(400).json({
        success: false,
        message: 'Status "Watched" is final and cannot be changed.',
        data: null
      });
    }

    // Validate transition
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition: "${currentStatus}" can only transition to ${allowed.map(s => `"${s}"`).join(' or ')}.`,
        data: null
      });
    }

    // Rating rule:
    // When moved to Watched, rating (1 to 10) is mandatory, watchedDate is set automatically.
    // Rating must be rejected for any movie that is not in Watched status.
    if (newStatus === 'Watched') {
      if (rating === undefined || rating === null || rating === '') {
        return res.status(400).json({
          success: false,
          message: 'A rating between 1 and 10 is mandatory when marking a movie as Watched.',
          data: null
        });
      }

      const parsedRating = Number(rating);
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 10) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be a number between 1 and 10.',
          data: null
        });
      }

      movie.status = 'Watched';
      movie.rating = parsedRating;
      movie.watchedDate = new Date();
    } else {
      // New status is not Watched (e.g., 'Watching' or 'To Watch')
      if (rating !== undefined && rating !== null) {
        return res.status(400).json({
          success: false,
          message: 'Rating is not allowed for movies that are not in "Watched" status.',
          data: null
        });
      }
      movie.status = newStatus;
    }

    const updatedMovie = await movie.save();

    return res.status(200).json({
      success: true,
      message: `Movie status updated to "${newStatus}" successfully`,
      data: updatedMovie
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      data: null
    });
  }
};

/**
 * Controller: Edit Movie
 * PUT /api/movies/:id
 * Can edit: Title, Genre, Runtime, Platform, Priority (and Rating if Watched)
 * Cannot edit: Movie Code and Release Year
 */
const editMovie = async (req, res) => {
  try {
    const { title, genre, runtime, platform, priority, rating, movieCode, releaseYear } = req.body;
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        data: null
      });
    }

    // Guard against attempting to edit movieCode or releaseYear
    if (movieCode && movieCode !== movie.movieCode) {
      return res.status(400).json({
        success: false,
        message: 'Movie Code is auto-generated and cannot be edited.',
        data: null
      });
    }

    if (releaseYear && Number(releaseYear) !== movie.releaseYear) {
      return res.status(400).json({
        success: false,
        message: 'Release Year cannot be edited after creation.',
        data: null
      });
    }

    // Validation for editable fields if provided
    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty',
          data: null
        });
      }

      const trimmedTitle = title.trim();
      const titleLower = trimmedTitle.toLowerCase();

      // Check if duplicate title exists with this movie's releaseYear
      const duplicate = await Movie.findOne({
        _id: { $ne: movie._id },
        titleLower,
        releaseYear: movie.releaseYear
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `A movie with the title "${trimmedTitle}" and release year ${movie.releaseYear} already exists.`,
          data: null
        });
      }

      movie.title = trimmedTitle;
      movie.titleLower = titleLower;
    }

    if (genre !== undefined) {
      if (!GENRES.includes(genre)) {
        return res.status(400).json({
          success: false,
          message: `Genre must be one of: ${GENRES.join(', ')}`,
          data: null
        });
      }
      movie.genre = genre;
    }

    if (runtime !== undefined) {
      const parsedRuntime = Number(runtime);
      if (isNaN(parsedRuntime) || parsedRuntime < 30 || parsedRuntime > 300) {
        return res.status(400).json({
          success: false,
          message: 'Runtime must be between 30 and 300 minutes',
          data: null
        });
      }
      movie.runtime = parsedRuntime;
    }

    if (platform !== undefined) {
      if (!PLATFORMS.includes(platform)) {
        return res.status(400).json({
          success: false,
          message: `Platform must be one of: ${PLATFORMS.join(', ')}`,
          data: null
        });
      }
      movie.platform = platform;
    }

    if (priority !== undefined) {
      const parsedPriority = Number(priority);
      if (isNaN(parsedPriority) || parsedPriority < 1 || parsedPriority > 5) {
        return res.status(400).json({
          success: false,
          message: 'Priority must be between 1 and 5',
          data: null
        });
      }
      movie.priority = parsedPriority;
    }

    // Rating rule:
    // "A rating must be rejected for any movie that is not in Watched status. A rating can be edited later only for Watched movies."
    if (rating !== undefined && rating !== null) {
      if (movie.status !== 'Watched') {
        return res.status(400).json({
          success: false,
          message: 'A rating cannot be added or edited for movies that are not in "Watched" status.',
          data: null
        });
      }

      const parsedRating = Number(rating);
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 10) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 10.',
          data: null
        });
      }
      movie.rating = parsedRating;
    }

    const updatedMovie = await movie.save();

    return res.status(200).json({
      success: true,
      message: 'Movie updated successfully',
      data: updatedMovie
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A movie with this title and release year already exists.',
        data: null
      });
    }
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      data: null
    });
  }
};

/**
 * Controller: Delete Movie
 * DELETE /api/movies/:id
 * Rule: A movie in "Watching" status cannot be deleted. Return 400 error.
 */
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
        data: null
      });
    }

    if (movie.status === 'Watching') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a movie currently in "Watching" status.',
        data: null
      });
    }

    await Movie.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: `Movie "${movie.title}" (${movie.movieCode}) deleted successfully`,
      data: { id: movie._id, movieCode: movie.movieCode }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      data: null
    });
  }
};

/**
 * Controller: Watch Next Recommendation
 * GET /api/movies/watch-next
 * Rule: Return To Watch movie with highest priority.
 * If several have same priority, return the one with shortest runtime.
 * If no such movie, return 404.
 */
const getWatchNext = async (req, res) => {
  try {
    const movie = await Movie.findOne({ status: 'To Watch' })
      .sort({ priority: -1, runtime: 1, createdAt: 1 });

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'No movies found in your "To Watch" list to recommend.',
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Recommended movie found',
      data: movie
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      data: null
    });
  }
};

/**
 * Controller: Statistics Dashboard
 * GET /api/movies/stats
 * Rule:
 * - Total movies in each status
 * - Total hours watched (sum of runtime of Watched movies)
 * - Average rating of Watched movies (rounded to 1 decimal place)
 * - Genre with the most Watched movies
 */
const getStats = async (req, res) => {
  try {
    // Aggregation for counts per status
    const statusCountsAgg = await Movie.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      toWatch: 0,
      watching: 0,
      watched: 0,
      total: 0
    };

    statusCountsAgg.forEach(item => {
      if (item._id === 'To Watch') statusCounts.toWatch = item.count;
      else if (item._id === 'Watching') statusCounts.watching = item.count;
      else if (item._id === 'Watched') statusCounts.watched = item.count;
      statusCounts.total += item.count;
    });

    // Aggregation for Watched statistics
    const watchedStatsAgg = await Movie.aggregate([
      { $match: { status: 'Watched' } },
      {
        $group: {
          _id: null,
          totalRuntimeMinutes: { $sum: '$runtime' },
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    const watchedStats = watchedStatsAgg[0] || {
      totalRuntimeMinutes: 0,
      avgRating: 0,
      count: 0
    };

    const totalMinutes = watchedStats.totalRuntimeMinutes || 0;
    const totalHoursWatched = Math.round((totalMinutes / 60) * 10) / 10; // 1 decimal place
    const avgRating = watchedStats.avgRating ? Math.round(watchedStats.avgRating * 10) / 10 : 0;

    // Aggregation for genre with most Watched movies
    const topWatchedGenreAgg = await Movie.aggregate([
      { $match: { status: 'Watched' } },
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1, _id: 1 } },
      { $limit: 1 }
    ]);

    const topWatchedGenre = topWatchedGenreAgg.length > 0
      ? `${topWatchedGenreAgg[0]._id} (${topWatchedGenreAgg[0].count})`
      : 'N/A';

    return res.status(200).json({
      success: true,
      message: 'Statistics calculated successfully',
      data: {
        statusCounts,
        totalHoursWatched,
        totalMinutesWatched: totalMinutes,
        avgRating,
        topWatchedGenre
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
      data: null
    });
  }
};

module.exports = {
  addMovie,
  getMovies,
  getMovieById,
  updateMovieStatus,
  editMovie,
  deleteMovie,
  getWatchNext,
  getStats,
  VALID_TRANSITIONS
};
