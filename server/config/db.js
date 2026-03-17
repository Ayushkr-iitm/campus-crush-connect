const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in environment variables");
  }

  const maxRetries = Number(process.env.MONGODB_CONNECT_RETRIES || 30);
  let attempt = 0;

  // Keep the process alive on Render even if Atlas is temporarily blocked/cold.
  // We retry instead of exiting, and the API can still respond (health, etc).
  // Actual DB-backed routes will work once the connection is established.
  while (attempt < maxRetries) {
    attempt += 1;
    try {
      await mongoose.connect(uri, {
        autoIndex: true
      });
      // eslint-disable-next-line no-console
      console.log("MongoDB connected");
      return;
    } catch (err) {
      const delayMs = Math.min(30_000, 1000 * Math.pow(1.5, attempt));
      // eslint-disable-next-line no-console
      console.error(`MongoDB connection attempt ${attempt}/${maxRetries} failed:`, err.message);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  throw new Error(`MongoDB connection failed after ${maxRetries} attempts`);
};

module.exports = connectDB;

