const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function orderHistory(req, res) {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const { ORDER_NUMBER, CUSTOMER_NAME, ACCOUNT_NUMBER } =
      req.query.params || req.query;
    console.log("➡️ Query Params:", req.query);
    const params = {};

    // ✅ Apply filters if present, otherwise fallback to pagination
    if (ORDER_NUMBER) {
      params.ORDER_NO = ORDER_NUMBER;
    } else if (CUSTOMER_NAME) {
      params.CUSTOMER_NAME = CUSTOMER_NAME;
    } else if (ACCOUNT_NUMBER) {
      params.ACCOUNT_NUMBER = ACCOUNT_NUMBER;
    } else {
      params.limit = parseInt(limit);
      params.offset = parseInt(offset);
    }

    console.log("➡️ Params Sent to Oracle API:", params);

    // 1️⃣ Get Access Token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return errorResponse(res, 401, "Failed to retrieve access token");
    }

    // 2️⃣ Call Oracle API
    const response = await axios.get(`${API_BASE_URL}/getOrderHistory`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
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
              customer_name: parsed.CUSTOMER_NAME,
              account_no: parsed.ACCOUNT_NO,
              lines: parsed.LINES || [],
            };
          } catch (err) {
            console.error("❌ Failed to parse item.result:", err.message);
            return null;
          }
        })
        .filter(Boolean) || [];

    // 4️⃣ Return structured response
    return successResponse(res, 200, "Order history fetched successfully", {
      orders,
      pagination:
        ORDER_NUMBER || CUSTOMER_NAME || ACCOUNT_NUMBER
          ? null // ✅ No pagination when filters applied
          : {
              limit: oracleData.limit,
              offset: oracleData.offset,
              hasMore: oracleData.hasMore,
            },
    });
  } catch (error) {
    console.error("❌ Error fetching order history:", error.message);

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

module.exports = orderHistory;
