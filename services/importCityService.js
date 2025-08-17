const axios = require("axios");
const dbConnection = require("../db/Connection");
const City = require("../models/city"); // correct model
const getAccessToken = require("./getAccessTokenService");

const API_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp/customerDetailsLOV?TYPE=CITY&limit=10000";

async function importCities() {
  try {
    // Connect to DB
    await dbConnection();

    // Get token
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Failed to retrieve access token.");

    // Fetch from API
    const { data } = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!data.items || !Array.isArray(data.items)) {
      throw new Error("Invalid response format from API.");
    }

    let insertedCount = 0;
    let skippedCount = 0;

    for (const cityItem of data.items) {
      const cityName = cityItem.value?.trim();
      if (!cityName) continue;

      // Check if already exists
      const existingCity = await City.findOne({ name: cityName });

      if (!existingCity) {
        await City.create({ name: cityName });
        insertedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(
      `${insertedCount} new cities saved. ${skippedCount} cities skipped (already exist).`
    );
  } catch (error) {
    console.error("Error importing cities:", error.message || error);
  }
}

module.exports = importCities;
