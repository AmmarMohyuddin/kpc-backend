const mongoose = require("mongoose");
const { Schema } = mongoose;

const priceSchema = new Schema(
  {
    name: { type: String },
    item_number: { type: String },
    item_level_code: { type: String },
    pricing_uom_code: { type: String },
    base_price: { type: Number, default: 0 },
    start_date: { type: Date },
    end_date: { type: Date },
  },
  { timestamps: true }
);

const Price = mongoose.model("Price", priceSchema);

module.exports = Price;
