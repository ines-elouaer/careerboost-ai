const asyncHandler = require("express-async-handler");
const Skill = require("../models/Skill");

// @desc    Créer une compétence
// @route   POST /api/skills
// @access  Private (recruteur ou admin)
const createSkill = asyncHandler(async (req, res) => {
  if (req.user.role !== "recruiter" && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Accès réservé aux recruteurs/admin");
  }

  const { name, level } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Le nom de la compétence est requis");
  }

  // éviter les doublons exacts
  const existing = await Skill.findOne({ name: name.trim(), level });
  if (existing) {
    res.status(400);
    throw new Error("Cette compétence existe déjà");
  }

  const skill = await Skill.create({ name: name.trim(), level });
  res.status(201).json(skill);
});

// @desc    Récupérer toutes les compétences
// @route   GET /api/skills
// @access  Public
const getSkills = asyncHandler(async (req, res) => {
  const skills = await Skill.find().sort({ name: 1 });
  res.json(skills);
});

// @desc    Récupérer une compétence par ID
// @route   GET /api/skills/:id
// @access  Public
const getSkillById = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  if (!skill) {
    res.status(404);
    throw new Error("Compétence non trouvée");
  }
  res.json(skill);
});

// @desc    Mettre à jour une compétence
// @route   PUT /api/skills/:id
// @access  Private (recruteur ou admin)
const updateSkill = asyncHandler(async (req, res) => {
  if (req.user.role !== "recruiter" && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Accès réservé aux recruteurs/admin");
  }

  const skill = await Skill.findById(req.params.id);
  if (!skill) {
    res.status(404);
    throw new Error("Compétence non trouvée");
  }

  skill.name = req.body.name ?? skill.name;
  skill.level = req.body.level ?? skill.level;

  const updated = await skill.save();
  res.json(updated);
});

// @desc    Supprimer une compétence
// @route   DELETE /api/skills/:id
// @access  Private (recruteur ou admin)
const deleteSkill = asyncHandler(async (req, res) => {
  if (req.user.role !== "recruiter" && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Accès réservé aux recruteurs/admin");
  }

  const skill = await Skill.findById(req.params.id);
  if (!skill) {
    res.status(404);
    throw new Error("Compétence non trouvée");
  }

  await skill.deleteOne();
  res.json({ message: "Compétence supprimée" });
});

module.exports = {
  createSkill,
  getSkills,
  getSkillById,
  updateSkill,
  deleteSkill,
};
