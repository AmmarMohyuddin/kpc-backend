const Block = require("../../../../models/block");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function list(req, res) {
  try {
    const blocks = await Block.find({}, { name: 1, _id: 0 }).sort({ name: 1 });

    if (!blocks.length) {
      return successResponse(res, 200, "No blocks found in the database.", []);
    }

    return successResponse(res, 200, "Blocks retrieved successfully.", blocks);
  } catch (error) {
    console.error("Error retrieving blocks:", error.stack);
    return errorResponse(res, 500, "Failed to retrieve blocks.", error.message);
  }
}

module.exports = list;
