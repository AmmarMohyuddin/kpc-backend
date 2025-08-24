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

async function createLead(req, res) {
  let accessToken;
  try {
    console.log("🚀 Starting createLead API...");
    console.log("📩 Incoming body:", req.body);

    // Extract data from request body
    const {
      customer_name,
      customer_type,
      city,
      address,
      contact_number,
      customer_email,
      contact_position,
      source,
      status,
      salesperson_id,
      salesperson_name,
    } = req.body;

    console.log("🔑 Getting access token...");
    accessToken = await getAccessToken();
    console.log("✅ Access token received:", accessToken ? "YES" : "NO");
    if (!accessToken) throw new Error("Failed to retrieve access token");

    const currentDate = formatIsoDate();

    const salesPersonObj = await salesPerson.findById(salesperson_id).select({
      salesperson_id: 1,
      _id: 0,
    });
    console.log("👤 Mapped salesperson ID:", salesPersonObj);

    // Prepare lead payload
    const leadPayload = {
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
      status_id: 1,
      status: status || "New",
      salesperson_name: salesperson_name || "",
      created_by: salesperson_name || "",
      salesperson_id: salesPersonObj.salesperson_id || "",
      last_updated_by: salesperson_name || "",
      creation_date: currentDate,
      last_update_date: currentDate,
    };

    console.log("📤 Sending createLead API with payload:", leadPayload);

    // Make API call to create lead
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
    console.log("✅ Lead created successfully:", response.data);

    // Check if the API call was successful
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

    // Provide more specific error messages
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
