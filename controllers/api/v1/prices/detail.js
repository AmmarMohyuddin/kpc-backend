const Price = require("../../../../models/price");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function detail(req, res) {
  const itemNumber = req.params.item_number;

  try {
    const price = await Price.find({ item_number: itemNumber });

    if (!price) {
      return successResponse(res, 200, "No prices found in the database.", []);
    }

    return successResponse(res, 200, "Prices retrieved successfully.", price);
  } catch (error) {
    console.error("Error retrieving prices:", error.stack);
    return errorResponse(res, 500, "Failed to retrieve prices.", error.message);
  }
}

module.exports = detail;
