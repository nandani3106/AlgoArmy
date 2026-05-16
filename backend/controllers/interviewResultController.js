import InterviewResult from "../models/InterviewResult.js";

// GET ALL RESULTS
export const getInterviewResults = async (req, res) => {
  try {
    const results = await InterviewResult.find().sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Error fetching results" });
  }
};

// CREATE RESULT (AI will later generate this)
export const createInterviewResult = async (req, res) => {
  try {
    const result = await InterviewResult.create(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Error creating result" });
  }
};