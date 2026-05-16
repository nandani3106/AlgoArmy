import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

// Route Imports
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import contestRoutes from "./routes/contestRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import interviewAiRoutes from "./routes/interviewAiRoutes.js";
import oaRoutes from "./routes/oaRoutes.js";
import resultsRoutes from "./routes/resultsRoutes.js";

// Admin Route Imports
import problemRoutes from "./routes/problemRoutes.js";
import oaTestRoutes from "./routes/oaTestRoutes.js";
import aiInterviewRoutes from "./routes/aiInterviewRoutes.js";
import interviewResultRoutes from "./routes/interviewResultRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

// ES Module __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files statically (resumes, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Candidate APIs
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview-ai", interviewAiRoutes);
app.use("/api/oa", oaRoutes);
app.use("/api/results", resultsRoutes);

// Admin APIs
app.use("/api/problems", problemRoutes);
app.use("/api/oa-tests", oaTestRoutes);
app.use("/api/ai-interviews", aiInterviewRoutes);
app.use("/api/interview-results", interviewResultRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("AlgoArmy Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
