const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../../../../models/user");
const salesPerson = require("../../../../models/salesperson");
const Customer = require("../../../../models/customer");
const {
  successResponse,
  errorResponse,
} = require("../../../../utils/response");
const sendMail = require("../../../../utils/mailer");

function generateRandomPassword(length = 10) {
  return crypto.randomBytes(length).toString("base64").slice(0, length);
}

async function register(req, res) {
  try {
    const {
      customer_id,
      account_number,
      address,
      customer_email,
      contact_number,
      contact_person,
      city,
      shipping_address,
      sales_person_id,
    } = req.body;

    const salesPersonDoc = await salesPerson.findById(sales_person_id);
    if (!salesPersonDoc) {
      return errorResponse(res, 404, "Sales person not found.");
    }

    const customerDoc = await Customer.findById(customer_id);
    if (!customerDoc) {
      return errorResponse(res, 404, "Customer not found.");
    }

    const existingUser = await User.findOne({ email: customer_email });
    if (existingUser) {
      return errorResponse(res, 409, "User already exists with this email.");
    }

    const generatedPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const newUser = new User({
      full_name: customerDoc?.party_name,
      customer_account_no: account_number,
      customer_address: address,
      email: customer_email,
      contact_number: contact_number,
      contact_person: contact_person,
      city: city,
      shipping_address: shipping_address,
      sales_person: sales_person_id,
      password: hashedPassword,
      password_text: generatedPassword,
      role: "customer",
      customer: customer_id,
    });

    await newUser.save();

    await Customer.updateOne(
      { _id: customer_id },
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

    const responseUser = {
      id: newUser._id,
      full_name: newUser.full_name,
      email: newUser.email,
      contact_number: newUser.contact_number,
      contact_person: newUser.contact_person,
      city: newUser.city,
      shipping_address: newUser.shipping_address,
      role: newUser.role,
      customer_account_no: newUser.customer_account_no,
      customer_address: newUser.customer_address,
      sales_person: newUser.sales_person,
      customer: newUser.customer,
    };

    return successResponse(
      res,
      201,
      "Customer registered successfully.",
      responseUser
    );
  } catch (error) {
    console.error("[Register Error]:", error.stack);
    return errorResponse(res, 500, "Failed to register user.", error.message);
  }
}

module.exports = register;
