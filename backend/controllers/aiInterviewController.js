import AIInterview from "../models/AIInterview.js";


// ================= GET ALL =================
export const getAIInterviews = async (req, res) => {
  try {
    const interviews = await AIInterview.find().sort({
      createdAt: -1,
    });

    res.json(interviews);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error fetching interviews",
    });
  }
};


// ================= CREATE =================
export const createAIInterview = async (req, res) => {
  try {
    const interview = await AIInterview.create(
      req.body
    );

    res.json(interview);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Error creating interview",
    });
  }
};


// ================= GET SINGLE =================
export const getAIInterviewById = async (
  req,
  res
) => {
  try {
    const interview =
      await AIInterview.findById(
        req.params.id
      );

    if (!interview) {
      return res.status(404).json({
        message: "Interview not found",
      });
    }

    res.json(interview);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Interview not found",
    });
  }
};


// ================= UPDATE STATUS =================
export const updateInterviewStatus =
  async (req, res) => {
    try {
      const { status } = req.body;

      const interview =
        await AIInterview.findByIdAndUpdate(
          req.params.id,
          {
            status,
          },
          {
            new: true,
          }
        );

      if (!interview) {
        return res.status(404).json({
          message:
            "Interview not found",
        });
      }

      res.json(interview);
    } catch (err) {
      console.log(err);

      res.status(500).json({
        message:
          "Error updating status",
      });
    }
  };