import Contest from "../models/Contest.js";
import ContestProblem from "../models/ContestProblem.js";
import ContestSubmission from "../models/ContestSubmission.js";
import ContestRegistration from "../models/ContestRegistration.js";
import mongoose from "mongoose";

// @desc    Get all contests
// @route   GET /api/contests
// @access  Public
export const getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find().sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: contests.length,
      contests,
    });
  } catch (error) {
    console.error("Get All Contests Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get contest by ID
// @route   GET /api/contests/:id
// @access  Public
export const getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }

    res.status(200).json({ success: true, contest });
  } catch (error) {
    console.error("Get Contest Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Register for a contest
// @route   POST /api/contests/:id/register
// @access  Private
export const registerForContest = async (req, res) => {
  try {
    const contestId = req.params.id;
    const userId = req.user._id;

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ success: false, message: "Contest not found" });
    }

    // Check if already registered
    const existing = await ContestRegistration.findOne({
      contest: contestId,
      user: userId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this contest",
      });
    }

    // Create registration
    await ContestRegistration.create({ contest: contestId, user: userId });

    // Increment participants count
    contest.participantsCount += 1;
    await contest.save();

    res.status(201).json({
      success: true,
      message: "Successfully registered for the contest",
    });
  } catch (error) {
    console.error("Register Contest Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get problems for a contest
// @route   GET /api/contests/:id/problems
// @access  Public
export const getContestProblems = async (req, res) => {
  try {
    const problems = await ContestProblem.find({ contest: req.params.id }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: problems.length,
      problems,
    });
  } catch (error) {
    console.error("Get Contest Problems Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Submit a solution for a contest problem
// @route   POST /api/contests/:id/submit
// @access  Private
export const submitContestSolution = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    if (!problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: "problemId, code, and language are required",
      });
    }

    // Verify problem belongs to this contest
    const problem = await ContestProblem.findOne({
      _id: problemId,
      contest: req.params.id,
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: "Problem not found in this contest",
      });
    }

    // Create submission (auto-accept for now)
    const submission = await ContestSubmission.create({
      contest: req.params.id,
      problem: problemId,
      user: req.user._id,
      code,
      language,
      status: "Accepted",
      score: problem.points,
    });

    res.status(201).json({
      success: true,
      message: "Solution submitted successfully",
      submission,
    });
  } catch (error) {
    console.error("Submit Solution Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get logged-in user's results for a contest
// @route   GET /api/contests/:id/results
// @access  Private
export const getContestResults = async (req, res) => {
  try {
    const submissions = await ContestSubmission.find({
      contest: req.params.id,
      user: req.user._id,
    })
      .populate("problem", "title points order difficulty")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("Get Results Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get leaderboard for a contest
// @route   GET /api/contests/:id/leaderboard
// @access  Public
export const getContestLeaderboard = async (req, res) => {
  try {
    const contestId = new mongoose.Types.ObjectId(req.params.id);

    const leaderboard = await ContestSubmission.aggregate([
      { $match: { contest: contestId } },
      {
        $group: {
          _id: "$user",
          totalScore: { $sum: "$score" },
          totalSubmissions: { $sum: 1 },
          lastSubmission: { $max: "$submittedAt" },
        },
      },
      { $sort: { totalScore: -1, lastSubmission: 1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          fullName: "$userInfo.fullName",
          totalScore: 1,
          totalSubmissions: 1,
          lastSubmission: 1,
        },
      },
    ]);

    // Add rank
    const ranked = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    res.status(200).json({
      success: true,
      count: ranked.length,
      leaderboard: ranked,
    });
  } catch (error) {
    console.error("Leaderboard Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
