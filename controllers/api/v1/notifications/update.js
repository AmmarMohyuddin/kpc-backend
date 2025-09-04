const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function updateNotification(req, res) {
  try {
    // 1. Get Access Token
    const accessToken = await getAccessToken();

    // 2. Extract NID from request body
    const { NID } = req.body;
    console.log(req.body);
    if (!NID) {
      return errorResponse(res, "NID is required", 400);
    }

    // 3. Call Oracle API (POST)
    const response = await axios.post(
      `${API_BASE_URL}/updateNotificationHeader`,
      { NID }, // Only NID in body
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 4. Return response
    return successResponse(
      res,
      200,
      "Notification updated successfully",
      response.data
    );
  } catch (error) {
    console.error("❌ Error updating notification:", error.message);

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

module.exports = updateNotification;
