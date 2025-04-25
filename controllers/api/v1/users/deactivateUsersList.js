const User = require("../../../../models/user");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function deactivateUsersList(req, res) {
  try {
    const users = await User.find({
      role: { $ne: "admin" },
      deactivated: true,
    }).select("-password -authenticationToken -password_text");
    return successResponse(res, 200, "Deactivate User's list", users);
  } catch (error) {
    console.error("Error getting users:", error.message, error.stack);
    return errorResponse(res, 500, "Internal server error");
  }
}
module.exports = deactivateUsersList;
