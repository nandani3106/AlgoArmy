import express from "express";

import {
  getProblems,
  createProblem,
  deleteProblem,
  fetchLeetCodeProblem,
} from "../controllers/problemController.js";

const router = express.Router();

router.get("/", getProblems);

router.post("/", createProblem);

router.delete(
  "/:id",
  deleteProblem
);

router.post(
  "/leetcode",
  fetchLeetCodeProblem
);

export default router;