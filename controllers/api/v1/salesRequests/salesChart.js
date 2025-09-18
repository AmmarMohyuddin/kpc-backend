const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function salesChart(req, res) {
  try {
    // 1. Get Access Token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return errorResponse(res, 401, "Failed to retrieve access token");
    }

    // 2. Call Oracle API
    const response = await axios.get(`${API_BASE_URL}/activityStatsV2`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // 3. Parse response
    const oracleData = response.data;

    // 4. Extract stats safely
    const leads = oracleData.leads ?? 0;
    const opportunities = oracleData.opportunity ?? 0;
    const salesRequests = oracleData.sales_request ?? 0;

    // 5. Return response
    return successResponse(res, 200, "Sales chart data fetched successfully", {
      leads,
      opportunities,
      salesRequests,
    });
  } catch (error) {
    console.error("❌ Error fetching sales chart data:", error.message);

    if (error.response) {
      return errorResponse(
        res,
        error.response.data?.message || "Oracle API error",
        error.response.status
      );
    }

    return errorResponse(res, 500, "Internal Server Error");
  }
}

module.exports = salesChart;
