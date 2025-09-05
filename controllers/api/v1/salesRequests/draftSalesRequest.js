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
    const { limit = 10, offset = 0 } = req.query;

    // 1. Get Access Token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return errorResponse(res, "Failed to retrieve access token", 401);
    }

    // 2. Call Oracle API with pagination parameters
    const { data } = await axios.get(`${API_BASE_URL}/getOrderDetails`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        ORDER_STATUS: "DRAFT",
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });

    // 3. Parse & clean data
    const orders = (data?.items || [])
      .map((item) => {
        try {
          return JSON.parse(item.order_json);
        } catch (err) {
          console.error("❌ Failed to parse order_json:", err.message);
          return null;
        }
      })
      .filter(Boolean);

    // 4. Send clean structured response with pagination info
    return successResponse(
      res,
      200,
      "Draft Sales requests fetched successfully",
      {
        orders: orders,
        pagination: {
          limit: data.limit,
          offset: data.offset,
          hasMore: data.hasMore,
        },
      }
    );
  } catch (error) {
    console.error("❌ Error fetching sales requests:", error.message);

    if (error.response) {
      return errorResponse(
        res,
        error.response.data?.message || "Oracle API error",
        error.response.status
      );
    }

    if (error.code === "ECONNABORTED") {
      return errorResponse(res, "Request timed out", 504);
    }

    return errorResponse(res, "Internal Server Error", 500);
  }
}

module.exports = draftSalesRequest;
