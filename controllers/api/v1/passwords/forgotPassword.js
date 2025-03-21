const User = require("../../../../models/user");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
// const sendMail = require("../../../../utils/mailer");

async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse(res, 400, "User not found");
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    user.reset_password_otp = resetCode;
    user.reset_password_expires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // const emailResult = await sendMail({
    //   to: user.email,
    //   subject: "OTP for Resetting Password",
    //   text: `Hi ${user.full_name},\n\nYour OTP for resetting the password is ${resetCode}. This OTP is valid for 15 minutes.`,
    //   html: `<p>Hi <strong>${user.full_name}</strong>,</p><p>Your OTP for resetting the password is <strong>${resetCode}</strong>. This OTP is valid for 15 minutes.</p><p>Best regards,<br>Babtain Notify</p>`,
    // });

    // if (!emailResult.success) {
    //   return errorResponse(
    //     res,
    //     500,
    //     "Failed to send email. Please try again later."
    //   );
    // }

    return successResponse(res, 200, "OTP send successfully");
  } catch (error) {
    console.error("Error sending reset code:", error.message);
    return errorResponse(
      res,
      500,
      "An error occurred while processing your request"
    );
  }
}

module.exports = forgotPassword;
