const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { Movie } = require('./models/Movie');
const Counter = require('./models/Counter');

dotenv.config();

const sampleMovies = [
  {
    title: 'Interstellar',
    genre: 'Sci-Fi',
    releaseYear: 2014,
    runtime: 169,
    platform: 'Prime Video',
    priority: 5,
    status: 'To Watch'
  },
  {
    title: 'The Dark Knight',
    genre: 'Action',
    releaseYear: 2008,
    runtime: 152,
    platform: 'Netflix',
    priority: 5,
    status: 'Watched',
    rating: 10,
    watchedDate: new Date('2026-08-15')
  },
  {
    title: 'Parasite',
    genre: 'Thriller',
    releaseYear: 2019,
    runtime: 132,
    platform: 'Hotstar',
    priority: 4,
    status: 'Watched',
    rating: 9,
    watchedDate: new Date('2026-09-02')
  },
  {
    title: 'Whiplash',
    genre: 'Drama',
    releaseYear: 2014,
    runtime: 106,
    platform: 'Netflix',
    priority: 5,
    status: 'Watching'
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    genre: 'Action',
    releaseYear: 2023,
    runtime: 140,
    platform: 'Netflix',
    priority: 4,
    status: 'To Watch'
  },
  {
    title: 'Dune: Part Two',
    genre: 'Sci-Fi',
    releaseYear: 2024,
    runtime: 166,
    platform: 'Theatre',
    priority: 5,
    status: 'Watched',
    rating: 9,
    watchedDate: new Date('2026-03-10')
  },
  {
    title: 'La La Land',
    genre: 'Romance',
    releaseYear: 2016,
    runtime: 128,
    platform: 'Prime Video',
    priority: 3,
    status: 'To Watch'
  },
  {
    title: 'A Quiet Place',
    genre: 'Horror',
    releaseYear: 2018,
    runtime: 90,
    platform: 'Netflix',
    priority: 4,
    status: 'To Watch'
  },
  {
    title: 'The Grand Budapest Hotel',
    genre: 'Comedy',
    releaseYear: 2014,
    runtime: 99,
    platform: 'Hotstar',
    priority: 3,
    status: 'Watched',
    rating: 8,
    watchedDate: new Date('2026-05-20')
  }
];

async function seedData() {
  await connectDB();

  console.log('Clearing existing movies and counters for fresh seed...');
  await Movie.deleteMany({});
  await Counter.deleteMany({});

  for (const item of sampleMovies) {
    const counter = await Counter.findOneAndUpdate(
      { releaseYear: item.releaseYear },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const seqFormatted = String(counter.seq).padStart(3, '0');
    const movieCode = `MV-${item.releaseYear}-${seqFormatted}`;

    const movie = new Movie({
      ...item,
      movieCode,
      titleLower: item.title.trim().toLowerCase()
    });

    await movie.save();
    console.log(`Seeded: [${movieCode}] ${item.title} (${item.status})`);
  }

  console.log('Database seeded successfully!');
  process.exit(0);
}

seedData().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
