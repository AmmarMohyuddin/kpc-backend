const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function detailNotification(req, res) {
  try {
    // 1. Extract NID from request
    const { NID } = req.body || req.query;
    if (!NID) {
      return errorResponse(res, "NID is required", 400);
    }

    // 2. Get Access Token
    const accessToken = await getAccessToken();

    // 3. Call Oracle API (Notification detail endpoint)
    const response = await axios.get(
      `${API_BASE_URL}/getNotificationDetail?NID=${NID}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // 4. Parse response
    const oracleData = response.data;
    const details = oracleData.items || [];

    // 5. Return clean structured response
    return successResponse(
      res,
      200,
      "Notification detail fetched successfully",
      details
    );
  } catch (error) {
    console.error("❌ Error fetching notification detail:", error.message);

    if (error.response) {
      return errorResponse(
        res,
        error.response.data?.message || "Oracle API error",
        error.response.status
      );
    }

    return errorResponse(res, "Internal Server Error", 500);
  }
}

module.exports = detailNotification;
