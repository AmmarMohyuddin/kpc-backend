const axios = require("axios");
const dbConnection = require("../db/Connection");
const Block = require("../models/block");
const getAccessToken = require("./getAccessTokenService");

const API_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp/customerDetailsLOV?TYPE=BLOCK&limit=10000";

async function importBlocks() {
  try {
    await dbConnection();

    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Failed to retrieve access token.");

    const { data } = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!data.items || !Array.isArray(data.items)) {
      throw new Error("Invalid response format from API.");
    }

    let insertedCount = 0;
    let skippedCount = 0;

    for (const item of data.items) {
      const blockName = item.value?.replace(/\s+/g, " ").trim();
      if (!blockName) continue;

      const result = await Block.updateOne(
        { name: blockName },
        { $setOnInsert: { name: blockName } },
        { upsert: true, collation: { locale: "en", strength: 2 } }
      );

      if (result.upsertedCount > 0) {
        insertedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(
      `${insertedCount} new blocks saved. ${skippedCount} blocks skipped (already exist).`
    );
  } catch (error) {
    console.error("Error importing blocks:", error.message || error);
  }
}

module.exports = importBlocks;
