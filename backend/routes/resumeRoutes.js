import express from "express";
import protect from "../middleware/authMiddleware.js";
import uploadResume from "../middleware/uploadResume.js";
import {
  uploadResume as uploadResumeHandler,
  getResume,
  deleteResume,
} from "../controllers/resumeController.js";

const router = express.Router();

// POST /api/resume/upload — Upload a PDF resume
router.post(
  "/upload",
  protect,
  uploadResume.single("resume"),
  uploadResumeHandler
);

// GET /api/resume — Get current user's resume URL
router.get("/", protect, getResume);

// DELETE /api/resume — Delete current user's resume
router.delete("/", protect, deleteResume);

export default router;
