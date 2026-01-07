// backend/models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["NEW_APPLICATION", "APPLICATION_STATUS"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    jobOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobOffer",
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
