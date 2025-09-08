const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function draftSalesRequest(req, res) {
  try {
    const { limit, offset, CUSTOMER_NAME, ORDER_NUMBER } =
      req.query.params || req.query;

    const params = { ORDER_STATUS: "DRAFT" };

    // Apply filters if provided
    if (CUSTOMER_NAME) {
      params.CUSTOMER_NAME = CUSTOMER_NAME;
    } else if (ORDER_NUMBER) {
      params.ORDER_NUMBER = ORDER_NUMBER;
    } else {
      // ✅ Only apply pagination when no filters
      params.limit = parseInt(limit);
      params.offset = parseInt(offset);
    }

    console.log("➡️ Params sent to Oracle API:", params);

    // 1️⃣ Get Access Token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return errorResponse(res, 401, "Failed to retrieve access token");
    }

    // 2️⃣ Call Oracle API
    const response = await axios.get(`${API_BASE_URL}/getOrderDetails`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params,
    });

    const data = response.data;

    // 3️⃣ Parse order JSON safely
    const orders =
      data.items
        ?.map((item) => {
          try {
            return JSON.parse(item.order_json);
          } catch (err) {
            console.error("❌ Failed to parse order_json:", err.message);
            return null;
          }
        })
        .filter(Boolean) || [];

    // 4️⃣ Return structured response with conditional pagination
    return successResponse(
      res,
      200,
      "Draft Sales requests fetched successfully",
      {
        orders,
        pagination:
          CUSTOMER_NAME || ORDER_NUMBER
            ? null // ✅ No pagination when filters are applied
            : {
                limit: data.limit,
                offset: data.offset,
                hasMore: data.hasMore,
              },
      }
    );
  } catch (error) {
    console.error("❌ Error fetching draft sales requests:", error.message);

    if (error.response) {
      return errorResponse(
        res,
        error.response.status,
        error.response.data?.message || "Oracle API error"
      );
    }

    if (error.code === "ECONNABORTED") {
      return errorResponse(res, 504, "Request timed out");
    }

    return errorResponse(res, 500, "Internal Server Error");
  }
}

module.exports = draftSalesRequest;
