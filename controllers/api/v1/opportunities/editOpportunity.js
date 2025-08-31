const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");
const Item = require("../../../../models/item");
const salesPerson = require("../../../../models/salesperson");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

function formatIsoDate(date = new Date()) {
  const pad = (n) => (n < 10 ? "0" + n : n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

// Helper function to get status ID from status name
async function getStatusId(statusName, accessToken) {
  try {
    const res = await axios.get(`${API_BASE_URL}/getCRMStatusLookup`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const statuses = res.data?.items || [];
    const statusObj = statuses.find(
      (s) => s.status?.toLowerCase() === statusName?.toLowerCase()
    );
    console.log("Status Lookup:", statuses);
    console.log("Status Name:", statusObj);
    return statusObj ? statusObj.status_id : null;
  } catch (err) {
    console.error("❌ Error fetching status lookup:", err.message);
    return null;
  }
}

async function editOpportunity(req, res) {
  try {
    console.log("🚀 Starting editOpportunity API...");
    const opportunityData = req.body;
    console.log("Opportunity Data:", opportunityData);
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Failed to retrieve access token");

    const opportunityHeaderId =
      opportunityData.id || opportunityData.opportunity_id;

    if (!opportunityHeaderId) {
      return errorResponse(res, 400, "Missing OPPORTUNITY_ID for update");
    }

    let headerRes = null;
    let detailRes = null;

    // 🔹 CASE 1: Update Detail if detail payload is passed
    if (opportunityData.opportunity_detail_id) {
      const itemDetail = await Item.findOne({
        item_number: opportunityData.item_number,
      });

      if (!itemDetail) {
        return errorResponse(res, 404, "Item not found in local DB");
      }
      const detailPayload = {
        OPPORTUNITY_ID: opportunityHeaderId,
        OPPORTUNITY_DETAIL_ID: opportunityData.opportunity_detail_id,
        ITEM_ID: itemDetail.inventory_item_id,
        DESCRIPTION: opportunityData.description,
        INSTRUCTIONS: opportunityData.instructions,
        UOM: opportunityData.unit_of_measure,
        QUANTITY: Number(opportunityData.order_quantity),
        PRICE: Number(opportunityData.price),
        AMOUNT: Number(opportunityData.line_amount),
        CREATED_BY: opportunityData.created_by || "system",
        LAST_UPDATED_BY:
          opportunityData.last_updated_by ||
          opportunityData.salesperson_name ||
          "system",
        CREATION_DATE: opportunityData.creation_date || formatIsoDate(),
        LAST_UPDATE_DATE: opportunityData.last_update_date || formatIsoDate(),
      };

      console.log("📤 Updating Detail payload:", detailPayload);
      detailRes = await axios.post(
        `${API_BASE_URL}/updateOpportunityDetail`,
        detailPayload,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      console.log("✅ Detail updated:", detailRes.data);
    }
    // 🔹 CASE 2: Update Header if header payload fields are passed
    else if (
      opportunityData.generation_date ||
      opportunityData.close_date ||
      opportunityData.status ||
      opportunityData.salesperson_id ||
      opportunityData.salesperson_name ||
      opportunityData.remarks ||
      opportunityData.stage
    ) {
      const salesPersonObj = await salesPerson.findOne({
        _id: opportunityData.salesperson_id,
      });
      console.log("Sales Person:", salesPersonObj);

      // Get status ID from status name
      let statusId = null;
      if (opportunityData.status) {
        statusId = await getStatusId(opportunityData.status, accessToken);
        if (!statusId) {
          console.warn(
            `⚠️ Status ID not found for status: ${opportunityData.status}`
          );
        }
      }

      const headerPayload = {
        OPPORTUNITY_ID: opportunityHeaderId,
        GENERATION_DATE: opportunityData.generation_date,
        STAGE: opportunityData.stage || "Initiation",
        CLOSE_DATE: opportunityData.close_date,
        STATUS_ID: statusId, // Use found status ID or default
        // STATUS: opportunityData.status,
        SALESPERSON_ID: salesPersonObj?.salesperson_id || "",
        REMARKS: opportunityData.remarks,
        CREATED_BY: opportunityData.salesperson_name || "system",
        LAST_UPDATED_BY: opportunityData.salesperson_name || "system",
      };

      console.log("📤 Updating Header payload:", headerPayload);
      headerRes = await axios.post(
        `${API_BASE_URL}/updateOpportunityHeader`,
        headerPayload,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      console.log("✅ Header updated:", headerRes.data);
    } else {
      return errorResponse(
        res,
        400,
        "No valid header or detail fields provided for update"
      );
    }

    return successResponse(res, 200, {
      message: "Opportunity updated successfully",
      header: headerRes ? headerRes.data : null,
      detail: detailRes ? detailRes.data : null,
    });
  } catch (error) {
    console.error(
      "❌ Error updating opportunity:",
      error.response?.data || error.message
    );
    return errorResponse(
      res,
      error.response?.status || 500,
      error.response?.data?.message || error.message
    );
  }
}

module.exports = editOpportunity;
