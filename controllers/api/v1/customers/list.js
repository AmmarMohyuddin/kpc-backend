const Customer = require("../../../../models/customer");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function list(req, res) {
  const { customer_name, account_number } = req.query;

  try {
    if (customer_name && account_number) {
      const customers = await Customer.find({
        party_name: customer_name,
        account_number: account_number,
      });

      const addressLines = [
        ...new Set(customers.map((customer) => customer.address_line_1)),
      ];

      return successResponse(
        res,
        200,
        "Unique address lines retrieved successfully.",
        addressLines
      );
    }

    if (customer_name && !account_number) {
      const customers = await Customer.find({ party_name: customer_name });
      const accountNumbers = [
        ...new Set(customers.map((customer) => customer.account_number)),
      ];
      if (!customers || customers.length === 0) {
        return errorResponse(res, 404, "Customer not found.");
      }

      return successResponse(
        res,
        200,
        "Account Numbers retrieved successfully.",
        accountNumbers
      );
    }

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

    console.log("Unique customers:", uniqueCustomers);

    if (!uniqueCustomers || uniqueCustomers.length === 0) {
      return successResponse(
        res,
        200,
        "No customer found in the database.",
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
