const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  getMyCompanyProfile,
  getCompanyProfileByUserId,
  createCompanyProfile,
  updateMyCompanyProfile,
} = require("../controllers/companyProfileController");

router.get("/me", protect, getMyCompanyProfile);
router.post("/", protect, createCompanyProfile);
router.put("/me", protect, updateMyCompanyProfile);

// 🔓 PUBLIC (candidats peuvent voir une entreprise)
router.get("/user/:userId", getCompanyProfileByUserId);

module.exports = router;
