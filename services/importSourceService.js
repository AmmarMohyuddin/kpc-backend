const axios = require("axios");
const dbConnection = require("../db/Connection");
const Source = require("../models/source");
const getAccessToken = require("./getAccessTokenService");

// Update this URL to match your source API endpoint
const API_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp/getLeadSources?limit=10000";

async function importSources() {
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

    for (const source of data.items) {
      // Check if already exists (using source_id as unique identifier)
      const existingSource = await Source.findOne({
        source_id: source.source_id,
      });

      if (!existingSource) {
        await Source.create(source);
        insertedCount++;
      } else if (
        existingSource.lead_source !== source.lead_source ||
        existingSource.description !== source.description
      ) {
        // Update if source name or description changed
        await Source.updateOne(
          { _id: existingSource._id },
          {
            lead_source: source.lead_source,
            description: source.description,
          }
        );
        updatedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(
      `${insertedCount} new sources saved. ${updatedCount} sources updated. ${skippedCount} sources skipped (no changes).`
    );
  } catch (error) {
    console.error("Error importing sources:", error.message || error);
  }
}

module.exports = importSources;
