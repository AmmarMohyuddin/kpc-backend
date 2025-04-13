const Order = require("../../../../models/order");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function create(req, res) {
  try {
    const { status } = req.body;

    // Get the highest numeric orderId
    const lastOrder = await Order.findOne({}).sort({ $natural: -1 }); // Or fallback to numeric max

    // Convert safely to number
    let lastOrderNumber = 0;
    if (lastOrder && !isNaN(lastOrder.orderId)) {
      lastOrderNumber = parseInt(lastOrder.orderId);
    } else {
      // Optional fallback: get max with aggregation in case of gaps
      const maxResult = await Order.aggregate([
        {
          $group: {
            _id: null,
            maxOrderId: { $max: { $toInt: "$orderId" } },
          },
        },
      ]);

      lastOrderNumber = maxResult[0]?.maxOrderId || 0;
    }

    const currentOrderId = lastOrderNumber + 1;

    if (status === true) {
      const newOrder = new Order({
        orderId: currentOrderId.toString(),
        status: true,
      });

      await newOrder.save();
    }

    return successResponse(res, 200, "Order processed", {
      orderId: currentOrderId,
      created: status === true,
      nextOrderId: currentOrderId + 1,
    });
  } catch (error) {
    console.error("Error creating order:", error.message);
    return errorResponse(
      res,
      500,
      "An error occurred while processing your request"
    );
  }
}

module.exports = create;
