const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function getStatus(req, res) {
  try {
    // 1️⃣ Get Access Token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return errorResponse(res, 401, "Failed to retrieve access token");
    }

    // 2️⃣ Call Oracle API to get CRM status transitions
    const response = await axios.get(`${API_BASE_URL}/getCRMStatusTransition`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // 3️⃣ Check if response has data
    if (!response.data || !response.data.items) {
      return errorResponse(res, 404, "No status data found");
    }

    // 4️⃣ Extract statuses from response and filter for Opportunity type only
    const allStatuses = response.data.items;
    const opportunityStatuses = allStatuses.filter(
      (status) => status.status_type === "Opportunity"
    );

    // 5️⃣ Return structured response
    return successResponse(
      res,
      200,
      "Opportunity status transitions retrieved successfully",
      opportunityStatuses
    );
  } catch (error) {
    console.error("❌ Error fetching CRM status transitions:", error.message);

    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("❌ Oracle API error response:", error.response.data);
      return errorResponse(
        res,
        error.response.status,
        error.response.data?.message || "Oracle API error"
      );
    } else if (error.request) {
      // The request was made but no response was received
      console.error("❌ No response received from Oracle API");
      return errorResponse(
        res,
        503,
        "Service unavailable - Oracle API not responding"
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("❌ Request setup error:", error.message);
      return errorResponse(res, 500, "Internal Server Error");
    }
  }
}

module.exports = getStatus;
