const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    person_number: { type: String, required: true },
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    legal_employer: { type: String, required: true },
    business_unit: { type: String, required: true },
    department: { type: String, required: true },
    department_code: { type: String, required: true },
    manager_name: { type: String, required: true },
    manager_email: { type: String, required: true },
    position: { type: String, required: true },
  },
  { timestamps: true }
);

const ImportUser = mongoose.model("ImportUser", userSchema);

module.exports = ImportUser;
