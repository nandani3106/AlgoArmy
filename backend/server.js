import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import contestRoutes from "./routes/contestRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import interviewAiRoutes from "./routes/interviewAiRoutes.js";

// ES Module __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files statically (resumes, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview-ai", interviewAiRoutes);

app.get("/", (req, res) => {
  res.send(
    "AlgoArmy Backend Running"
  );
});

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});