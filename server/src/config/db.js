const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI && process.env.MONGODB_URI.trim();

  if (uri) {
    try {
      const conn = await mongoose.connect(uri);
      console.log(`Connected to MongoDB Atlas: ${conn.connection.host} (${conn.connection.name})`);
      return;
    } catch (error) {
      console.error(`MongoDB Atlas connection error: ${error.message}`);
      console.log('Falling back to local/in-memory MongoDB instance for development...');
    }
  } else {
    console.log('No MONGODB_URI found in .env. Attempting local MongoDB connection or in-memory fallback...');
  }

  // Try standard local MongoDB first if available
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/movie_watchlist', {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`Connected to Local MongoDB: ${conn.connection.host}`);
    return;
  } catch (err) {
    // Fall back to mongodb-memory-server
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`Connected to In-Memory MongoDB: ${conn.connection.host}`);
      console.log('Note: To connect to MongoDB Atlas, set MONGODB_URI in server/.env');
    } catch (memErr) {
      console.error('Fatal: Could not initialize any MongoDB connection:', memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
