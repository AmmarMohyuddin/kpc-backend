const axios = require("axios");
const mongoose = require("mongoose");
const dbConnection = require("../db/Connection");
const Customer = require("../models/customer");
const getAccessToken = require("./getAccessTokenService");

const API_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp/getCustomers";

async function importCustomers() {
  try {
    await dbConnection();

    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Failed to retrieve access token.");

    const { data } = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!data.items || !Array.isArray(data.items)) {
      throw new Error("Invalid response format from API.");
    }

    let insertedCount = 0;

    for (const customer of data.items) {
      const exists = await Customer.findOne({ party_id: customer.party_id });
      if (!exists) {
        await Customer.create(customer);
        insertedCount++;
      }
    }

    console.log(`${insertedCount} new customers saved successfully.`);
  } catch (error) {
    console.error("Error fetching customers:", error.message || error);
  } finally {
    mongoose.connection.close();
  }
}

module.exports = importCustomers;
