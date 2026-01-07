const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  applyForJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
  deleteMyApplication,
} = require("../controllers/applicationController");

// toutes ces routes nécessitent un token
router.post("/", protect, applyForJob);
router.get("/my", protect, getMyApplications);
router.get("/job/:jobId", protect, getApplicationsForJob);
router.patch("/:id/status", protect, updateApplicationStatus);
router.delete("/:id", protect, deleteMyApplication);

module.exports = router;
