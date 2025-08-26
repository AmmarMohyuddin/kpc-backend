const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function deleteOpportunity(req, res) {
  try {
    const { type, id } = req.body;
    console.log("🚀 Incoming delete request:", req.body);

    if (!id || !type) {
      return errorResponse(res, 400, "Type and ID are required");
    }

    // 1️⃣ Get Access Token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return errorResponse(res, 401, "Failed to retrieve access token");
    }

    // 2️⃣ Build API endpoint + payload
    let endpoint = "";
    let payload = {};

    if (type === "header") {
      endpoint = `${API_BASE_URL}/deleteOpportunityHeader`;
      payload = { OPPORTUNITY_ID: Number(id) };
    } else if (type === "detail") {
      console.log("===================================");
      endpoint = `${API_BASE_URL}/deleteOpportunityDetail`;
      payload = { OPPORTUNITY_DETAIL_ID: Number(id) };
    } else {
      return errorResponse(res, 400, "Invalid type. Use 'header' or 'detail'.");
    }

    // 3️⃣ Call Oracle API
    const response = await axios.post(endpoint, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // 4️⃣ Handle Oracle response
    return successResponse(res, 200, `${type} deleted`, response.data);
  } catch (error) {
    console.error("❌ Error deleting opportunity:", error.message);

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

module.exports = deleteOpportunity;
