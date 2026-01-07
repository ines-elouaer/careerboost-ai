const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { generateBio } = require("../controllers/aiController");
const { matchProfileToJob } = require("../controllers/matchController");

router.post("/generate-bio", protect, generateBio);
router.post("/match", protect, matchProfileToJob);

module.exports = router;
