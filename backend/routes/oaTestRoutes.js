import express from "express";
import {
  getOATests,
  createOATest,
  getOATestById,
} from "../controllers/oaTestController.js";

const router = express.Router();

router.get("/", getOATests);      // 👈 ALL OA TESTS (uploaded list)
router.post("/", createOATest);   // 👈 CREATE OA TEST
router.get("/:id", getOATestById);

export default router;