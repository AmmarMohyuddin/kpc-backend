const mongoose = require("mongoose");
const { Schema } = mongoose;

const salespersonSchema = new Schema(
  {
    sales_person_id: { type: Number },
    party_name: { type: String },
    person_number: { type: String },
    registered: { type: Boolean, default: false },
    registered_date: { type: Date },
    last_update_date: { type: String },
  },
  { timestamps: true }
);

const Salesperson = mongoose.model("Salesperson", salespersonSchema);

module.exports = Salesperson;
