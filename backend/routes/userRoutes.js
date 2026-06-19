import express from "express";
import User from "../models/User.js";
import protect from "../middleware/authMiddleware.js";
import ContestSubmission from "../models/ContestSubmission.js";
import OASubmission from "../models/OASubmission.js";
import InterviewResult from "../models/InterviewResult.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching users",
    });
  }
});

// GET /api/users/leaderboard
router.get("/leaderboard", protect, async (req, res) => {
  try {
    const leaderboard = await User.aggregate([
      {
        $lookup: {
          from: "contestsubmissions",
          localField: "_id",
          foreignField: "user",
          as: "contests"
        }
      },
      {
        $lookup: {
          from: "oasubmissions",
          localField: "_id",
          foreignField: "user",
          as: "oa"
        }
      },
      {
        $lookup: {
          from: "interviewresults",
          localField: "_id",
          foreignField: "user",
          as: "interviews"
        }
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          email: 1,
          role: 1,
          contestScore: { $sum: "$contests.score" },
          oaScore: { $sum: "$oa.score" },
          interviewScore: { $sum: "$interviews.overallScore" },
        }
      },
      {
        $addFields: {
          totalScore: { $add: ["$contestScore", "$oaScore", "$interviewScore"] }
        }
      },
      { $sort: { totalScore: -1 } }
    ]);

    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ success: false, message: "Error fetching leaderboard" });
  }
});

// GET /api/users/:id/activity
router.get("/:id/activity", protect, async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Contest submissions
    const contestSubmissions = await ContestSubmission.find({ user: userId })
      .populate("contest", "title")
      .populate("problem", "title difficulty");

    // 2. OA submissions
    const oaSubmissions = await OASubmission.find({ user: userId })
      .populate({
        path: "oaTest",
        select: "title type mcqs selectedCodingQuestions proctoring passingScore",
        populate: {
          path: "selectedCodingQuestions",
          select: "title difficulty"
        }
      });

    // 3. AI interviews
    const interviews = await InterviewResult.find({ user: userId });

    res.json({
      success: true,
      contests: contestSubmissions,
      oaTests: oaSubmissions,
      interviews: interviews
    });
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res.status(500).json({ success: false, message: "Error fetching user activity" });
  }
});

export default router;