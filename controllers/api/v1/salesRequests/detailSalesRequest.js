const axios = require("axios");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const getAccessToken = require("../../../../services/getAccessTokenService");
const Customer = require("../../../../models/customer");
const Salesperson = require("../../../../models/salesperson");

const API_BASE_URL =
  "https://g3ef73baddaf774-babxdb.adb.eu-frankfurt-1.oraclecloudapps.com/ords/bintg/KPCCustomerApp";

async function detailSalesRequest(req, res) {
  const { order_header_id } = req.body;
  console.log("Received order_header_id:", order_header_id);
  try {
    // 1. Get Access Token
    const accessToken = await getAccessToken();

    // 2. Call Oracle API
    const response = await axios.get(
      `${API_BASE_URL}/getOrderDetails?ORDER_HEADER_ID=${order_header_id}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // 3. Parse response
    const oracleData = response.data;
    console.log("Oracle API response:", oracleData);

    const order =
      oracleData.items[0] && JSON.parse(oracleData.items[0].order_json);

    const customer = await Customer.findOne({
      account_number: order.CUSTOMER_ACCOUNT_NUMBER,
    });

    const salesperson = await Salesperson.findOne({
      salesperson_id: order.SALESPERSON,
    });

    console.log("Customer:", customer);
    console.log("Salesperson:", salesperson);

    const responseData = {
      ...order,
      CUSTOMER_ID: customer ? customer._id : null,
      SALESPERSON_ID: salesperson ? salesperson._id : null,
      SALESPERSON_NAME: salesperson ? salesperson.salesperson_name : null,
    };

    if (!order) {
      console.error("❌ Failed to parse order_json");
      return errorResponse(res, "Failed to parse order", 500);
    }

    // 4. Return clean structured response
    return successResponse(
      res,
      200,
      "Sales request fetched successfully",
      responseData
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

    return errorResponse(res, "Internal Server Error", 500);
  }
}

module.exports = detailSalesRequest;
