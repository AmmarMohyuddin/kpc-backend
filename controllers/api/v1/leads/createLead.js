const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");
const salesPerson = require("../../../../models/salesperson");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

// Format date as YYYY-MM-DD
function formatIsoDate(date = new Date()) {
  const pad = (n) => (n < 10 ? "0" + n : n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

// 🔹 Generate new lead number
async function generateLeadNumber() {
  try {
    console.log("🔍 Requesting new LeadNumber...");

    const response = await axios.post(
      "http://130.61.114.96/api/v1/leads/create"
    );

    console.log("✅ LeadNumber response:", response.data);

    if (response.data?.data?.leadId) {
      return response.data.data.leadId; // ✅ use leadId
    } else {
      throw new Error("Invalid response when generating LeadNumber");
    }
  } catch (error) {
    console.error(
      "❌ Failed to generate LeadNumber:",
      error.response?.data || error.message
    );
    throw error;
  }
}

// 🔹 Fetch status_id & stage from CRM
async function getStatusDetails(statusName, accessToken) {
  try {
    const res = await axios.get(`${API_BASE_URL}/getCRMStatusLookup`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const statuses = res.data?.items || [];
    console.log("🔎 Status Lookup:", statuses);

    const statusObj = statuses.find(
      (s) => s.status?.toLowerCase() === statusName?.toLowerCase()
    );

    if (!statusObj) {
      console.warn(`⚠️ No status found for: ${statusName}`);
      return { status_id: null, stage: null };
    }

    return {
      status_id: statusObj.status_id,
      stage: statusObj.stage || null,
    };
  } catch (err) {
    console.error("❌ Error fetching status lookup:", err.message);
    return { status_id: null, stage: null };
  }
}

// 🔹 Create Lead Controller
async function createLead(req, res) {
  let accessToken;
  try {
    console.log("🚀 Starting createLead API...");
    console.log("📩 Incoming body:", req.body);

    const {
      customer_name,
      customer_type,
      city,
      address,
      contact_number,
      customer_email,
      contact_position,
      source,
      status = "New", // default
      salesperson_id,
      salesperson_name,
    } = req.body;

    // 🔑 Get access token
    console.log("🔑 Getting access token...");
    accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Failed to retrieve access token");

    const currentDate = formatIsoDate();

    // 🔹 Generate Lead Number
    const leadId = await generateLeadNumber();
    const LEAD_NUMBER = `LW-${leadId}`;
    console.log("🆔 Generated Lead Number:", LEAD_NUMBER);

    // 🔹 Map salesperson_id from DB
    const salesPersonObj = await salesPerson.findById(salesperson_id).select({
      salesperson_id: 1,
      _id: 0,
    });
    console.log("👤 Mapped salesperson ID:", salesPersonObj);

    // 🔹 Get Status ID & Stage from CRM
    const { status_id, stage } = await getStatusDetails(status, accessToken);

    // 🔹 Prepare lead payload
    const leadPayload = {
      lead_number: LEAD_NUMBER, // ✅ auto-generated
      lead_type: customer_type,
      customer_name,
      customer_type,
      country: "Kuwait",
      city: city || "",
      contact_address: address || "",
      contact_number,
      email_address: customer_email,
      contact_position: contact_position || "",
      source: source || "",
      status_id: status_id || 1, // fallback to 1 if not found
      status,
      stage: stage || "Initiation", // fallback if missing
      salesperson_name: salesperson_name || "",
      created_by: salesperson_name || "",
      salesperson_id: salesPersonObj?.salesperson_id || "",
      last_updated_by: salesperson_name || "",
      creation_date: currentDate,
      last_update_date: currentDate,
    };

    console.log("📤 Sending createLead API with payload:", leadPayload);

    // 🔹 Call external API
    const response = await axios.post(
      `${API_BASE_URL}/createLead`,
      leadPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📥 API response:", response.status, response.statusText);

    if (response && response.status === 200) {
      return successResponse(
        res,
        201,
        "Lead created successfully",
        response.data
      );
    } else {
      return errorResponse(
        res,
        500,
        "Failed to create lead in external system"
      );
    }
  } catch (error) {
    console.error(
      "❌ Error creating lead:",
      error.response?.data || error.message
    );

    if (error.response) {
      return errorResponse(
        res,
        error.response.status,
        error.response.data?.message || "External API error"
      );
    } else if (error.code === "ECONNREFUSED") {
      return errorResponse(res, 503, "External service unavailable");
    } else {
      return errorResponse(res, 500, error.message);
    }
  }
}

module.exports = createLead;
