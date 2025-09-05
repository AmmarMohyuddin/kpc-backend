const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function openOrders(req, res) {
  try {
    const { limit = 10, offset = 0 } = req.query;

    // 1️⃣ Get Access Token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return errorResponse(res, 401, "Failed to retrieve access token");
    }

    // 2️⃣ Call Oracle API with pagination parameters
    const response = await axios.get(`${API_BASE_URL}/getOpenOrder`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });

    // 3️⃣ Parse response
    const oracleData = response.data;

    const orders =
      oracleData.items
        ?.map((item) => {
          try {
            const parsed = JSON.parse(item.result);
            return {
              order_no: parsed.ORDER_NO,
              lines: parsed.LINES || [],
            };
          } catch (err) {
            console.error("❌ Failed to parse item.result:", err.message);
            return null;
          }
        })
        .filter(Boolean) || [];

    // 4️⃣ Return clean structured response with pagination info
    return successResponse(res, 200, "Open orders fetched successfully", {
      orders: orders,
      pagination: {
        limit: oracleData.limit,
        offset: oracleData.offset,
        hasMore: oracleData.hasMore,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching open orders:", error.message);

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

module.exports = openOrders;
