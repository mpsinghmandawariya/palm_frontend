const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/palm_pay";

  try {
    const conn = await mongoose.connect(mongoURI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error("MongoDB Connection Failed:", { error: error.message });
    process.exit(1);
  }
};

module.exports = connectDB;
