const asyncHandler = require("express-async-handler");
const Application = require("../models/Application");
const JobOffer = require("../models/JobOffer");
const Notification = require("../models/Notification");

// @desc    Candidater à une offre
// @route   POST /api/applications
// @access  Private (candidate)
const applyForJob = asyncHandler(async (req, res) => {
  if (req.user.role !== "candidate") {
    res.status(403);
    throw new Error("Seuls les candidats peuvent postuler");
  }

  const { jobOffer, motivationLetter } = req.body;

  if (!jobOffer) {
    res.status(400);
    throw new Error("jobOffer est requis");
  }

  const job = await JobOffer.findById(jobOffer);
  if (!job || !job.isActive) {
    res.status(404);
    throw new Error("Offre introuvable ou inactive");
  }

  const existing = await Application.findOne({
    candidate: req.user._id,
    jobOffer,
  });

  if (existing) {
    res.status(400);
    throw new Error("Vous avez déjà postulé à cette offre");
  }

  const application = await Application.create({
    candidate: req.user._id,
    jobOffer,
    motivationLetter,
  });

  // 🔔 Notification pour le recruteur propriétaire
  await Notification.create({
    recipient: job.recruiter,
    type: "NEW_APPLICATION",
    message: `Nouvelle candidature pour "${job.title}"`,
    jobOffer: job._id,
    application: application._id,
  });

  const populated = await application
    .populate("jobOffer", "title company location")
    .populate("candidate", "username email");

  res.status(201).json(populated);
});

// @desc    Voir mes candidatures (candidat)
// @route   GET /api/applications/my
// @access  Private (candidate)
const getMyApplications = asyncHandler(async (req, res) => {
  if (req.user.role !== "candidate") {
    res.status(403);
    throw new Error("Accès réservé aux candidats");
  }

  const applications = await Application.find({ candidate: req.user._id })
    .populate("jobOffer", "title company location")
    .sort({ createdAt: -1 });

  res.json(applications);
});

// @desc    Voir les candidatures d'une offre (recruteur propriétaire)
// @route   GET /api/applications/job/:jobId
// @access  Private (recruteur/admin)
const getApplicationsForJob = asyncHandler(async (req, res) => {
  const job = await JobOffer.findById(req.params.jobId);

  if (!job) {
    res.status(404);
    throw new Error("Offre non trouvée");
  }

  if (
    job.recruiter.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Vous n'êtes pas propriétaire de cette offre");
  }

  const applications = await Application.find({ jobOffer: job._id })
    .populate("candidate", "username email")
    .sort({ createdAt: -1 });

  res.json(applications);
});

// @desc    Mettre à jour le statut d'une candidature
// @route   PATCH /api/applications/:id/status
// @access  Private (recruteur/admin)
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["pending", "reviewed", "accepted", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Statut invalide");
  }

  const application = await Application.findById(req.params.id).populate("jobOffer");

  if (!application) {
    res.status(404);
    throw new Error("Candidature non trouvée");
  }

  const job = application.jobOffer;

  if (
    job.recruiter.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Vous ne pouvez modifier que les candidatures de vos offres");
  }

  application.status = status;
  const updated = await application.save();

  // 🔔 Notification pour le candidat (tu pourras traduire côté front)
  await Notification.create({
    recipient: application.candidate,
    type: "APPLICATION_STATUS",
    message: `Votre candidature pour "${job.title}" est maintenant "${status}"`,
    jobOffer: job._id,
    application: application._id,
  });

  // ✅ Côté recruteur :
  // - si accepted/rejected => on supprime l'alerte "NEW_APPLICATION"
  // - sinon (reviewed/pending) => on la marque comme lue (optionnel)
  if (status === "accepted" || status === "rejected") {
    await Notification.deleteMany({
      recipient: job.recruiter,
      application: application._id,
      type: "NEW_APPLICATION",
    });
  } else {
    await Notification.updateMany(
      {
        recipient: job.recruiter,
        application: application._id,
        type: "NEW_APPLICATION",
      },
      { isRead: true }
    );
  }

  res.json(updated);
});

// @desc    Supprimer (retirer) sa propre candidature
// @route   DELETE /api/applications/:id
// @access  Private (candidate)
const deleteMyApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error("Candidature non trouvée");
  }

  if (application.candidate.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Vous ne pouvez supprimer que vos propres candidatures");
  }

  await application.deleteOne();
  res.json({ message: "Candidature supprimée" });
});

module.exports = {
  applyForJob,
  getMyApplications,
  getApplicationsForJob,
  updateApplicationStatus,
  deleteMyApplication,
};
