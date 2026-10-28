const mongoose = require('mongoose');

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller'];
const PLATFORMS = ['Netflix', 'Prime Video', 'Hotstar', 'Theatre', 'Other'];
const STATUSES = ['To Watch', 'Watching', 'Watched'];

const movieSchema = new mongoose.Schema(
  {
    movieCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true
    },
    titleLower: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
      enum: {
        values: GENRES,
        message: '{VALUE} is not a valid genre'
      }
    },
    releaseYear: {
      type: Number,
      required: [true, 'Release year is required'],
      validate: {
        validator: function (val) {
          const currentYear = new Date().getFullYear();
          return val >= 1950 && val <= currentYear;
        },
        message: function (props) {
          return `Release year must be between 1950 and ${new Date().getFullYear()}`;
        }
      }
    },
    runtime: {
      type: Number,
      required: [true, 'Runtime is required'],
      min: [30, 'Runtime must be at least 30 minutes'],
      max: [300, 'Runtime must not exceed 300 minutes']
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      enum: {
        values: PLATFORMS,
        message: '{VALUE} is not a valid platform'
      }
    },
    priority: {
      type: Number,
      required: [true, 'Priority is required'],
      min: [1, 'Priority must be between 1 and 5'],
      max: [5, 'Priority must be between 1 and 5']
    },
    status: {
      type: String,
      default: 'To Watch',
      enum: {
        values: STATUSES,
        message: '{VALUE} is not a valid status'
      }
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating cannot exceed 10'],
      default: null
    },
    watchedDate: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index for Title (case-insensitive) + Release Year
movieSchema.index({ titleLower: 1, releaseYear: 1 }, { unique: true });

module.exports = {
  Movie: mongoose.model('Movie', movieSchema),
  GENRES,
  PLATFORMS,
  STATUSES
};
