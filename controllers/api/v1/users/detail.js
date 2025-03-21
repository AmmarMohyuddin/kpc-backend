const User = require("../../../../models/user");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function detail(req, res) {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select(
      "-password -authenticationToken -password_text"
    );
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }
    return successResponse(res, 200, "User details", user);
  } catch (error) {
    console.error("Error getting users:", error.message, error.stack);
    return errorResponse(res, 500, "Internal server error");
  }
}
module.exports = detail;
