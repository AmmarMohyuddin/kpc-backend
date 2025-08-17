const SalesRequest = require("../../../../models/salesRequest");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function create(req, res) {
  try {
    const {
      customer_id,
      confirm_address,
      customer_name,
      account_number,
      address,
      payment_term,
      customer_po_number,
      salesperson_id,
      salesperson_name,
      item_detail,
      item_number,
      unit_of_measure,
      sub_category,
      description,
      instructions,
      order_quantity,
      price,
      line_amount,
    } = req.body;

    console.log("Request body for creating sales request:", req.body);

    // If only confirm_address is sent
    if (confirm_address) {
      if (!customer_id) {
        return errorResponse(
          res,
          400,
          "customer_id is required to save address"
        );
      }

      const existingCustomer = await SalesRequest.findOne({ customer_id });

      if (existingCustomer) {
        existingCustomer.confirm_address = confirm_address;
        await existingCustomer.save();

        return successResponse(
          res,
          201,
          "Confirm address updated successfully",
          existingCustomer
        );
      } else {
        const salesRequest = new SalesRequest({
          customer_id,
          confirm_address,
          items: [],
          total_amount: 0,
        });

        await salesRequest.save();

        return successResponse(
          res,
          201,
          "Sales request created with confirm_address",
          salesRequest
        );
      }
    }

    // Full sales request creation
    if (!customer_id || !item_number) {
      return errorResponse(
        res,
        400,
        "customer_id and item_number are required"
      );
    }

    const existingCustomer = await SalesRequest.findOne({ customer_id });

    if (existingCustomer) {
      existingCustomer.items.push({
        item_number,
        item_detail,
        description,
        instructions,
        sub_category,
        order_quantity: Number(order_quantity),
        price: Number(price),
        line_amount: Number(line_amount),
        unit_of_measure,
      });

      // Recalculate total_amount
      existingCustomer.total_amount = existingCustomer.items.reduce(
        (sum, item) => sum + (item.line_amount || 0),
        0
      );

      await existingCustomer.save();

      return successResponse(
        res,
        201,
        "New item added to existing customer",
        existingCustomer
      );
    } else {
      const items = [
        {
          item_number,
          item_detail,
          description,
          instructions,
          sub_category,
          order_quantity: Number(order_quantity),
          price: Number(price),
          line_amount: Number(line_amount),
          unit_of_measure,
        },
      ];

      const salesRequest = new SalesRequest({
        customer_id,
        customer_name,
        account_number,
        address,
        payment_term,
        customer_po_number,
        salesperson_id,
        salesperson_name,
        items,
        total_amount: items.reduce(
          (sum, item) => sum + (item.line_amount || 0),
          0
        ),
      });

      await salesRequest.save();

      return successResponse(
        res,
        201,
        "Sales request created successfully",
        salesRequest
      );
    }
  } catch (error) {
    console.error("Error creating sales request:", error);
    return errorResponse(res, 400, error.message);
  }
}

module.exports = create;
