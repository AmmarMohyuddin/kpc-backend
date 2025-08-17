const City = require("../../../../models/city");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function list(req, res) {
  try {
    const cities = await City.find({}, { name: 1, _id: 0 }).sort({ name: 1 });

    if (!cities.length) {
      return successResponse(res, 200, "No cities found in the database.", []);
    }

    return successResponse(res, 200, "Cities retrieved successfully.", cities);
  } catch (error) {
    console.error("Error retrieving cities:", error.stack);
    return errorResponse(res, 500, "Failed to retrieve cities.", error.message);
  }
}

module.exports = list;
