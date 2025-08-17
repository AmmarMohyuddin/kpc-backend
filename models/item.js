const mongoose = require("mongoose");
const { Schema } = mongoose;

const itemSchema = new Schema(
  {
    inventory_item_id: { type: Number },
    item_type_name: { type: String },
    item_number: { type: String },
    description: { type: String },
    enabled_flag: { type: String },
    unit_of_measure: { type: String },
    item_class_code: { type: String },
    brand: { type: String },
    major_cat: { type: String },
    minor_cat: { type: String },
    sub_cat: { type: String },
    creation_date: { type: Date },
    last_update_date: { type: Date },
    item_detail: { type: String },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
