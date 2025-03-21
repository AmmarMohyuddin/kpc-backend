const importUser = require("../../../../models/importUser");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function list(req, res) {
  try {
    const importUsers = await importUser.find();
    if (!importUsers || importUsers.length === 0) {
      return successResponse(res, 200, "No users found in the database.", []);
    }
    return successResponse(
      res,
      200,
      "Users retrieved successfully.",
      importUsers
    );
  } catch (error) {
    console.error("Error retrieving users:", error.stack);
    return errorResponse(res, 500, "Failed to retrieve users.", error.message);
  }
}

module.exports = list;
