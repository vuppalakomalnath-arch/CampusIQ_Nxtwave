const mongoose = require('mongoose');
const dns = require('dns');
const env = require('./env');

// Configure public DNS servers to resolve MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: true,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database] MongoDB Connection Error: ${error.message}`);
    // In dev mode, don't crash immediately so mock or diagnostic endpoints work
    if (env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = { connectDB, mongoose };
