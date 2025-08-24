const mongoose = require("mongoose");
const { Schema } = mongoose;

const sourceSchema = new Schema(
  {
    source_id: { type: Number },
    lead_source: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

const Source = mongoose.model("Source", sourceSchema);

module.exports = Source;
