const mongoose = require("mongoose");
const { Schema } = mongoose;

const itemSchema = new Schema({
  item_number: { type: String },
  item_detail: { type: String },
  description: { type: String },
  instructions: { type: String },
  order_quantity: { type: Number },
  price: { type: Number },
  line_amount: { type: Number },
  unit_of_measure: { type: String },
  sub_category: { type: String },
});

const confirmAddressSchema = new Schema({
  name: { type: String },
  city: { type: String },
  contactNumber: { type: String },
  block: { type: String },
  shippingAddress: { type: String },
});

const salesRequestSchema = new Schema(
  {
    customer_id: { type: String },
    customer_name: { type: String },
    account_number: { type: String },
    address: { type: String },
    payment_term: { type: String },
    customer_po_number: { type: String },
    salesperson_id: { type: String },
    salesperson_name: { type: String },
    items: [itemSchema],
    confirm_address: confirmAddressSchema,
    total_amount: { type: Number },
  },
  { timestamps: true }
);

const SalesRequest = mongoose.model("SalesRequest", salesRequestSchema);

module.exports = SalesRequest;
