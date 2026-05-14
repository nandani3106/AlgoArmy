import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  parseResumeAndGenerateQuestions,
  regenerateInterviewQuestions,
} from "../controllers/interviewAiController.js";

const router = express.Router();

// POST /api/interview-ai/generate — Parse resume + generate questions
router.post("/generate", protect, parseResumeAndGenerateQuestions);

// POST /api/interview-ai/regenerate — Regenerate questions from saved profile
router.post("/regenerate", protect, regenerateInterviewQuestions);

export default router;
