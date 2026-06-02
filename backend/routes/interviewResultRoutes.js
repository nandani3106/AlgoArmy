import express from "express";
import {
  getInterviewResults,
  createInterviewResult,
  updateInterviewStatus,
} from "../controllers/interviewResultController.js";

const router = express.Router();

router.get("/", getInterviewResults);
router.post("/", createInterviewResult);
router.put("/:id/status", updateInterviewStatus);

export default router;