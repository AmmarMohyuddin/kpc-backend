const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function uninvoicedOrders(req, res) {
  try {
    const { limit, offset, ORDER_NUMBER } = req.query.params || req.query;

    const params = {};

    if (ORDER_NUMBER) {
      params.ORDER_NO = ORDER_NUMBER;
    } else {
      // Only apply pagination if no filter is present
      params.limit = parseInt(limit);
      params.offset = parseInt(offset);
    }

    console.log("Params Sent to Oracle API:", params);

    // 1️⃣ Get Access Token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return errorResponse(res, 401, "Failed to retrieve access token");
    }

    // 2️⃣ Call Oracle API
    const response = await axios.get(`${API_BASE_URL}/getPendingOrders`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
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
              lines: parsed.LINES || [],
            };
          } catch (err) {
            console.error("❌ Failed to parse item.result:", err.message);
            return null;
          }
        })
        .filter(Boolean) || [];

    // 4️⃣ Return response
    return successResponse(res, 200, "Uninvoiced orders fetched successfully", {
      orders,
      pagination: ORDER_NUMBER
        ? null // ❌ disable pagination if filter is applied
        : {
            limit: oracleData.limit,
            offset: oracleData.offset,
            hasMore: oracleData.hasMore,
          },
    });
  } catch (error) {
    console.error("❌ Error fetching uninvoiced orders:", error.message);

    if (error.response) {
      return errorResponse(
        res,
        error.response.data?.message || "Oracle API error",
        error.response.status
      );
    }

    return errorResponse(res, "Internal Server Error", 500);
  }
}

module.exports = uninvoicedOrders;
