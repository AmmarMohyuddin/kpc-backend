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

async function createOpportunity(req, res) {
  let accessToken;
  try {
    console.log("🚀 Starting createOpportunity API...");
    console.log("📩 Incoming body:", req.body);

    const opportunityData = req.body;

    // 🔑 Get token
    accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Failed to retrieve access token");

    // ✅ Accept both OPPORTUNITY_ID or opportunity_id
    let opportunityHeaderId =
      opportunityData.OPPORTUNITY_ID || opportunityData.opportunity_id || null;

    let headerRes = null;

    const salesPersonObj = await salesPerson.findOne({
      salesperson_name: opportunityData.salesperson_name,
    });

    // 1️⃣ If NO opportunity_id → Create header
    if (!opportunityHeaderId) {
      const headerPayload = {
        lead_id: opportunityData.lead_id,
        generation_date: opportunityData.generation_date,
        close_date: opportunityData.close_date,
        stage: "Initiation",
        status_id: 101,
        salesperson: salesPersonObj.salesperson_name,
        salesperson_id: salesPersonObj.salesperson_id,
        remarks: opportunityData.remarks,
        created_by: salesPersonObj.salesperson_name,
        last_updated_by: salesPersonObj.salesperson_name,
        creation_date: opportunityData.generation_date,
        last_update_date: opportunityData.generation_date,
      };

      console.log("📤 Sending Header payload:", headerPayload);
      headerRes = await axios.post(
        `${API_BASE_URL}/createOpportunityHeader`,
        headerPayload,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      opportunityHeaderId = headerRes.data?.opportunity_id;
      console.log("✅ Header created with ID:", opportunityHeaderId);
    } else {
      console.log("⚡ Using existing header:", opportunityHeaderId);
    }

    // 2️⃣ Always create detail
    const itemDetail = await Item.findOne({
      item_number: opportunityData.item_number,
    });

    if (!itemDetail) {
      return errorResponse(res, 404, "Item not found in local DB");
    }

    const detailPayload = {
      opportunity_id: opportunityHeaderId,
      item_id: itemDetail.inventory_item_id,
      item_number: opportunityData.item_number,
      item_detail: opportunityData.item_detail,
      sub_category: opportunityData.sub_category,
      description: opportunityData.description,
      uom: opportunityData.unit_of_measure,
      quantity: opportunityData.order_quantity,
      price: opportunityData.price,
      amount: opportunityData.line_amount,
      instructions: opportunityData.instructions,
      requested_ship_date: opportunityData.requested_ship_date,
      created_by: opportunityData.salesperson_name,
      last_updated_by: opportunityData.salesperson_name,
      creation_date: opportunityData.generation_date,
      last_update_date: opportunityData.generation_date,
    };

    console.log("📤 Sending Detail payload:", detailPayload);
    const detailRes = await axios.post(
      `${API_BASE_URL}/createOpportunityDetail`,
      detailPayload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    console.log("✅ Detail created:", detailRes.data);

    return successResponse(res, 201, {
      message:
        opportunityHeaderId && !headerRes
          ? "Opportunity detail added successfully"
          : "Opportunity created successfully",
      header: headerRes ? headerRes.data : null,
      detail: detailRes.data,
    });
  } catch (error) {
    console.error(
      "❌ Error creating opportunity:",
      error.response?.data || error.message
    );
    return errorResponse(
      res,
      error.response?.status || 500,
      error.response?.data?.message || error.message
    );
  }
}

module.exports = createOpportunity;
