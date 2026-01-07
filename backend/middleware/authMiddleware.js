const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Pas de token, accès refusé");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ IMPORTANT: decoded.id (pas decoded.userId)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("Utilisateur introuvable");
    }

    next();
  } catch (err) {
    res.status(401);
    throw new Error("Token invalide ou expiré");
  }
});

module.exports = { protect };
