const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function orderCharts(req, res) {
  try {
    // 1️⃣ Get Access Token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return errorResponse(res, 401, "Failed to retrieve access token");
    }

    // 2️⃣ Call both APIs in parallel
    const [openOrdersRes, historyRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/getOpenOrder?limit=10000`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      axios.get(`${API_BASE_URL}/getOrderHistory?limit=10000`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    // 3️⃣ Parse counts safely
    const openOrdersCount =
      openOrdersRes.data.items?.filter((item) => {
        try {
          return JSON.parse(item.result);
        } catch {
          return false;
        }
      }).length || 0;

    const orderHistoryCount =
      historyRes.data.items?.filter((item) => {
        try {
          return JSON.parse(item.result);
        } catch {
          return false;
        }
      }).length || 0;

    // 4️⃣ Return counts
    return successResponse(res, 200, "Order chart data fetched successfully", {
      open_orders: openOrdersCount,
      order_history: orderHistoryCount,
    });
  } catch (error) {
    console.error("❌ Error fetching order charts:", error.message);

    if (error.response) {
      return errorResponse(
        res,
        error.response.status,
        error.response.data?.message || "Oracle API error"
      );
    }

    return errorResponse(res, 500, "Internal Server Error");
  }
}

module.exports = orderCharts;
