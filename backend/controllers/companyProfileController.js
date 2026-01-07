const asyncHandler = require("express-async-handler");
const CompanyProfile = require("../models/CompanyProfile");
const mongoose = require("mongoose");

// helper: nettoyer albumImages (max 3, strings non vides)
const sanitizeAlbum = (album) => {
  if (!Array.isArray(album)) return [];
  return album
    .filter((x) => typeof x === "string" && x.trim().length > 0)
    .slice(0, 3);
};

// ✅ GET /api/company-profiles/me
const getMyCompanyProfile = asyncHandler(async (req, res) => {
  if (req.user.role !== "recruiter" && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Accès réservé aux recruteurs");
  }

  const profile = await CompanyProfile.findOne({ user: req.user._id });
  if (!profile) {
    res.status(404);
    throw new Error("Profil société introuvable");
  }

  res.json(profile);
});

// ✅ GET /api/company-profiles/user/:userId (PUBLIC)
const getCompanyProfileByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    res.status(400);
    throw new Error("Identifiant entreprise invalide");
  }

  const profile = await CompanyProfile.findOne({ user: userId });
  if (!profile) {
    res.status(404);
    throw new Error("Entreprise introuvable");
  }

  res.json(profile);
});

// ✅ POST /api/company-profiles
const createCompanyProfile = asyncHandler(async (req, res) => {
  if (req.user.role !== "recruiter" && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Accès réservé aux recruteurs");
  }

  const exists = await CompanyProfile.findOne({ user: req.user._id });
  if (exists) {
    res.status(400);
    throw new Error("Profil société déjà existant");
  }

  const albumImages = sanitizeAlbum(req.body.albumImages);

  const profile = await CompanyProfile.create({
    user: req.user._id,
    companyName: req.body.companyName,
    industry: req.body.industry || "",
    description: req.body.description || "",
    location: req.body.location || "",
    websiteUrl: req.body.websiteUrl || "",
    linkedinUrl: req.body.linkedinUrl || "",
    size: req.body.size || "1-10",
    logo: req.body.logo || "",
    coverImage: req.body.coverImage || "",
    albumImages, // ✅ IMPORTANT
  });

  res.status(201).json(profile);
});

// ✅ PUT /api/company-profiles/me
const updateMyCompanyProfile = asyncHandler(async (req, res) => {
  const profile = await CompanyProfile.findOne({ user: req.user._id });

  if (!profile) {
    res.status(404);
    throw new Error("Profil société introuvable");
  }

  // ✅ whitelist (plus sûr que Object.assign sur tout req.body)
  const up = req.body || {};

  if (typeof up.companyName === "string") profile.companyName = up.companyName;
  if (typeof up.industry === "string") profile.industry = up.industry;
  if (typeof up.description === "string") profile.description = up.description;
  if (typeof up.location === "string") profile.location = up.location;
  if (typeof up.websiteUrl === "string") profile.websiteUrl = up.websiteUrl;
  if (typeof up.linkedinUrl === "string") profile.linkedinUrl = up.linkedinUrl;

  if (typeof up.size === "string") profile.size = up.size;

  if (typeof up.logo === "string") profile.logo = up.logo;
  if (typeof up.coverImage === "string") profile.coverImage = up.coverImage;

  // ✅ album
  if (up.albumImages !== undefined) {
    profile.albumImages = sanitizeAlbum(up.albumImages);
  }

  const updated = await profile.save();
  res.json(updated);
});

module.exports = {
  getMyCompanyProfile,
  getCompanyProfileByUserId,
  createCompanyProfile,
  updateMyCompanyProfile,
};
