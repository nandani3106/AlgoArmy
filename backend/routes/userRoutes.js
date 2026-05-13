import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const users =
    await User.find();

  res.json(users);
});

router.post("/", async (req, res) => {
  const newUser =
    await User.create(req.body);

  res.json(newUser);
});

export default router;