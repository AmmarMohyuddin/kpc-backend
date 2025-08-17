const Customer = require("../../../../models/customer");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function list(req, res) {
  const { customer_name, account_number } = req.query;

  try {
    // Case 1: Get Address + Payment Term for specific customer & account
    if (customer_name && account_number) {
      const customers = await Customer.find({
        party_name: customer_name,
        account_number: account_number,
      });

      if (!customers || customers.length === 0) {
        return errorResponse(res, 404, "Customer not found.");
      }

      const addressLines = [
        ...new Set(customers.map((customer) => customer.address_line_1)),
      ];

      const paymentTerms = [
        ...new Set(customers.map((customer) => customer.payment_term)),
      ];

      return successResponse(
        res,
        200,
        "Address lines and payment terms retrieved successfully.",
        {
          addressLines,
          paymentTerms,
        }
      );
    }

    // Case 2: Get account numbers for given customer name
    if (customer_name && !account_number) {
      const customers = await Customer.find({ party_name: customer_name });
      if (!customers || customers.length === 0) {
        return errorResponse(res, 404, "Customer not found.");
      }

      const accountNumbers = [
        ...new Set(customers.map((customer) => customer.account_number)),
      ];

      return successResponse(
        res,
        200,
        "Account numbers retrieved successfully.",
        accountNumbers
      );
    }

    // Case 3: Get all unique customers
    const uniqueCustomers = await Customer.aggregate([
      {
        $group: {
          _id: "$party_name",
          customer: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: { newRoot: "$customer" },
      },
    ]);

    if (!uniqueCustomers || uniqueCustomers.length === 0) {
      return successResponse(
        res,
        200,
        "No customers found in the database.",
        []
      );
    }

    return successResponse(
      res,
      200,
      "Customers retrieved successfully.",
      uniqueCustomers
    );
  } catch (error) {
    console.error("Error retrieving customers:", error.stack);
    return errorResponse(
      res,
      500,
      "Failed to retrieve customers.",
      error.message
    );
  }
}

module.exports = list;
