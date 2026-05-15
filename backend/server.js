import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import contestRoutes from "./routes/contestRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import oaTestRoutes from "./routes/oaTestRoutes.js";
import aiInterviewRoutes from "./routes/aiInterviewRoutes.js";
import interviewResultRoutes from "./routes/interviewResultRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/users", userRoutes);

app.use("/api/contests", contestRoutes);

  app.use(
    "/api/problems",
    problemRoutes
  );

  app.use("/api/oa-tests", oaTestRoutes);

  app.use("/api/ai-interviews", aiInterviewRoutes);

  app.use("/api/interview-results", interviewResultRoutes);

  app.use("/api/analytics", analyticsRoutes);

  app.use("/api/settings", settingsRoutes);

  app.use(
    "/api/dashboard",
    dashboardRoutes
  );

app.get("/", (req, res) => {
  res.send("AlgoArmy Backend Running");
});

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
