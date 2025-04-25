const Customer = require("../../../../models/customer");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function detail(req, res) {
  const { id } = req.params;
  try {
    const customer = await Customer.findById(id);
    if (!customer) {
      return errorResponse(res, 404, "Customer not found");
    }
    return successResponse(res, 200, "Customer details", customer);
  } catch (error) {
    console.error("Error getting customers:", error.message, error.stack);
    return errorResponse(res, 500, "Internal server error");
  }
}
module.exports = detail;
