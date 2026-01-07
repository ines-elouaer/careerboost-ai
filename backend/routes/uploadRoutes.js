const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect } = require("../middleware/authMiddleware");
const JobOffer = require("../models/JobOffer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `job-${req.params.jobId}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Format non supporté (jpeg/png/webp/pdf)"), false);
};

const upload = multer({ storage, fileFilter });

router.post(
  "/job/:jobId",
  protect,
  upload.single("file"),
  async (req, res) => {
    const job = await JobOffer.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Offre introuvable." });

    // 🔒 sécurité : seul le propriétaire peut uploader
    if (job.recruiter.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    job.attachment = {
      url: `/uploads/${req.file.filename}`,
      name: req.file.originalname,
      mimetype: req.file.mimetype,
    };

    await job.save();

    res.json({
      message: "Fichier ajouté avec succès",
      attachment: job.attachment,
    });
  }
);

module.exports = router;
