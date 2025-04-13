const Order = require("../../../../models/order");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

let orderCount = 0; // Starts from 0

async function create(req, res) {
  try {
    const { status } = req.body;
    const orderId = generateOrderId();

    if (status === true) {
      const newOrder = new Order({
        orderId,
        status: true,
      });

      await newOrder.save();
      orderCount++; // Increment only when saved
    }

    return successResponse(res, 200, "Order processed", {
      orderId,
      created: status === true,
      nextOrderId: `KPCM-${orderCount + 1}`,
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

function generateOrderId() {
  return `KPCM-${orderCount + 1}`;
}

module.exports = create;
