import express from "express";
import {
  getCandidateDashboardResults,
  getAllContestResults,
  getAllOAResults,
  getAllInterviewResults,
  getOverallLeaderboard,
  getUserPerformanceTrend,
  getInterviewResultDetails,
} from "../controllers/resultsController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, getCandidateDashboardResults);
router.get("/contests", protect, getAllContestResults);
router.get("/oa", protect, getAllOAResults);
router.get("/interviews", protect, getAllInterviewResults);
router.get("/interview/:id", protect, getInterviewResultDetails);
router.get("/leaderboard", getOverallLeaderboard);
router.get("/performance-trend", protect, getUserPerformanceTrend);

export default router;
