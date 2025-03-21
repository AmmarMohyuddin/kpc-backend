const User = require("../../../../models/user");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function verifyOtp(req, res) {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse(res, 400, "User with this email not found!");
    }

    if (!user.reset_password_otp || user.reset_password_expires < Date.now()) {
      return errorResponse(res, 400, "OTP is invalid or has expired!");
    }

    if (user.reset_password_otp !== otp) {
      return errorResponse(res, 400, "Incorrect OTP!");
    }

    user.reset_password_otp = null;
    user.reset_password_expires = null;
    await user.save();

    return successResponse(res, 200, "OTP verified successfully");
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    return errorResponse(res, 500, "An error occurred while verifying OTP");
  }
}

module.exports = verifyOtp;
