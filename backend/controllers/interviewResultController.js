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

// UPDATE STATUS
export const updateInterviewStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const result = await InterviewResult.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!result) {
      return res.status(404).json({ message: "Interview result not found" });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Error updating status" });
  }
};