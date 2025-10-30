const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function ocisession(req, res) {
  try {
    // Session is now managed by frontend localStorage
    // This endpoint can be used for server-side validation if needed
    return successResponse(
      res,
      200,
      "Session check - use localStorage on frontend",
      {
        loggedIn: false, // Always false on backend, check localStorage on frontend
        message: "Session is managed via localStorage on the frontend",
      }
    );
  } catch (error) {
    console.error("Error checking session:", error);
    return errorResponse(res, 500, "An error occurred while checking session.");
  }
}

module.exports = ocisession;
