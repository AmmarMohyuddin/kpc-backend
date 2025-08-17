const axios = require("axios");
const dbConnection = require("../db/Connection");
const Item = require("../models/item");
const getAccessToken = require("./getAccessTokenService");

const API_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp/getItems?limit=10000";

async function importItems() {
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

    for (const item of data.items) {
      // Check if already exists
      const exists = await Item.findOne({
        inventory_item_id: item.inventory_item_id,
      });

      if (!exists) {
        await Item.create(item);
        insertedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(
      `${insertedCount} new items saved successfully. ${skippedCount} items skipped (already exist).`
    );
  } catch (error) {
    console.error("Error importing inventory items:", error.message || error);
  }
}

module.exports = importItems;
