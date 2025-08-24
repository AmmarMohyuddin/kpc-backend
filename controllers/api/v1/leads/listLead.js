const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function listLead(req, res) {
  try {
    // 1. Get Access Token
    const accessToken = await getAccessToken();

    // 2. Call Oracle API
    const response = await axios.get(`${API_BASE_URL}/getLeads`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // 3. Parse response
    const oracleData = response.data;

    const leads = oracleData.items;

    // 4. Return clean structured response
    return successResponse(res, 200, "Leads fetched successfully", leads);
  } catch (error) {
    console.error("❌ Error fetching leads:", error.message);

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

module.exports = listLead;
