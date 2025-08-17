const Item = require("../../../../models/item");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function list(req, res) {
  try {
    const items = await Item.find();
    if (!items || items.length === 0) {
      return successResponse(res, 200, "No items found in the database.", []);
    }
    return successResponse(res, 200, "Items retrieved successfully.", items);
  } catch (error) {
    console.error("Error retrieving items:", error.stack);
    return errorResponse(res, 500, "Failed to retrieve items.", error.message);
  }
}

module.exports = list;
