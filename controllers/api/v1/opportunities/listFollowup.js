const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function listFollow(req, res) {
  try {
    console.log("🚀 Starting listFollow API...");

    // Extract params from query
    const { limit, offset, OPPORTUNITY_ID, FOLLOWUP_ID } =
      req.query.params || req.query;

    const limitInt = parseInt(limit);
    const offsetInt = parseInt(offset);

    // Build params for Oracle API
    const params = {};
    if (OPPORTUNITY_ID) {
      params.OPPORTUNITY_ID = OPPORTUNITY_ID;
    } else if (FOLLOWUP_ID) {
      params.FOLLOWUP_ID = FOLLOWUP_ID;
    } else {
      // Only apply pagination if no filter is present
      params.limit = limitInt;
      params.offset = offsetInt;
    }

    console.log("📊 Params sent to Oracle API:", params);

    // 1️⃣ Get Access Token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return errorResponse(res, 401, "Failed to retrieve access token");
    }

    // 2️⃣ Call Oracle API
    const response = await axios.get(`${API_BASE_URL}/getFollowup`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    });

    console.log("✅ Oracle API Response received");

    // 3️⃣ Parse response safely
    const oracleData = response.data || {};
    let followups = oracleData.items || [];

    // 4️⃣ Filter to only those with source "Opportunity"
    followups = followups.filter((fu) => fu.source === "Opportunity");

    // 5️⃣ Return structured response
    return successResponse(res, 200, "Follow-ups fetched successfully", {
      followups,
      pagination: {
        limit: oracleData.limit ?? limitInt,
        offset: oracleData.offset ?? offsetInt,
        hasMore: oracleData.hasMore ?? false,
      },
    });
  } catch (error) {
    console.error(
      "❌ Error fetching follow-ups:",
      error.response?.data || error.message
    );

    if (error.response) {
      return errorResponse(
        res,
        error.response.status || 500,
        error.response.data?.message || "Oracle API error"
      );
    }

    return errorResponse(res, 500, "Internal Server Error");
  }
}

module.exports = listFollow;
