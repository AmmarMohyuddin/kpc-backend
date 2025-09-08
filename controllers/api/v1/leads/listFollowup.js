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
    const { limit, offset, FOLLOWUP_ID, LEAD_ID } =
      req.query.params || req.query;

    const params = {};

    // Apply filter if provided
    if (FOLLOWUP_ID) {
      params.FOLLOWUP_ID = FOLLOWUP_ID;
    } else if (LEAD_ID) {
      params.LEAD_ID = LEAD_ID;
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

    // 2️⃣ Call Oracle API
    const response = await axios.get(`${API_BASE_URL}/getFollowup`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });

    // 3️⃣ Parse response
    const oracleData = response.data;
    let followups = oracleData.items || [];

    // 4️⃣ Filter only items with source "Lead"
    followups = followups.filter((fu) => fu.source === "Lead");

    // 5️⃣ Return response
    return successResponse(res, 200, "Follow-ups fetched successfully", {
      followups,
      pagination:
        FOLLOWUP_ID || LEAD_ID
          ? null // ❌ disable pagination if filter is applied
          : {
              limit: oracleData.limit,
              offset: oracleData.offset,
              hasMore: oracleData.hasMore,
            },
    });
  } catch (error) {
    console.error("❌ Error fetching follow-ups:", error.message);

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

module.exports = listFollow;
