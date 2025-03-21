const createAdmin = require("../services/createAdminService");
const importUsers = require("../services/importUserService");
const dbConnection = require("../db/Connection");
const mongoose = require("mongoose");

const seedAdmin = async () => {
  console.log("Starting the seeding process...");
  try {
    await dbConnection();

    console.log("Creating admin...");
    await createAdmin();

    console.log("Importing users...");
    await importUsers();

    console.log("Seeding process completed successfully.");
  } catch (error) {
    console.error("Error in seeding process:", error.message);
  } finally {
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

seedAdmin();
