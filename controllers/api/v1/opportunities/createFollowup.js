const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function createFollowup(req, res) {
  let accessToken;
  try {
    console.log("🚀 Starting createFollowup API...");
    console.log("📩 Incoming body:", req.body);

    const followupData = req.body;

    // 🔑 Get token
    accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Failed to retrieve access token");

    // ✅ Build payload in required format
    const payload = {
      SOURCE: followupData.reference_type || "Opportunity",
      OPPORTUNITY_ID: followupData.reference_id,
      FOLLOWUP_DATE: followupData.followup_date,
      NEXT_FOLLOWUP_DATE: followupData.next_followup_date,
      STATUS: "Scheduled",
      COMMENTS: followupData.notes,
      ASSIGNED_TO: followupData.salesperson_name,
      CREATED_BY: followupData.salesperson_name,
      LAST_UPDATED_BY: followupData.salesperson_name,
    };

    console.log("📤 Sending Follow-up payload:", payload);

    const response = await axios.post(
      `${API_BASE_URL}/createFollowup`,
      payload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    console.log("✅ Follow-up created:", response.data);

    return successResponse(res, 201, {
      message: "Follow-up created successfully",
      data: response.data,
    });
  } catch (error) {
    console.error(
      "❌ Error creating follow-up:",
      error.response?.data || error.message
    );
    return errorResponse(
      res,
      error.response?.status || 500,
      error.response?.data?.message || error.message
    );
  }
}

module.exports = createFollowup;
