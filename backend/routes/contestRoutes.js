import express from "express";
import {
  getContests,
  getContestById,
  createContest,
  updateContest,
  deleteContest,
} from "../controllers/contestController.js";

const router = express.Router();

router.get("/", getContests);
router.get("/:id", getContestById);
router.post("/", createContest);
router.put("/:id", updateContest);
router.delete("/:id", deleteContest);

export default router;