const axios = require("axios");
const dbConnection = require("../db/Connection");
const Price = require("../models/price");
const getAccessToken = require("./getAccessTokenService");

const API_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp/getpricelist?limit=10000";

async function importPrices() {
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
    let updatedCount = 0;
    let skippedCount = 0;

    for (const price of data.items) {
      // Check if already exists (using name + item_number + start_date as unique identifier)
      const existingPrice = await Price.findOne({
        name: price.name,
        item_number: price.item_number,
        start_date: price.start_date,
      });

      if (!existingPrice) {
        await Price.create(price);
        insertedCount++;
      } else if (
        existingPrice.base_price !== price.base_price ||
        existingPrice.end_date !== price.end_date
      ) {
        // Update if price or end date changed
        await Price.updateOne(
          { _id: existingPrice._id },
          {
            base_price: price.base_price,
            end_date: price.end_date,
            pricing_uom_code: price.pricing_uom_code,
          }
        );
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(
      `${insertedCount} new prices saved. ${updatedCount} prices updated. ${skippedCount} prices skipped (no changes).`
    );
  } catch (error) {
    console.error("Error importing prices:", error.message || error);
  }
}

module.exports = importPrices;
