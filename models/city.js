const mongoose = require("mongoose");
const { Schema } = mongoose;

const citySchema = new Schema(
  {
    name: { type: String },
  },
  { timestamps: true }
);

const City = mongoose.model("City", citySchema);

module.exports = City;
