import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  parseResumeAndGenerateQuestions,
  regenerateInterviewQuestions,
  submitInterview,
  detectInterviewDevices,
} from "../controllers/interviewAiController.js";

const router = express.Router();

// POST /api/interview-ai/generate — Parse resume + generate questions
router.post("/generate", protect, parseResumeAndGenerateQuestions);

// POST /api/interview-ai/regenerate — Regenerate questions from saved profile
router.post("/regenerate", protect, regenerateInterviewQuestions);

// POST /api/interview-ai/submit — Evaluate and save interview results
router.post("/submit", protect, submitInterview);

// POST /api/interview-ai/detect-devices — Detect devices in image frame
router.post("/detect-devices", protect, detectInterviewDevices);

export default router;
