const Customer = require("../../../../models/customer");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function listing(req, res) {
  const { customer_name } = req.query;

  try {
    if (!customer_name) {
      return errorResponse(res, 400, "customer_name is required in query.");
    }

    const customers = await Customer.find({ party_name: customer_name });

    if (!customers || customers.length === 0) {
      return errorResponse(res, 404, "Customer not found.");
    }

    const formatted = customers.map((c) => {
      const addressParts = [
        c.address_line_1,
        c.address_line_2,
        c.address_line_3,
      ].filter(Boolean);

      return {
        account_number: c.account_number,
        payment_term: c.payment_term,
        address: addressParts.length === 1 ? addressParts[0] : addressParts,
      };
    });

    return successResponse(
      res,
      200,
      "Customer retrieved successfully.",
      formatted
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

module.exports = listing;
