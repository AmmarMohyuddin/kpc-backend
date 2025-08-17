const SalesRequest = require("../../../../models/salesRequest");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function updateItem(req, res) {
  try {
    const {
      customer_id,
      item_number,
      item_detail,
      description,
      instructions,
      sub_category,
      order_quantity,
      price,
      line_amount,
      unit_of_measure,
    } = req.body;

    if (!customer_id || !item_number) {
      return errorResponse(
        res,
        400,
        "customer_id and item_number are required"
      );
    }

    // Build the update object dynamically so only provided fields are updated
    const updateFields = {};
    if (item_detail !== undefined)
      updateFields["items.$.item_detail"] = item_detail;
    if (description !== undefined)
      updateFields["items.$.description"] = description;
    if (instructions !== undefined)
      updateFields["items.$.instructions"] = instructions;
    if (sub_category !== undefined)
      updateFields["items.$.sub_category"] = sub_category;
    if (order_quantity !== undefined)
      updateFields["items.$.order_quantity"] = Number(order_quantity);
    if (price !== undefined) updateFields["items.$.price"] = Number(price);
    if (line_amount !== undefined)
      updateFields["items.$.line_amount"] = Number(line_amount);
    if (unit_of_measure !== undefined)
      updateFields["items.$.unit_of_measure"] = unit_of_measure;

    const updatedSalesRequest = await SalesRequest.findOneAndUpdate(
      { customer_id, "items.item_number": item_number }, // Match customer & item
      { $set: updateFields },
      { new: true }
    );

    if (!updatedSalesRequest) {
      return errorResponse(res, 404, "Item not found for this customer");
    }

    return successResponse(
      res,
      200,
      "Item updated successfully",
      updatedSalesRequest
    );
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
}

module.exports = updateItem;
