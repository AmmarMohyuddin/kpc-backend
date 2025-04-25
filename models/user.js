const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    full_name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    person_number: {
      type: String,
    },
    password: {
      type: String,
    },
    password_text: {
      type: String,
      default: "",
    },
    is_approved: {
      type: Boolean,
      default: false,
    },
    authentication_token: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "employee", "salesPerson", "customer"],
    },
    reset_password_otp: {
      type: String,
    },
    reset_password_expires: {
      type: Date,
    },
    deactivated: {
      type: Boolean,
      default: false,
    },
    customer_account_no: {
      type: String,
    },
    customer_address: {
      type: String,
    },
    contact_number: {
      type: String,
    },
    contact_person: {
      type: String,
    },
    city: {
      type: String,
    },
    shipping_address: {
      type: String,
    },
    sales_person: {
      type: Schema.Types.ObjectId,
      ref: "SalesPerson",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateToken = function () {
  const maxAge = 24 * 60 * 60;
  // const maxAge = 60;
  const token = jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_KEY,
    {
      expiresIn: maxAge,
    }
  );
  this.authentication_token = token;
  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
