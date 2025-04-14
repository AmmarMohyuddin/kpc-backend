const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderLineSchema = new Schema(
  {
    orderLineId: {
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

const OrderLine = mongoose.model("OrderLine", orderLineSchema);

module.exports = OrderLine;
