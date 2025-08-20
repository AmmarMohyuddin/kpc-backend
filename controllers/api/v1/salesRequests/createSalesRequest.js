const SalesRequest = require("../../../../models/salesRequest");
const Item = require("../../../../models/item");
const Customer = require("../../../../models/customer");
const OrderLine = require("../../../../models/orderLine");
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

// Format date `YYYY-MM-DDTHH:mm:ssZ`

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

async function createSalesRequest(req, res) {
  let accessToken;
  try {
    console.log("🚀 Starting createSalesRequest API...");
    console.log("📩 Incoming body:", req.body);

    const { customer_id, status } = req.body;
    if (!customer_id) {
      console.log("❌ Customer ID missing");
      return errorResponse(res, 400, "Customer ID is required");
    }

    console.log("🔑 Getting access token...");
    accessToken = await getAccessToken();
    console.log("✅ Access token received:", accessToken ? "YES" : "NO");
    if (!accessToken) throw new Error("Failed to retrieve access token");

    console.log("📡 Fetching orderDetail and headerIdResponse...");
    const [orderDetail, headerIdResponse] = await Promise.all([
      SalesRequest.findOne({ customer_id }).lean(),
      axios.get(`${API_BASE_URL}/getHeaderID`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    console.log("📄 orderDetail:", orderDetail);
    console.log("📄 headerIdResponse:", headerIdResponse?.data);

    if (!orderDetail) {
      return errorResponse(res, 404, "Order not found for this customer");
    }

    console.log("🔍 Fetching customerDetail...");
    const customerDetail = await Customer.findOne({
      account_number: orderDetail.account_number,
    }).lean();
    console.log("📄 customerDetail:", customerDetail);

    if (!customerDetail) {
      return errorResponse(res, 404, "Customer details not found");
    }

    const order_header_id = headerIdResponse?.data?.order_header_id;
    console.log("🆔 order_header_id:", order_header_id);

    if (!order_header_id) {
      return errorResponse(res, 500, "Invalid header ID from API");
    }

    const currentDate = formatIsoDate();
    const createdBy = orderDetail.salesperson_name || "system";

    // 1️⃣ First create all order lines
    const items = orderDetail.items || [];
    console.log("📦 Items to process:", items);

    let orderLineErrors = [];

    for (const item of items) {
      console.log("👉 Processing item:", item.item_number);

      try {
        console.log("🔍 Fetching itemDetail & generating orderLineId...");
        const [itemDetail, orderLineId] = await Promise.all([
          Item.findOne({ item_number: item.item_number }).lean(),
          generateOrderLineId(),
        ]);
        console.log("📄 itemDetail:", itemDetail);
        console.log("🆔 orderLineId:", orderLineId);

        const itemPayload = {
          order_line_id: orderLineId,
          order_header_id,
          inventory_item_id: itemDetail?.inventory_item_id || "",
          item_number: item.item_number,
          description: item.description,
          uom: item.unit_of_measure,
          order_quantity: item.order_quantity,
          price: item.price,
          amount: item.line_amount,
          line_status: "ACTIVE",
          instructions: item.instructions || "",
          creation_date: formatIsoDate(),
          created_by: createdBy,
          last_update_date: formatIsoDate(),
          last_updated_by: createdBy,
          payment_term: orderDetail.payment_term,
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
        orderLineErrors.push(item.item_number);
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

    // 2️⃣ After all items created → create header once
    console.log("📝 Preparing salesRequestPayload...");
    const salesRequestPayload = {
      order_header_id,
      order_number: `KPCW-${order_header_id}`,
      order_date: currentDate,
      order_currency: CURRENCY,
      business_unit: BUSINESS_UNIT,
      customer_name: orderDetail.customer_name,
      customer_number: customerDetail.party_id,
      customer_account_number: orderDetail.account_number,
      address_line_1: orderDetail.address,
      approval_status: "Pending",
      order_status: status,
      salesperson: orderDetail.salesperson_name,
      payment_term: orderDetail.payment_term,
      creation_date: currentDate,
      created_by: createdBy,
      last_update_date: currentDate,
      last_updated_by: createdBy,
      total_amount: orderDetail.total_amount || 0,
      interfaced: "N",
      fusion_flag: "N",
      customer_po_number: orderDetail.customer_po_number || "",
      site_id: customerDetail.party_site_id || "",
      site_use_id: customerDetail.site_use_id || "",
      fusion_sales_order_num: "",
      customer_city: orderDetail.confirm_address?.city || "",
      customer_address: orderDetail.confirm_address?.shippingAddress || "",
      customer_block: orderDetail.confirm_address?.block || "",
      contact_person: orderDetail.confirm_address?.name || "",
      contact_number: orderDetail.confirm_address?.contactNumber || "",
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

    return successResponse(res, 201, "Sales request created successfully");
  } catch (error) {
    console.error(
      "❌ Error creating sales request:",
      error.response?.data || error.message
    );
    return errorResponse(res, 500, error.message);
  }
}

module.exports = createSalesRequest;
