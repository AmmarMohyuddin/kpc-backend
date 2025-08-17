const SalesRequest = require("../../../../models/salesRequest");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function deleteItem(req, res) {
  try {
    const { customer_id, item_number } = req.body;

    if (!customer_id || !item_number) {
      return errorResponse(
        res,
        400,
        "Customer ID and Item number are required"
      );
    }

    // First find the document to calculate new total
    const salesRequest = await SalesRequest.findOne({
      customer_id,
      "items.item_number": item_number,
    });

    if (!salesRequest) {
      return errorResponse(res, 404, "Item not found for this customer");
    }

    // Remove the item and calculate new total
    const updatedItems = salesRequest.items.filter(
      (item) => item.item_number !== item_number
    );

    const newTotalAmount = updatedItems.reduce(
      (sum, item) => sum + (item.line_amount || 0),
      0
    );

    // Update the document with new items array and recalculated total
    const updatedSalesRequest = await SalesRequest.findOneAndUpdate(
      { customer_id },
      {
        $pull: { items: { item_number } },
        $set: { total_amount: newTotalAmount },
      },
      { new: true }
    );

    return successResponse(
      res,
      200,
      "Item deleted successfully",
      updatedSalesRequest.items
    );
  } catch (error) {
    console.error("Error deleting item:", error);
    return errorResponse(res, 400, error.message);
  }
}

module.exports = deleteItem;
