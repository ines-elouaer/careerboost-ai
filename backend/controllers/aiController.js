const asyncHandler = require("express-async-handler");
const { genAI, MODEL_CANDIDATES } = require("../config/gemini");

const generateBio = asyncHandler(async (req, res) => {
  const { fullName, title, location, skills, experienceYears, goals } = req.body;

  if (!fullName || !title || !skills) {
    res.status(400);
    throw new Error("fullName, title et skills sont requis");
  }

  const skillsText = Array.isArray(skills) ? skills.join(", ") : String(skills);

  const prompt = `
Tu es un expert en recrutement.
Écris une bio professionnelle courte (3 à 5 phrases) en français, à la première personne.
Le ton doit être clair, positif et crédible.

Nom: ${fullName}
Titre: ${title}
Localisation: ${location || "Non précisée"}
Années d'expérience: ${experienceYears ?? "Non précisé"}
Compétences: ${skillsText}
Objectif: ${goals || "Trouver une opportunité"}

Contraintes:
- Pas de texte inutile
- Pas de hashtags
- Pas de titres
- Une bio prête à coller sur LinkedIn
`;

  // ✅ fallback: teste plusieurs modèles
  let bio = null;
  let lastErr = null;

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      bio = result.response.text();
      break;
    } catch (err) {
      lastErr = err;
    }
  }

  if (!bio) {
  const msg = String(lastErr?.message || lastErr);

  // ✅ fallback si quota bloqué / rate limit
  if (msg.includes("429") || msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("rate")) {
    const fallbackBio =
      `Je suis ${fullName}, ${title} basé(e) à ${location || "ma région"}. ` +
      `Je développe mes compétences en ${skillsText}. ` +
      `Mon objectif est ${goals || "de trouver une opportunité"} et je suis motivé(e) à apprendre et contribuer dans une équipe.`;

    return res.json({
      success: true,
      data: { bio: fallbackBio },
      source: "fallback-local"
    });
  }

  res.status(500);
  throw new Error("Aucun modèle Gemini compatible. Dernière erreur: " + msg);
}


  res.json({ success: true, data: { bio } });
});

module.exports = { generateBio };
