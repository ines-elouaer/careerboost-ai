const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createSkill,
  getSkills,
  getSkillById,
  updateSkill,
  deleteSkill,
} = require("../controllers/skillController");

// Public
router.get("/", getSkills);
router.get("/:id", getSkillById);

// Private (recruteur/admin)
router.post("/", protect, createSkill);
router.put("/:id", protect, updateSkill);
router.delete("/:id", protect, deleteSkill);

module.exports = router;
