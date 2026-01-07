const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createMyProfile,
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  getProfileByUserId,
} = require("../controllers/profileController");

// Toutes ces routes nécessitent un token
router.post("/", protect, createMyProfile);
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.delete("/me", protect, deleteMyProfile);

// pour recruteurs/admin
router.get("/user/:userId", protect, getProfileByUserId);

module.exports = router;
