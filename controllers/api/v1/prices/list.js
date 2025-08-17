const Price = require("../../../../models/price");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function list(req, res) {
  try {
    const prices = await Price.find();
    if (!prices || prices.length === 0) {
      return successResponse(res, 200, "No prices found in the database.", []);
    }
    return successResponse(res, 200, "Prices retrieved successfully.", prices);
  } catch (error) {
    console.error("Error retrieving prices:", error.stack);
    return errorResponse(res, 500, "Failed to retrieve prices.", error.message);
  }
}

module.exports = list;
