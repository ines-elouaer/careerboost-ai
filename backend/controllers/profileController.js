const asyncHandler = require("express-async-handler");
const Profile = require("../models/Profile");

// ✅ Normaliser skills (strings) : trim + unique + max 30
const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) return [];

  const cleaned = skills
    .map((s) => String(s || "").trim())
    .filter(Boolean)
    .slice(0, 30);

  // unique case-insensitive
  const seen = new Set();
  return cleaned.filter((s) => {
    const key = s.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// @desc    Créer un profil pour l'utilisateur connecté
// @route   POST /api/profiles
// @access  Private
const createMyProfile = asyncHandler(async (req, res) => {
  const existing = await Profile.findOne({ user: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error("Le profil existe déjà. Utilisez PUT pour le mettre à jour.");
  }

  const {
    fullName,
    headline,
    bio,
    location,
    yearsOfExperience,
    skills,
    goals, // ✅ AJOUT
    linkedinUrl,
    portfolioUrl,
    avatar,
  } = req.body;

  if (!fullName) {
    res.status(400);
    throw new Error("fullName est requis");
  }

  const profile = await Profile.create({
    user: req.user._id,
    fullName,
    headline,
    bio,
    location,
    yearsOfExperience: Number(yearsOfExperience || 0),
    skills: normalizeSkills(skills), // ✅ strings libres
    goals: goals || "", // ✅ AJOUT
    linkedinUrl,
    portfolioUrl,
    avatar,
  });

  const populated = await profile.populate("user", "username email role");
  res.status(201).json(populated);
});

// @desc    Récupérer le profil de l'utilisateur connecté
// @route   GET /api/profiles/me
// @access  Private
const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id }).populate(
    "user",
    "username email role"
  );

  if (!profile) {
    res.status(404);
    throw new Error("Profil non trouvé");
  }

  res.json(profile);
});

// @desc    Mettre à jour le profil de l'utilisateur connecté
// @route   PUT /api/profiles/me
// @access  Private
const updateMyProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id });

  if (!profile) {
    res.status(404);
    throw new Error("Profil non trouvé");
  }

  const fieldsToUpdate = {
    fullName: req.body.fullName ?? profile.fullName,
    headline: req.body.headline ?? profile.headline,
    bio: req.body.bio ?? profile.bio,
    location: req.body.location ?? profile.location,

    yearsOfExperience:
      req.body.yearsOfExperience !== undefined
        ? Number(req.body.yearsOfExperience)
        : profile.yearsOfExperience,

    // ✅ skills libres
    skills:
      req.body.skills !== undefined
        ? normalizeSkills(req.body.skills)
        : profile.skills,

    // ✅ goals (IMPORTANT)
    goals: req.body.goals ?? profile.goals,

    linkedinUrl: req.body.linkedinUrl ?? profile.linkedinUrl,
    portfolioUrl: req.body.portfolioUrl ?? profile.portfolioUrl,
    avatar: req.body.avatar ?? profile.avatar,
  };

  const updated = await Profile.findOneAndUpdate(
    { user: req.user._id },
    fieldsToUpdate,
    { new: true, runValidators: true }
  ).populate("user", "username email role");

  res.json(updated);
});

// @desc    Supprimer le profil de l'utilisateur connecté
// @route   DELETE /api/profiles/me
// @access  Private
const deleteMyProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id });

  if (!profile) {
    res.status(404);
    throw new Error("Profil non trouvé");
  }

  await profile.deleteOne();
  res.json({ message: "Profil supprimé" });
});

// @desc    Voir le profil d'un utilisateur (pour recruteurs)
// @route   GET /api/profiles/user/:userId
// @access  Private (recruteur ou admin)
const getProfileByUserId = asyncHandler(async (req, res) => {
  if (req.user.role !== "recruiter" && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Accès réservé aux recruteurs/admin");
  }

  const profile = await Profile.findOne({ user: req.params.userId }).populate(
    "user",
    "username email role"
  );

  if (!profile) {
    res.status(404);
    throw new Error("Profil non trouvé");
  }

  res.json(profile);
});

module.exports = {
  createMyProfile,
  getMyProfile,
  updateMyProfile,
  deleteMyProfile,
  getProfileByUserId,
};
