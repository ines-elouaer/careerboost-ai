// backend/server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Routes
const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const profileRoutes = require("./routes/profileRoutes");
const companyProfileRoutes = require("./routes/companyProfileRoutes");
const skillRoutes = require("./routes/skillRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// ✅ Debug (tu peux enlever après)
// console.log("PORT =", process.env.PORT);
console.log("GEMINI_API_KEY =", process.env.GEMINI_API_KEY);

// ✅ DB
connectDB();

// ✅ CORS (avant les routes)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Route test
app.get("/", (req, res) => {
  res.json({ message: "CareerBoost AI API is running" });
});

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/company-profiles", companyProfileRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);

// ✅ Errors (TOUJOURS à la fin)
app.use(notFound);
app.use(errorHandler);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
