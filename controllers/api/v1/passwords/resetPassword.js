const User = require("../../../../models/user");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const bcrypt = require("bcryptjs");

async function resetPassword(req, res) {
  const { email, newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return errorResponse(
      res,
      400,
      "Both newPassword and confirmPassword are required!"
    );
  }

  if (newPassword !== confirmPassword) {
    return errorResponse(res, 400, "Passwords do not match!");
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse(res, 400, "User with this email not found!");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return successResponse(res, 200, "Password reset successfully");
  } catch (error) {
    console.error("Error resetting password:", error.message);
    return errorResponse(
      res,
      500,
      "An error occurred while resetting the password"
    );
  }
}

module.exports = resetPassword;
