const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const movieRoutes = require('./routes/movieRoutes');

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Movie Watchlist API is running smoothly',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

// Mount Movie Routes
app.use('/api/movies', movieRoutes);

// Catch 404 for unknown API routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`,
    data: null
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
    data: null
  });
});

const { Movie } = require('./models/Movie');
const Counter = require('./models/Counter');

const PORT = process.env.PORT || 5000;

const initialSeedData = [
  { title: 'Interstellar', genre: 'Sci-Fi', releaseYear: 2014, runtime: 169, platform: 'Prime Video', priority: 5, status: 'To Watch' },
  { title: 'The Dark Knight', genre: 'Action', releaseYear: 2008, runtime: 152, platform: 'Netflix', priority: 5, status: 'Watched', rating: 10, watchedDate: new Date('2026-08-15') },
  { title: 'Parasite', genre: 'Thriller', releaseYear: 2019, runtime: 132, platform: 'Hotstar', priority: 4, status: 'Watched', rating: 9, watchedDate: new Date('2026-09-02') },
  { title: 'Whiplash', genre: 'Drama', releaseYear: 2014, runtime: 106, platform: 'Netflix', priority: 5, status: 'Watching' },
  { title: 'Spider-Man: Across the Spider-Verse', genre: 'Action', releaseYear: 2023, runtime: 140, platform: 'Netflix', priority: 4, status: 'To Watch' },
  { title: 'Dune: Part Two', genre: 'Sci-Fi', releaseYear: 2024, runtime: 166, platform: 'Theatre', priority: 5, status: 'Watched', rating: 9, watchedDate: new Date('2026-03-10') },
  { title: 'La La Land', genre: 'Romance', releaseYear: 2016, runtime: 128, platform: 'Prime Video', priority: 3, status: 'To Watch' },
  { title: 'A Quiet Place', genre: 'Horror', releaseYear: 2018, runtime: 90, platform: 'Netflix', priority: 4, status: 'To Watch' },
  { title: 'The Grand Budapest Hotel', genre: 'Comedy', releaseYear: 2014, runtime: 99, platform: 'Hotstar', priority: 3, status: 'Watched', rating: 8, watchedDate: new Date('2026-05-20') }
];

async function seedIfEmpty() {
  const count = await Movie.countDocuments();
  if (count === 0) {
    console.log('Database is empty. Seeding initial movie watchlist data...');
    for (const item of initialSeedData) {
      const counter = await Counter.findOneAndUpdate(
        { releaseYear: item.releaseYear },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const seqFormatted = String(counter.seq).padStart(3, '0');
      const movieCode = `MV-${item.releaseYear}-${seqFormatted}`;
      await Movie.create({
        ...item,
        movieCode,
        titleLower: item.title.trim().toLowerCase()
      });
    }
    console.log('Initial sample movies successfully loaded into watchlist!');
  }
}

// Start server after connecting to MongoDB
connectDB().then(async () => {
  await seedIfEmpty();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API Base URL: http://localhost:${PORT}/api/movies`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
});
