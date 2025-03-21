const User = require("../../../../models/user");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function approveUser(req, res) {
  const { id } = req.params;
  const { is_approved } = req.body;
  console.log(req.body);
  console.log(req.params);
  try {
    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }
    user.is_approved = is_approved;
    await user.save();
    return successResponse(res, 200, "User approved successfully", {
      _id: user._id,
      full_name: user.full_name,
      email: user.email,
      person_number: user.person_number,
      is_approved: user.is_approved,
    });
  } catch (error) {
    console.error("Error getting users:", error.message, error.stack);
    return errorResponse(res, 500, "Internal server error");
  }
}
module.exports = approveUser;
