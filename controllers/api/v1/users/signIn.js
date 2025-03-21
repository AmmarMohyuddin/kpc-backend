const User = require("../../../../models/user");
const bcrypt = require("bcryptjs");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function signIn(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 400, "Email and password are required.");
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse(res, 400, "Email is incorrect.");
    }

    if (!user.is_approved) {
      return errorResponse(res, 403, "Contact admin for approval to sign in.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 400, "Password is incorrect.");
    }

    user.authentication_token = user.generateToken();
    await user.save();

    return successResponse(res, 200, "Successfully Signed In", user);
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      500,
      "An error occurred, please try again later."
    );
  }
}

module.exports = signIn;
