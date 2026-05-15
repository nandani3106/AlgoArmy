import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getAllContests,
  getContestById,
  registerForContest,
  getContestProblems,
  runContestCode,
  submitContestSolution,
  getContestResults,
  getContestLeaderboard,
  finishContest,
} from "../controllers/contestController.js";

const router = express.Router();

// Public routes
router.get("/", getAllContests);
router.get("/:id", getContestById);
router.get("/:id/problems", getContestProblems);
router.get("/:id/leaderboard", getContestLeaderboard);

// Protected routes
router.post("/:id/register", protect, registerForContest);
router.post("/:id/run", protect, runContestCode);
router.post("/:id/submit", protect, submitContestSolution);
router.post("/:id/finish", protect, finishContest);
router.get("/:id/results", protect, getContestResults);

export default router;
