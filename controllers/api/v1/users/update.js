const bcrypt = require("bcrypt");
const User = require("../../../../models/user");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function update(req, res) {
  const { id } = req.params;
  const { fullName, email, password } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    if (fullName) {
      user.fullName = fullName;
    }

    if (email) {
      user.email = email;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
    }

    await user.save();

    return successResponse(res, 200, "User updated successfully", {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      personNumber: user.personNumber,
      isApproved: user.isApproved,
    });
  } catch (error) {
    console.error("Error updating user:", error.message, error.stack);
    return errorResponse(res, 500, "Internal server error");
  }
}

module.exports = update;
