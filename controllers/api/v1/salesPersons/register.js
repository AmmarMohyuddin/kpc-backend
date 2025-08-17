const bcrypt = require("bcrypt");
const crypto = require("crypto");
const importUser = require("../../../../models/importUser");
const User = require("../../../../models/user");
const salesPerson = require("../../../../models/salesperson");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const sendMail = require("../../../../utils/mailer");

function generateRandomPassword(length = 10) {
  return crypto.randomBytes(length).toString("base64").slice(0, length);
}

async function register(req, res) {
  const { full_name, person_number, email } = req.body;
  console.log("Registering user with data:", {
    full_name,
    person_number,
    email,
  });

  try {
    const salesPersonDoc = await salesPerson.findOne({
      employee_number: person_number,
    });
    if (!salesPersonDoc) {
      return errorResponse(res, 404, "Sales person not found.");
    }

    const existingImportUser = await importUser.findOne({ person_number });

    if (!existingImportUser) {
      return errorResponse(
        res,
        404,
        "User with the given person number does not exist in importUser."
      );
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return errorResponse(
        res,
        409,
        "User with this email already registered."
      );
    }

    const existingUser = await User.findOne({ person_number });
    if (existingUser) {
      return errorResponse(res, 409, "User is already registered.");
    }

    const generatedPassword = generateRandomPassword(12);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const newUser = await User.create({
      person_number,
      email,
      password: hashedPassword,
      password_text: generatedPassword,
      full_name,
      role: "salesPerson",
      sales_person: salesPersonDoc._id,
    });

    await salesPerson.updateOne(
      { employee_number: person_number },
      {
        $set: {
          registered: true,
          registered_date: new Date(),
        },
      }
    );

    setImmediate(async () => {
      try {
        await sendMail({
          to: newUser.email,
          subject: "Welcome to KPC - Your Account is Created",
          text: `Hi ${newUser.full_name},\n\nWelcome to KPC! Your account has been successfully created. Here are your login details:\n\nEmail: ${newUser.email}\nPassword: ${generatedPassword}\n\nPlease keep your credentials secure.`,
          html: `<p>Hi <strong>${newUser.full_name}</strong>,</p><p>Welcome to KPC! Your account has been successfully created. Here are your login details:</p><p><strong>Email:</strong> ${newUser.email}</p><p><strong>Password:</strong> ${generatedPassword}</p><p>Please keep your credentials secure.</p><p>Best regards,<br>KPC-Kuwait Paint Company</p>`,
        });
      } catch (err) {
        console.error("Failed to send email:", err.message);
      }
    });

    return successResponse(res, 201, "User registered successfully.", newUser);
  } catch (error) {
    console.error("Error registering user:", error.stack);
    return errorResponse(res, 500, "Failed to register user.", error.message);
  }
}

module.exports = register;
