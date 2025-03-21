const importUser = require("../../../../models/importUser");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function detail(req, res) {
  const { id } = req.params;
  try {
    const user = await importUser.findById(id);
    if (!user) {
      return successResponse(res, 404, "User not found");
    }
    return successResponse(res, 200, "User retrieved successfully", user);
  } catch (error) {
    console.error("Error retrieving user:", error.stack);
    return errorResponse(res, 400, "Failed to retrieve user", error.message);
  }
}

module.exports = detail;
