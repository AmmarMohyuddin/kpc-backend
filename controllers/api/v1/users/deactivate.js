const User = require("../../../../models/user");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function deactivate(req, res) {
  const { id } = req.params;
  const { deactivateStatus } = req.body;
  console.log("Deactivate user:", id, deactivateStatus);
  try {
    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    const status = deactivateStatus === "true";

    user.deactivated = status;
    await user.save();

    const message = status
      ? "User deactivated successfully."
      : "User reactivated successfully.";
    return successResponse(res, 200, message, user);
  } catch (error) {
    console.error("Error updating user:", error);
    return errorResponse(res, 500, "Internal server error.");
  }
}

module.exports = deactivate;
