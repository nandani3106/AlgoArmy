import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getOATests,
  createOATest,
  getOATestById,
  updateOATest,
  deleteOATest,
} from "../controllers/oaTestController.js";

const router = express.Router();

router.get("/", protect, getOATests);      // 👈 ALL OA TESTS (uploaded list)
router.post("/", protect, createOATest);   // 👈 CREATE OA TEST
router.put("/:id", protect, updateOATest);
router.delete("/:id", protect, deleteOATest);
router.get("/:id", getOATestById);

export default router;