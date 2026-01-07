const asyncHandler = require("express-async-handler");

// normaliser string -> mot clé
const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");

const toSet = (arr) => new Set((arr || []).map(norm).filter(Boolean));

// Score Jaccard = intersection / union
const jaccard = (A, B) => {
  const union = new Set([...A, ...B]);
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const score = union.size === 0 ? 0 : inter / union.size;
  return score;
};

const matchProfileToJob = asyncHandler(async (req, res) => {
  const { profileSkills, jobSkills } = req.body;

  if (!Array.isArray(profileSkills) || !Array.isArray(jobSkills)) {
    res.status(400);
    throw new Error("profileSkills et jobSkills doivent être des tableaux");
  }

  const P = toSet(profileSkills);
  const J = toSet(jobSkills);

  const score = jaccard(P, J); // 0..1
  const matchPercent = Math.round(score * 100);

  const matchedSkills = [...P].filter((s) => J.has(s));
  const missingSkills = [...J].filter((s) => !P.has(s));

  // recommandations = top 5 skills manquantes
  const recommendedSkills = missingSkills.slice(0, 5);

  res.json({
    success: true,
    data: {
      matchPercent,
      matchedSkills,
      missingSkills,
      recommendedSkills,
    },
  });
});

module.exports = { matchProfileToJob };
