import express from "express";

import {
  getAIInterviews,
  createAIInterview,
  getAIInterviewById,
  updateInterviewStatus,
} from "../controllers/aiInterviewController.js";

const router = express.Router();

router.get("/", getAIInterviews);

router.post("/", createAIInterview);

router.get("/:id", getAIInterviewById);

router.put(
  "/:id/status",
  updateInterviewStatus
);

export default router;