import express from "express";
import {
  getAllOATests,
  getOATestById,
  getOAQuestions,
  submitOATest,
  getOAReport,
  runOACode,
  saveOAProgress,
} from "../controllers/oaController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllOATests);
router.get("/:id", getOATestById);
router.get("/:id/questions", getOAQuestions);
router.post("/:id/run", protect, runOACode);
router.post("/:id/save-progress", protect, saveOAProgress);
router.post("/:id/submit", protect, submitOATest);
router.get("/:id/report", protect, getOAReport);

export default router;
