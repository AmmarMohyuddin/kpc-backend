// const createAdmin = require("../services/createAdminService");
const importUsers = require("../services/importUserService");
const getAccessToken = require("../services/getAccessTokenService");
const importCities = require("../services/importCityService");
const importBlocks = require("../services/importBlockService");
const importCustomers = require("../services/importCustomerService");
const importItems = require("../services/importItemService");
const importPrices = require("../services/importPriceService");
const importSalespersons = require("../services/importSalespersonService");
const dbConnection = require("../db/Connection");
const mongoose = require("mongoose");

const seedAdmin = async () => {
  console.log("Starting the seeding process...");
  try {
    await dbConnection();

    console.log("Creating admin...");
    // await createAdmin();

    console.log("Importing users...");
    await importUsers();

    console.log("Generating Access Token...");
    await getAccessToken();

    console.log("Importing Customers...");
    await importCustomers();

    console.log("Importing Items...");
    await importItems();

    console.log("Importing Prices...");
    await importPrices();

    console.log("Importing Cities...");
    await importCities();

    console.log("Importing Blocks...");
    await importBlocks();

    console.log("Importing Salespersons...");
    await importSalespersons();

    console.log("Seeding process completed successfully.");
  } catch (error) {
    console.error("Error in seeding process:", error.message);
  } finally {
    mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};

seedAdmin();
