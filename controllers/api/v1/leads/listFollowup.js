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

    // 1️⃣ Get Access Token
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Failed to retrieve access token");

    // 2️⃣ Call Oracle API
    const response = await axios.get(`${API_BASE_URL}/getFollowup`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("✅ Oracle API Response:", response.data);

    // 3️⃣ Parse response safely
    const oracleData = response.data || {};
    const followups = oracleData.items || [];

    // 4️⃣ Return clean structured response
    return successResponse(
      res,
      200,
      "Follow-ups fetched successfully",
      followups
    );
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
