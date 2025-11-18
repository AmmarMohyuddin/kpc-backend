const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp/getActualVSTargetSales";

async function list(req, res) {
  try {
    // Get Access Token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return errorResponse(res, 401, "Failed to retrieve access token");
    }

    // Call Oracle API
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Parse Oracle response
    const oracleData = response.data;
    const items = oracleData.items || [];

    // Return structured response
    return successResponse(res, 200, "Actual vs Target sales fetched successfully", {
      items,
    });
  } catch (error) {
    console.error("Error fetching actual vs target sales:", error.message);

    if (error.response) {
      return errorResponse(
        res,
        error.response.status,
        error.response.data?.message || "Oracle API error"
      );
    }

    return errorResponse(res, 500, "Internal Server Error");
  }
}

module.exports = list;

