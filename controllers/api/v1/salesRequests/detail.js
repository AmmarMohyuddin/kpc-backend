const SalesRequest = require("../../../../models/salesRequest");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function detail(req, res) {
  try {
    const { customer_id, item_number } = req.body;
    console.log("Fetching sales request for:", { customer_id, item_number });

    if (!customer_id) {
      return errorResponse(res, 400, "Customer ID is required");
    }

    // Case 1: If both customer_id and item_number are provided
    if (item_number) {
      const salesRequest = await SalesRequest.findOne(
        {
          customer_id,
          "items.item_number": item_number,
        },
        { items: { $elemMatch: { item_number } } } // return only the matching item
      );

      if (!salesRequest || !salesRequest.items.length) {
        return errorResponse(res, 404, "Item not found for this customer");
      }

      return successResponse(
        res,
        200,
        "Item retrieved successfully",
        salesRequest.items[0]
      );
    }

    // Case 2: If only customer_id is provided → return full sales request
    const salesRequest = await SalesRequest.findOne({ customer_id });

    if (!salesRequest) {
      return errorResponse(
        res,
        404,
        "Sales request not found for this customer"
      );
    }

    return successResponse(
      res,
      200,
      "Full sales request retrieved successfully",
      salesRequest
    );
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
}

module.exports = detail;
