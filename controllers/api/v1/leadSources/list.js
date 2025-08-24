const Source = require("../../../../models/source");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function list(req, res) {
  try {
    const sources = await Source.find().select({
      lead_source: 1,
      _id: 0,
    });
    if (!sources || sources.length === 0) {
      return successResponse(res, 200, "No sources found in the database.", []);
    }
    return successResponse(
      res,
      200,
      "Sources retrieved successfully.",
      sources
    );
  } catch (error) {
    console.error("Error retrieving sources:", error.stack);
    return errorResponse(
      res,
      500,
      "Failed to retrieve sources.",
      error.message
    );
  }
}

module.exports = list;
