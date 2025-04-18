const Customer = require("../../../../models/customer");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function list(req, res) {
  try {
    const customers = await Customer.find();
    if (!customers || customers.length === 0) {
      return successResponse(
        res,
        200,
        "No customer found in the database.",
        []
      );
    }
    return successResponse(
      res,
      200,
      "Customers retrieved successfully.",
      customers
    );
  } catch (error) {
    console.error("Error retrieving customers:", error.stack);
    return errorResponse(
      res,
      500,
      "Failed to retrieve customers.",
      error.message
    );
  }
}

module.exports = list;
