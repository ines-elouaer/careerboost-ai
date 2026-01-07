const asyncHandler = require("express-async-handler");
const JobOffer = require("../models/JobOffer");

// @desc    Create job (recruiter only)
// @route   POST /api/jobs
// @access  Private
const createJob = asyncHandler(async (req, res) => {
  if (req.user.role !== "recruiter" && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Accès réservé aux recruteurs");
  }

  const { title, company, location, type, description, requiredSkills, salaryRange } = req.body;

  const job = await JobOffer.create({
    recruiter: req.user._id,
    title,
    company,
    location,
    type,
    description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
    salaryRange,
  });

  res.status(201).json(job);
});

// @desc    Get all active jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
  const jobs = await JobOffer.find({ isActive: true })
    .populate("recruiter", "username email")
    .populate("requiredSkills", "name level");
  res.json(jobs);
});

// @desc    Get job by id
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = asyncHandler(async (req, res) => {
  const job = await JobOffer.findById(req.params.id)
    .populate("recruiter", "username email")
    .populate("requiredSkills", "name level");

  if (!job) {
    res.status(404);
    throw new Error("Offre non trouvée");
  }

  res.json(job);
});

// @desc    Update job (owner only)
// @route   PUT /api/jobs/:id
// @access  Private
const updateJob = asyncHandler(async (req, res) => {
  const job = await JobOffer.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Offre non trouvée");
  }

  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Vous ne pouvez modifier que vos propres offres");
  }

  const updated = await JobOffer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json(updated);
});

// @desc    Delete job (owner only)
// @route   DELETE /api/jobs/:id
// @access  Private
const deleteJob = asyncHandler(async (req, res) => {
  const job = await JobOffer.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Offre non trouvée");
  }

  if (job.recruiter.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Vous ne pouvez supprimer que vos propres offres");
  }

  await job.deleteOne();
  res.json({ message: "Offre supprimée" });
});

module.exports = { createJob, getJobs, getJobById, updateJob, deleteJob };
