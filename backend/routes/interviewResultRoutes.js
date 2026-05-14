import express from "express";
import {
  getInterviewResults,
  createInterviewResult,
} from "../controllers/interviewResultController.js";

const router = express.Router();

router.get("/", getInterviewResults);
router.post("/", createInterviewResult);

export default router;