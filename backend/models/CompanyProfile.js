const mongoose = require("mongoose");

const companyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    companyName: { type: String, required: true },
    industry: { type: String, default: "" },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    websiteUrl: { type: String, default: "" },
    linkedinUrl: { type: String, default: "" },

    size: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
      default: "1-10",
    },

    logo: { type: String, default: "" },        // base64
    coverImage: { type: String, default: "" },  // base64 (optionnel)

    // ✅ ALBUM (3 photos max) - base64 ou URL
    albumImages: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length <= 3,
        message: "Album limité à 3 images maximum",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompanyProfile", companyProfileSchema);
