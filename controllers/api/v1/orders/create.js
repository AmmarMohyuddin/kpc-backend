const Order = require("../../../../models/order");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function create(req, res) {
  try {
    const { status } = req.body;

    const lastOrder = await Order.findOne().sort({ orderId: -1 });
    const lastOrderNumber = lastOrder ? parseInt(lastOrder.orderId) : 0;

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
