const salesPerson = require("../../../../models/salesperson");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function list(req, res) {
  try {
    const salesPersons = await salesPerson.find();
    if (!salesPersons || salesPersons.length === 0) {
      return successResponse(
        res,
        200,
        "No sales person found in the database.",
        []
      );
    }
    return successResponse(
      res,
      200,
      "Sales Person retrieved successfully.",
      salesPersons
    );
  } catch (error) {
    console.error("Error retrieving users:", error.stack);
    return errorResponse(res, 500, "Failed to retrieve users.", error.message);
  }
}

module.exports = list;
