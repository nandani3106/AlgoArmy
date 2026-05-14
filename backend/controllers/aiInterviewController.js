import AIInterview from "../models/AIInterview.js";

// GET ALL INTERVIEWS
export const getAIInterviews = async (req, res) => {
  try {
    const interviews = await AIInterview.find().sort({ createdAt: -1 });
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: "Error fetching interviews" });
  }
};

// CREATE INTERVIEW
export const createAIInterview = async (req, res) => {
  try {
    const interview = await AIInterview.create(req.body);
    res.json(interview);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating interview" });
  }
};

// GET SINGLE INTERVIEW
export const getAIInterviewById = async (req, res) => {
  try {
    const interview = await AIInterview.findById(req.params.id);
    res.json(interview);
  } catch (err) {
    res.status(500).json({ message: "Interview not found" });
  }
};