import express from "express";
import {
  getAIInterviews,
  createAIInterview,
  getAIInterviewById,
} from "../controllers/aiInterviewController.js";

const router = express.Router();

router.get("/", getAIInterviews);
router.post("/", createAIInterview);
router.get("/:id", getAIInterviewById);

export default router;