const User = require("../../../../models/user");
const SalesPerson = require("../../../../models/salesperson");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function destroy(req, res) {
  const { id } = req.params;
  console.log("Received ID to delete:", id);

  try {
    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    const personNumber = user.person_number;

    await user.deleteOne();

    if (personNumber) {
      await SalesPerson.updateOne(
        { person_number: personNumber },
        { $set: { registered: false } }
      );
    }

    return successResponse(res, 200, "User deleted successfully", {});
  } catch (error) {
    console.error("Error deleting user:", error);
    return errorResponse(res, 500, "Internal server error");
  }
}

module.exports = destroy;
