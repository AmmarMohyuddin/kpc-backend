const mongoose = require("mongoose");
const { Schema } = mongoose;

const blockSchema = new Schema(
  {
    name: { type: String },
  },
  { timestamps: true }
);

const Block = mongoose.model("Block", blockSchema);

module.exports = Block;
