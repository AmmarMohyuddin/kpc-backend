const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function editSalesRequest(req, res) {
  try {
    console.log("🚀 Starting editSalesRequest API...");
    console.log("📩 Incoming body:", req.body);

    const {
      order_header_id, // 🔑 mandatory
      // header fields
      customer_name,
      account_number,
      address,
      payment_term,
      customer_po_number,
      salesperson_name,
      contact_person,
      customer_city,
      contact_number,
      customer_block,
      shipping_address,
      // line fields
      item_number,
      item_detail,
      description,
      instructions,
      order_quantity,
      price,
      line_amount,
      unit_of_measure,
    } = req.body;

    if (!order_header_id) {
      return errorResponse(res, 400, "ORDER_HEADER_ID is required");
    }

    // ✅ group fields for easier checks
    const headerFields = {
      customer_name,
      account_number,
      address,
      payment_term,
      customer_po_number,
      salesperson_name,
      contact_person,
      customer_city,
      contact_number,
      customer_block,
      shipping_address,
    };

    const lineFields = {
      item_number,
      item_detail,
      description,
      instructions,
      order_quantity,
      price,
      line_amount,
      unit_of_measure,
    };

    const hasHeaderUpdates = Object.values(headerFields).some(Boolean);
    const hasLineUpdates = Object.values(lineFields).some(Boolean);

    // 🔑 Get access token
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Failed to retrieve access token");
    console.log("✅ Access token retrieved successfully");

    // 📝 Step 1: Get Order Details
    const { data: oracleData } = await axios.get(
      `${API_BASE_URL}/getOrderDetails?ORDER_HEADER_ID=${order_header_id}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const order =
      oracleData.items[0] && JSON.parse(oracleData.items[0].order_json);
    if (!order) return errorResponse(res, 404, "Order not found");

    let headerRes = null;
    let lineRes = null;

    // ✅ Step 2: Update Header
    if (hasHeaderUpdates) {
      const updateHeaderPayload = {
        order_header_id: order.ORDER_HEADER_ID,
        order_number: order.ORDER_NUMBER,
        order_date: order.ORDER_DATE,
        order_currency: order.ORDER_CURRENCY,
        business_unit: order.BUSINESS_UNIT,
        customer_name: customer_name || order.CUSTOMER_NAME,
        customer_number: order.CUSTOMER_NUMBER,
        customer_account_number:
          account_number || order.CUSTOMER_ACCOUNT_NUMBER,
        address_line_1: address || order.ADDRESS_LINE_1,
        approval_status: order.APPROVAL_STATUS,
        order_status: order.ORDER_STATUS,
        salesperson: salesperson_name || order.SALESPERSON,
        payment_term: payment_term || order.PAYMENT_TERM,
        creation_date: order.CREATION_DATE,
        created_by: order.CREATED_BY,
        last_update_date: new Date().toISOString().split("T")[0],
        last_updated_by: "API_USER",
        total_amount: order.TOTAL_AMOUNT,
        interfaced: order.INTERFACED,
        fusion_flag: order.FUSION_FLAG,
        customer_po_number: customer_po_number || order.CUSTOMER_PO_NUMBER,
        site_id: order.SITE_ID,
        site_use_id: order.SITE_USE_ID,
        fusion_sales_order_num: order.FUSION_SALES_ORDER_NUM,
        customer_city: customer_city || order.CUSTOMER_CITY,
        customer_address: shipping_address || order.CUSTOMER_ADDRESS,
        customer_block: customer_block || order.CUSTOMER_BLOCK,
        contact_person: contact_person || order.CONTACT_PERSON,
        contact_number: contact_number || order.CONTACT_NUMBER,
      };

      console.log("📝 Update Header Payload:", updateHeaderPayload);

      headerRes = await axios.post(
        `${API_BASE_URL}/updateHeader`,
        JSON.stringify(updateHeaderPayload),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("✅ updateHeader response:", headerRes.data);
    }

    // ✅ Step 3: Update Line
    if (hasLineUpdates) {
      const line = order.ORDER_LINES.find((l) => l.ITEM_NUMBER === item_number);
      if (!line) {
        return errorResponse(
          res,
          404,
          `Order line not found for item: ${item_number}`
        );
      }

      const updateLinePayload = {
        order_line_id: line.ORDER_LINE_ID,
        order_header_id: order.ORDER_HEADER_ID,
        inventory_item_id: line.INVENTORY_ITEM_ID || line.inventory_item_id,
        item_number: item_number || line.ITEM_NUMBER,
        description: description || line.DESCRIPTION,
        uom: unit_of_measure || line.UOM || line.UNIT_OF_MEASURE,
        order_quantity: order_quantity || line.ORDER_QUANTITY,
        price: price || line.PRICE,
        amount: line_amount || line.AMOUNT || line.LINE_AMOUNT,
        line_status: line.LINE_STATUS || line.line_status || "ACTIVE",
        instructions: instructions || line.INSTRUCTIONS,
        creation_date: line.CREATION_DATE || line.creation_date,
        created_by: line.CREATED_BY || line.created_by,
        last_update_date: new Date().toISOString().split("T")[0],
        last_updated_by: "API_USER",
        payment_term: payment_term || line.PAYMENT_TERM || line.payment_term,
      };

      // Add requested_ship_date if it exists in the original line
      if (line.REQUESTED_SHIP_DATE || line.requested_ship_date) {
        updateLinePayload.requested_ship_date =
          line.REQUESTED_SHIP_DATE || line.requested_ship_date;
      }

      console.log("📝 Update Line Payload:", updateLinePayload);

      lineRes = await axios.post(
        `${API_BASE_URL}/updateOrderLine`,
        JSON.stringify(updateLinePayload),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("✅ updateOrderLine response:", lineRes.data);
    }

    // ✅ If nothing was updated
    if (!headerRes && !lineRes) {
      return errorResponse(res, 400, "No valid fields provided to update");
    }

    return successResponse(res, 200, "Order updated successfully", {
      header: headerRes?.data || null,
      line: lineRes?.data || null,
    });
  } catch (error) {
    console.error(
      "❌ Error updating sales request:",
      error.response?.data || error.message
    );
    return errorResponse(res, 500, error.response?.data || error.message);
  }
}

module.exports = editSalesRequest;
