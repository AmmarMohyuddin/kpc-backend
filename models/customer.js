const mongoose = require("mongoose");
const { Schema } = mongoose;

const customerSchema = new Schema(
  {
    party_name: { type: String },
    account_number: { type: String },
    party_id: { type: Number },
    party_site_number: { type: String },
    party_site_name: { type: String },
    party_site_id: { type: Number },
    site_use_code: { type: String },
    site_use_id: { type: Number },
    cust_acct_site_id: { type: Number },
    address_line_1: { type: String },
    address_line_2: { type: String },
    address_line_3: { type: String },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
