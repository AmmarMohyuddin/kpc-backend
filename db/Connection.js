const mongoose = require("mongoose");
require("dotenv").config();

const dbConnection = async () => {
  try {
    const MONGODB_URI = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.DATABASE_NAME}`;

    const connected = await mongoose.connect(MONGODB_URI);

    if (connected) {
      console.log(`Connected to the Database: ${process.env.DATABASE_NAME}`);
    } else {
      throw new Error(
        `Failed to connect with Database: ${process.env.DATABASE_NAME}`
      );
    }

    return true;
  } catch (err) {
    throw new Error(
      `Failed to connect with Database: ${process.env.DATABASE_NAME}. Error: ${err.message}`
    );
  }
};

module.exports = dbConnection;
