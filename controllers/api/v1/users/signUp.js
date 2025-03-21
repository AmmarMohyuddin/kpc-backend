const ImportUser = require("../../../../models/importUser");
const User = require("../../../../models/user");
const bcrypt = require("bcryptjs");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");

async function signUp(req, res) {
  try {
    const { email, person_number, password } = req.body;

    if (!email || !person_number) {
      return errorResponse(res, 400, "Person number and email are required");
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { person_number }],
    });

    if (existingUser) {
      return errorResponse(
        res,
        409,
        "Email or person number is already registered"
      );
    }

    const importUser = await ImportUser.findOne({
      person_number: person_number,
    });
    if (!importUser) {
      return errorResponse(
        res,
        404,
        "User does not exist against this person number"
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      person_number,
      full_name: importUser.full_name,
      authentication_token: null,
      role: "employee",
      password: hashedPassword,
      password_text: password,
    });

    await newUser.save();

    return successResponse(res, 201, "User registered successfully", newUser);
  } catch (error) {
    console.error("Error registering user:", error.message, error.stack);
    return errorResponse(res, 500, "Internal server error");
  }
}

module.exports = signUp;
