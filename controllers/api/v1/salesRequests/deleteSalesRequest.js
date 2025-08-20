const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function deleteSalesRequest(req, res) {
  try {
    console.log("🚀 Starting deleteSalesRequest API...");
    console.log("📩 Incoming body:", req.body);

    const { order_header_id, item_number } = req.body;

    if (!order_header_id) {
      return errorResponse(res, 400, "ORDER_HEADER_ID is required");
    }

    // 🔑 Get access token
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Failed to retrieve access token");
    console.log("✅ Access token retrieved successfully");

    // Common headers
    const headers = { Authorization: `Bearer ${accessToken}` };

    let orderData = null;

    // 📝 Step 1: Get Order Details (only needed if deleting line)
    if (item_number) {
      const response = await axios.get(
        `${API_BASE_URL}/getOrderDetails?ORDER_HEADER_ID=${order_header_id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const oracleData = response.data;
      console.log("Oracle API response:", oracleData);

      // Check if items exist and parse the order_json
      if (
        oracleData.items &&
        oracleData.items.length > 0 &&
        oracleData.items[0].order_json
      ) {
        orderData = JSON.parse(oracleData.items[0].order_json);
      }

      if (!orderData) {
        return errorResponse(res, 404, "Order not found");
      }
    }
    console.log("📦 Order details retrieved:", orderData);

    let deleteRes;

    if (item_number) {
      // 📝 Delete specific order line
      if (!orderData.ORDER_LINES) {
        return errorResponse(res, 404, "No order lines found in this order");
      }

      const line = orderData.ORDER_LINES.find(
        (l) => l.ITEM_NUMBER === item_number
      );

      if (!line) {
        return errorResponse(res, 404, "Item not found in this order");
      }

      const payload = {
        order_header_id,
        order_line_id: line.ORDER_LINE_ID,
      };

      console.log("🗑 Deleting line:", payload);

      deleteRes = await axios.post(
        `${API_BASE_URL}/deleteOrderLine`,
        JSON.stringify(payload),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      // 📝 Delete entire order header
      const payload = { order_header_id: order_header_id };

      console.log("🗑 Deleting order header:", payload);

      deleteRes = await axios.post(
        `${API_BASE_URL}/deleteHeader`,
        JSON.stringify(payload),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("✅ Delete API response:", deleteRes.data);

    return successResponse(
      res,
      200,
      "Order deleted successfully",
      deleteRes.data.message
    );
  } catch (error) {
    console.error(
      "❌ Error deleting sales request:",
      error.response?.data || error.message
    );
    return errorResponse(res, 500, error.response?.data || error.message);
  }
}

module.exports = deleteSalesRequest;
