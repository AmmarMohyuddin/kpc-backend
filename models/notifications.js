const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    nid: { type: Number },
    notification_type: { type: String },
    object_name: { type: String },
    creation_date: { type: Date },
    created_by: { type: String },
    last_update_date: { type: Date },
    last_updated_by: { type: String },
    posted: { type: String },
    read_flag: { type: String },
    message: { type: String },
  },
  { timestamps: true }
);

const Notification = mongoose.model("notification", notificationSchema);

module.exports = Notification;
