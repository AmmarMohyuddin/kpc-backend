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
    const { limit, offset, CUSTOMER_NAME, LEAD_NUMBER, DATE } =
      req.query.params || req.query;

    const params = {};

    if (CUSTOMER_NAME) {
      params.CUSTOMER_NAME = CUSTOMER_NAME;
    } else if (LEAD_NUMBER) {
      params.LEAD_NUMBER = LEAD_NUMBER;
    } else if (DATE) {
      params.DATE = DATE;
    } else {
      // Only apply pagination if no filter is present
      params.limit = parseInt(limit);
      params.offset = parseInt(offset);
    }

    console.log("Params Sent to Oracle API:", params);

    // 1️⃣ Get Access Token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return errorResponse(res, 401, "Failed to retrieve access token");
    }

    // 2️⃣ Call Oracle API with filters or pagination
    const response = await axios.get(`${API_BASE_URL}/getLeads`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });

    // 3️⃣ Parse Oracle response
    const oracleData = response.data;
    const leads = oracleData.items || [];

    // 4️⃣ Return clean structured response
    return successResponse(res, 200, "Leads fetched successfully", {
      leads,
      pagination:
        CUSTOMER_NAME || LEAD_NUMBER
          ? null // ❌ no pagination when filter is applied
          : {
              limit: oracleData.limit,
              offset: oracleData.offset,
              hasMore: oracleData.hasMore,
            },
    });
  } catch (error) {
    console.error("❌ Error fetching leads:", error.message);

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

module.exports = listLead;
