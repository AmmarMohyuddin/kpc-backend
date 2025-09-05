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

    // Extract pagination parameters from query string
    const { limit = 10, offset = 0 } = req.query;
    const limitInt = parseInt(limit);
    const offsetInt = parseInt(offset);

    console.log(`📊 Pagination - limit: ${limitInt}, offset: ${offsetInt}`);

    // 1️⃣ Get Access Token
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Failed to retrieve access token");

    // 2️⃣ Call Oracle API with pagination parameters
    const response = await axios.get(`${API_BASE_URL}/getFollowup`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        limit: limitInt,
        offset: offsetInt,
      },
    });

    console.log("✅ Oracle API Response received");

    // 3️⃣ Parse response safely
    const oracleData = response.data || {};
    const followups = oracleData.items || [];

    // 5️⃣ Return clean structured response with pagination
    return successResponse(res, 200, "Follow-ups fetched successfully", {
      followups: followups,
      pagination: {
        limit: oracleData.limit,
        offset: oracleData.offset,
        hasMore: oracleData.hasMore,
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
