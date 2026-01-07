const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");

// Public routes
router.get("/", getJobs);
router.get("/:id", getJobById);

// Protected (recruiter)
router.post("/", protect, createJob);
router.put("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);

module.exports = router;
