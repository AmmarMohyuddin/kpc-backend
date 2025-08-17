const SalesRequest = require("../../../../models/salesRequest");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function list(req, res) {
  try {
    const { customer_id } = req.params;
    if (!customer_id) {
      return errorResponse(res, 400, "Customer ID is required");
    }

    const salesRequests = await SalesRequest.find({ customer_id }).select(
      "items -_id"
    );

    const allItems = salesRequests.flatMap((req) => req.items);

    return successResponse(res, 200, "Items retrieved successfully", allItems);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
}

module.exports = list;
