import Contest from "../models/Contest.js";

// GET all contests
export const getContests = async (req, res) => {
  try {
    const contests = await Contest.find().populate("selectedProblems");
    res.json(contests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching contests" });
  }
};

// GET single contest
export const getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate("selectedProblems");
    res.json(contest);
  } catch (err) {
    res.status(500).json({ message: "Contest not found" });
  }
};

// CREATE contest
export const createContest = async (req, res) => {
  try {
    const contest = await Contest.create(req.body);
    res.json(contest);
  } catch (err) {
    res.status(500).json({ message: "Error creating contest" });
  }
};

// UPDATE contest
export const updateContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(contest);
  } catch (err) {
    res.status(500).json({ message: "Error updating contest" });
  }
};

// DELETE contest
export const deleteContest = async (req, res) => {
  try {
    await Contest.findByIdAndDelete(req.params.id);
    res.json({ message: "Contest deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting contest" });
  }
};