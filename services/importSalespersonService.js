const axios = require("axios");
const mongoose = require("mongoose");
const dbConnection = require("../db/Connection");
const Salesperson = require("../models/salesperson");
const getAccessToken = require("./getAccessTokenService");

const API_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp/getSalesperson";

async function importSalespersons() {
  try {
    await dbConnection();

    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Failed to retrieve access token.");

    const { data } = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("Data fetched from API:", data);
    if (!data.items || !Array.isArray(data.items)) {
      throw new Error("Invalid response format from API.");
    }

    let insertedCount = 0;

    for (const salesperson of data.items) {
      const exists = await Salesperson.findOne({
        salesperson_id: salesperson.salesperson_id,
      });

      if (!exists) {
        await Salesperson.create(salesperson);
        insertedCount++;
      }
    }

    console.log(`${insertedCount} new salespersons saved successfully.`);
  } catch (error) {
    console.error("Error fetching salespersons:", error.message || error);
  } finally {
    mongoose.connection.close();
  }
}

module.exports = importSalespersons;
