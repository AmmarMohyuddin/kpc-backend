const mongoose = require("mongoose");
const { Schema } = mongoose;

const leadSchema = new Schema(
  {
    leadId: {
      type: String,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Lead = mongoose.model("Lead", leadSchema);

module.exports = Lead;
