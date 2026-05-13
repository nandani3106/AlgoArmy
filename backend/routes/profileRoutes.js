import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/profile (protected)
router.get("/", protect, getProfile);

// PUT /api/profile (protected)
router.put("/", protect, updateProfile);

export default router;
