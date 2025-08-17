const fetchCustomers = require("../../../../services/customers/fetchCustomers");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function getCustomers(req, res) {
  try {
    const customers = await fetchCustomers();
    return successResponse(res, 200, "Customer details", customers);
  } catch (error) {
    console.error(
      "Error getting customers:",
      error.response ? error.response.data : error.message
    );
    return errorResponse(res, 500, "Internal server error");
  }
}

module.exports = getCustomers;
