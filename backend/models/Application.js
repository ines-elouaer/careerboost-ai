const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobOffer",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },
    motivationLetter: {
      type: String,
    },
    matchedKeywordsScore: {
      type: Number, // pour future IA matching
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
