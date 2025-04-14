const OrderLine = require("../../../../models/orderLine");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function create(req, res) {
  try {
    const { status } = req.body;

    // Get the last created order line
    const lastOrderLineDoc = await OrderLine.findOne({}).sort({ $natural: -1 });

    // Convert safely to number
    let lastOrderLineNumber = 0;
    if (lastOrderLineDoc && !isNaN(lastOrderLineDoc.orderLineId)) {
      lastOrderLineNumber = parseInt(lastOrderLineDoc.orderLineId);
    } else {
      const maxResult = await OrderLine.aggregate([
        {
          $group: {
            _id: null,
            maxOrderLineId: { $max: { $toInt: "$orderLineId" } },
          },
        },
      ]);
      lastOrderLineNumber = maxResult[0]?.maxOrderLineId || 0;
    }

    const currentOrderLineId = lastOrderLineNumber + 1;

    if (status === true) {
      const newOrderLine = new OrderLine({
        orderLineId: currentOrderLineId.toString(),
        status: true,
      });

      await newOrderLine.save();
    }

    return successResponse(res, 200, "Order line processed", {
      orderLineId: currentOrderLineId,
      created: status === true,
      nextOrderLineId: currentOrderLineId + 1,
    });
  } catch (error) {
    console.error("Error creating order line:", error.message);
    return errorResponse(
      res,
      500,
      "An error occurred while processing your request"
    );
  }
}

module.exports = create;
