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

async function updateLead(req, res) {
  let accessToken;
  try {
    console.log("🚀 Starting updateLead API...");
    console.log("📩 Incoming body:", req.body);

    // Extract data from request body
    const {
      lead_id, // Added lead_id for updating
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

    // Validate required fields
    if (!lead_id) {
      return errorResponse(res, 400, "Lead ID is required for update");
    }

    console.log("🔑 Getting access token...");
    accessToken = await getAccessToken();
    console.log("✅ Access token received:", accessToken ? "YES" : "NO");
    if (!accessToken) throw new Error("Failed to retrieve access token");

    const currentDate = formatIsoDate();

    let oracleSalespersonId = "";
    if (salesperson_id) {
      try {
        const salesPersonObj = await salesPerson
          .findById(salesperson_id)
          .select({
            salesperson_id: 1,
            _id: 0,
          });
        console.log("👤 Mapped salesperson ID:", salesPersonObj);
        oracleSalespersonId = salesPersonObj?.salesperson_id || "";
      } catch (error) {
        console.error("❌ Error fetching salesperson:", error);
        // Continue without salesperson ID if there's an error
      }
    }
    // Prepare lead payload with consistent uppercase field names
    const leadPayload = {
      LEAD_ID: lead_id,
      LEAD_TYPE: customer_type, // Changed to uppercase to match database
      CUSTOMER_NAME: customer_name,
      CUSTOMER_TYPE: customer_type,
      COUNTRY: "Kuwait",
      CITY: city || "",
      CONTACT_ADDRESS: address || "",
      CONTACT_NUMBER: contact_number,
      EMAIL_ADDRESS: customer_email,
      CONTACT_POSITION: contact_position || "",
      SOURCE: source || "",
      STATUS_ID: 1,
      STATUS: status,
      CREATED_BY: salesperson_name,
      LAST_UPDATED_BY: salesperson_name,
      CREATION_DATE: currentDate,
      LAST_UPDATE_DATE: currentDate,
    };
    console.log("📤 Sending updateLead API with payload:", leadPayload);

    // Make API call to UPDATE lead (using PUT method if available, otherwise POST)
    const response = await axios.post(
      // Changed to PUT for update operation
      `${API_BASE_URL}/updateLead`,
      leadPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📥 API response:", response.status, response.statusText);
    console.log("✅ Lead updated successfully:", response.data);

    // Check if the API call was successful
    if (response && (response.status === 200 || response.status === 201)) {
      return successResponse(
        res,
        200, // Changed to 200 for successful update
        "Lead updated successfully",
        response.data
      );
    } else {
      return errorResponse(
        res,
        500,
        "Failed to update lead in external system"
      );
    }
  } catch (error) {
    console.error(
      "❌ Error updating lead:",
      error.response?.data || error.message
    );

    // Provide more specific error messages
    if (error.response) {
      console.error("📋 Error details:", error.response.data);
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

module.exports = updateLead;
