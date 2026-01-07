const mongoose = require("mongoose");

const jobOfferSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // user.role = recruiter
    },
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    location: String,
    type: {
      type: String,
      enum: ["full-time", "part-time", "internship", "freelance"],
      default: "full-time",
    },
    description: {
      type: String,
      required: true,
    },
    requiredSkills: {
  type: [String],
  default: [],
},

    salaryRange: {
      min: Number,
      max: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    
  },
  
  { timestamps: true }
  
);

module.exports = mongoose.model("JobOffer", jobOfferSchema);
