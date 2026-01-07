const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 1-1
    },
    fullName: {
      type: String,
      required: true,
    },
    headline: {
      type: String, // ex: "Fullstack MERN Developer"
    },
    bio: {
      type: String,
    },
    location: {
      type: String,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    skills: [{ type: String, trim: true }],

    linkedinUrl: String,
    portfolioUrl: String,
    avatar: {
      type: String, // on va stocker une image encodée en base64
    },
    goals: { type: String, default: "" },

  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
