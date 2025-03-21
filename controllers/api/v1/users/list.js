const User = require("../../../../models/user");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function list(req, res) {
  try {
    const users = await User.find({ role: { $ne: "admin" } }).select(
      "-password -authenticationToken -password_text"
    );
    return successResponse(res, 200, "Users list", users);
  } catch (error) {
    console.error("Error getting users:", error.message, error.stack);
    return errorResponse(res, 500, "Internal server error");
  }
}
module.exports = list;
