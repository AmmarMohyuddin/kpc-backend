const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function oppFollowups(req, res) {
  try {
    console.log("🚀 Starting listFollow API...");

    // Extract params from query
    const { OPPORTUNITY_ID } = req.query.params || req.query;

    if (!OPPORTUNITY_ID) {
      return errorResponse(res, 400, "OPPORTUNITY_ID is required");
    }

    console.log("📊 Fetching follow-ups for OPPORTUNITY_ID:", OPPORTUNITY_ID);

    // 1️⃣ Get Access Token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return errorResponse(res, 401, "Failed to retrieve access token");
    }

    // 2️⃣ Call Oracle API - get all followups without pagination
    const response = await axios.get(`${API_BASE_URL}/getFollowup`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {}, // No params to get all records
    });

    console.log("✅ Oracle API Response received");

    // 3️⃣ Parse response safely
    const oracleData = response.data || {};
    let followups = oracleData.items || [];

    // 4️⃣ Filter: source must be "Opportunity" AND opportunity_id must match
    followups = followups.filter(
      (fu) => fu.source === "Opportunity" && fu.opportunity_id == OPPORTUNITY_ID
    );

    console.log(
      `📋 Found ${followups.length} follow-ups for opportunity ${OPPORTUNITY_ID}`
    );

    // 5️⃣ Return filtered followups without pagination
    return successResponse(res, 200, "Follow-ups fetched successfully", {
      followups,
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

module.exports = oppFollowups;
