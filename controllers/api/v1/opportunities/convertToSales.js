const Item = require("../../../../models/item");
const Customer = require("../../../../models/customer");
const salesPerson = require("../../../../models/salesperson");
const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";
const BUSINESS_UNIT = "KPC KWT BU";
const CURRENCY = "KWD";

// Format date `YYYY-MM-DD`
function formatIsoDate(date = new Date()) {
  const pad = (n) => (n < 10 ? "0" + n : n);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

// Generate new order line id
async function generateOrderLineId() {
  try {
    console.log("🔍 Requesting new OrderLineId...");

    const response = await axios.post(
      "http://130.61.114.96/api/v1/orderLine/create"
    );

    console.log("✅ OrderLineId response:", response.data);

    if (response.data?.data?.orderLineId) {
      return response.data.data.orderLineId;
    } else {
      throw new Error("Invalid response when generating OrderLineId");
    }
  } catch (error) {
    console.error(
      "❌ Failed to generate OrderLineId:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function convertFromOpportunity(req, res) {
  let accessToken;
  try {
    console.log("🚀 Starting convertFromOpportunity API...");
    console.log("📩 Incoming body:", req.body);

    const {
      lead_id,
      opportunity_id,
      opportunity_details,
      customer_details,
      address_details,
      order_status,
    } = req.body;

    if (!opportunity_id || !customer_details || !address_details) {
      console.log("❌ Missing required fields");
      return errorResponse(
        res,
        400,
        "Opportunity ID, customer details, and address details are required"
      );
    }

    console.log("🔑 Getting access token...");
    accessToken = await getAccessToken();
    console.log("✅ Access token received:", accessToken ? "YES" : "NO");
    if (!accessToken) throw new Error("Failed to retrieve access token");

    console.log("📡 Fetching headerIdResponse...");
    const headerIdResponse = await axios.get(`${API_BASE_URL}/getHeaderID`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log("📄 headerIdResponse:", headerIdResponse?.data);

    const order_header_id = headerIdResponse?.data?.order_header_id;
    console.log("🆔 order_header_id:", order_header_id);

    if (!order_header_id) {
      return errorResponse(res, 500, "Invalid header ID from API");
    }

    console.log("🔍 Fetching customerDetail...");
    const customerDetail = await Customer.findOne({
      account_number: customer_details.account_number,
    }).lean();
    console.log("📄 customerDetail:", customerDetail);

    if (!customerDetail) {
      return errorResponse(res, 404, "Customer details not found");
    }

    const currentDate = formatIsoDate();
    const createdBy = customer_details.salesperson_name || "system";

    // 1️⃣ First create all order lines from opportunity details
    const items = opportunity_details || [];
    console.log("📦 Items to process:", items);

    let orderLineErrors = [];

    for (const item of items) {
      console.log("👉 Processing item:", item.ITEM_ID);

      try {
        console.log("🔍 Fetching itemDetail & generating orderLineId...");
        const [itemDetail, orderLineId] = await Promise.all([
          Item.findOne({ inventory_item_id: item.ITEM_ID }).lean(),
          generateOrderLineId(),
        ]);
        console.log("📄 itemDetail:", itemDetail);
        console.log("🆔 orderLineId:", orderLineId);

        const itemPayload = {
          order_line_id: orderLineId,
          order_header_id,
          inventory_item_id: itemDetail?.inventory_item_id || "",
          item_number: item.ITEM_NUMBER,
          description: item.DESCRIPTION,
          uom: item.UOM,
          order_quantity: item.QUANTITY,
          price: item.PRICE,
          amount: item.AMOUNT,
          line_status: "ACTIVE",
          instructions: item.INSTRUCTIONS || "",
          creation_date: formatIsoDate(),
          created_by: item.CREATED_BY,
          last_update_date: formatIsoDate(),
          last_updated_by: item.CREATED_BY,
          payment_term: customer_details.payment_term,
          requested_ship_date: item.requested_ship_date
            ? formatIsoDate(new Date(item.requested_ship_date))
            : formatIsoDate(),
        };

        console.log(
          "📤 Sending createOrderLine API with payload:",
          itemPayload
        );

        const lineRes = await axios.post(
          `${API_BASE_URL}/createOrderLine`,
          itemPayload,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        console.log("📥 Raw response:", lineRes.status, lineRes.statusText);
        console.log("✅ OrderLine created successfully:", lineRes.data);
      } catch (err) {
        console.error(
          "❌ Failed to create OrderLine:",
          err.response?.data || err.message
        );
        orderLineErrors.push(item.ITEM_NUMBER);
      }
    }

    if (orderLineErrors.length > 0) {
      console.log("❌ OrderLine creation failed for:", orderLineErrors);
      return errorResponse(
        res,
        500,
        `Failed to create lines for items: ${orderLineErrors.join(", ")}`
      );
    }

    const salesPersonObj = await salesPerson.findOne({
      salesperson_name: customer_details.salesperson_name,
    });

    // 2️⃣ After all items created → create header once
    console.log("📝 Preparing salesRequestPayload...");
    const salesRequestPayload = {
      order_header_id,
      order_number: `KPCW-${order_header_id}`,
      order_date: currentDate,
      order_currency: CURRENCY,
      business_unit: BUSINESS_UNIT,
      customer_name: customer_details.customer_name,
      customer_number: customerDetail.party_id,
      customer_account_number: customer_details.account_number,
      address_line_1: customer_details.address,
      approval_status: "Pending",
      order_status: order_status,
      salesperson: salesPersonObj.salesperson_id,
      payment_term: customer_details.payment_term,
      creation_date: currentDate,
      created_by: createdBy,
      last_update_date: currentDate,
      last_updated_by: createdBy,
      total_amount: opportunity_details.total_amount || 0,
      interfaced: "N",
      fusion_flag: "N",
      customer_po_number: customer_details.customer_po_number || "",
      site_id: customerDetail.party_site_id || "",
      site_use_id: customerDetail.site_use_id || "",
      fusion_sales_order_num: "",
      customer_city: address_details.city || "",
      customer_address: address_details.shippingAddress || "",
      customer_block: address_details.block || "",
      contact_person: address_details.name || "",
      contact_number: address_details.contactNumber || "",
      opportunity_id: opportunity_id,
    };

    console.log(
      "📤 Sending createHeader API with payload:",
      salesRequestPayload
    );

    const headerRes = await axios.post(
      `${API_BASE_URL}/createHeader`,
      salesRequestPayload,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    console.log("📥 Header response:", headerRes.status, headerRes.statusText);
    console.log("✅ Header created successfully:", headerRes.data);

    // 3️⃣ Update opportunity/lead status to "Closure"
    console.log("🔄 Updating status to Closure...");
    try {
      let updatePayload;
      let updateEndpoint;

      if (lead_id) {
        // If lead_id is present, update the lead
        updatePayload = {
          LEAD_ID: lead_id,
          STAGE: "Closure",
          STATUS: "Converted to Opportunity",
        };
        updateEndpoint = `${API_BASE_URL}/updateLead`;
      } else {
        // If no lead_id, update the opportunity
        updatePayload = {
          OPPORTUNITY_ID: opportunity_id,
          STAGE: "Closure",
          STATUS_ID: 108,
        };
        updateEndpoint = `${API_BASE_URL}/updateOpportunityHeader`;
      }

      console.log(
        `📤 Sending update API to ${updateEndpoint} with payload:`,
        updatePayload
      );

      const updateResponse = await axios.post(updateEndpoint, updatePayload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log(
        "📥 Update response:",
        updateResponse.status,
        updateResponse.statusText
      );
      console.log("✅ Status updated successfully:", updateResponse.data);
    } catch (updateError) {
      console.error(
        "⚠️ Failed to update status:",
        updateError.response?.data || updateError.message
      );
      // Continue even if status update fails - the sales request was created successfully
    }

    return successResponse(
      res,
      201,
      "Sales request created successfully and status updated",
      {
        order_header_id,
        order_number: `KPCW-${order_header_id}`,
        opportunity_id,
      }
    );
  } catch (error) {
    console.error(
      "❌ Error creating sales request from opportunity:",
      error.response?.data || error.message
    );
    return errorResponse(res, 500, error.message);
  }
}

module.exports = convertFromOpportunity;
