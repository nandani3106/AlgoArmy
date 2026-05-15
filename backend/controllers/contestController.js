import Contest from "../models/Contest.js";
import ContestProblem from "../models/ContestProblem.js";
import ContestSubmission from "../models/ContestSubmission.js";
import ContestRegistration from "../models/ContestRegistration.js";
import mongoose from "mongoose";
import { evaluateCode } from "../services/judgeService.js";

// @desc    Get all contests
// @route   GET /api/contests
// @access  Public
export const getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find().sort({ startTime: 1 });
    res.status(200).json({ success: true, count: contests.length, contests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get contest by ID
// @route   GET /api/contests/:id
// @access  Public
export const getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ success: false, message: "Contest not found" });
    res.status(200).json({ success: true, contest });
  } catch (error) {
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
    if (!contest) return res.status(404).json({ success: false, message: "Contest not found" });

    const existing = await ContestRegistration.findOne({ contest: contestId, user: userId });
    if (existing) return res.status(400).json({ success: false, message: "Already registered" });

    await ContestRegistration.create({ contest: contestId, user: userId });
    contest.participantsCount += 1;
    await contest.save();

    res.status(201).json({ success: true, message: "Successfully registered" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get problems for a contest
// @route   GET /api/contests/:id/problems
// @access  Public
export const getContestProblems = async (req, res) => {
  try {
    const problems = await ContestProblem.find({ contest: req.params.id }).sort({ order: 1 });
    res.status(200).json({ success: true, count: problems.length, problems });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Run Code for a contest problem (Custom Input / Sample Only)
// @route   POST /api/contests/:id/run
// @access  Private
export const runContestCode = async (req, res) => {
  try {
    const { problemId, code, language, customInput } = req.body;
    
    if (!problemId || !code || !language) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const problem = await ContestProblem.findById(problemId);
    if (!problem) return res.status(404).json({ success: false, message: "Problem not found" });

    let testCases = [];
    if (customInput) {
      testCases = [{ input: customInput, output: "", isHidden: false }];
    } else {
      testCases = problem.sampleTestCases.map(tc => ({ ...tc.toObject(), isHidden: false }));
    }

    const evaluation = await evaluateCode(code, language, testCases, problem.timeLimit, problem.memoryLimit);

    res.status(200).json({
      success: true,
      ...evaluation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Execution error" });
  }
};

// @desc    Submit a solution for a contest problem
// @route   POST /api/contests/:id/submit
// @access  Private
export const submitContestSolution = async (req, res) => {
  try {
    const { problemId, code, language } = req.body;

    if (!problemId || !code || !language) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const problem = await ContestProblem.findOne({ _id: problemId, contest: req.params.id });
    if (!problem) return res.status(404).json({ success: false, message: "Problem not found" });

    // Check if contest is already finished for this user
    const registration = await ContestRegistration.findOne({ contest: req.params.id, user: req.user._id });
    if (registration && registration.status === "completed") {
      return res.status(400).json({ success: false, message: "Contest already finished. No more submissions allowed." });
    }

    // Combine sample and hidden test cases
    const allTestCases = [
      ...problem.sampleTestCases.map(tc => ({ ...tc.toObject(), isHidden: false })),
      ...problem.hiddenTestCases.map(tc => ({ ...tc.toObject(), isHidden: true }))
    ];

    const evaluation = await evaluateCode(code, language, allTestCases, problem.timeLimit, problem.memoryLimit);
    
    // Rule: Points only for 100% pass
    const finalScore = evaluation.verdict === "Accepted" ? problem.points : 0;

    const submission = await ContestSubmission.create({
      contest: req.params.id,
      problem: problemId,
      user: req.user._id,
      code,
      language,
      verdict: evaluation.verdict,
      score: finalScore,
      passedTestCases: evaluation.passedTestCases,
      totalTestCases: evaluation.totalTestCases,
      executionTime: evaluation.executionTime,
      memoryUsed: evaluation.memoryUsed,
      compilerOutput: evaluation.compilerOutput,
      complexityEstimate: evaluation.complexityEstimate,
      failedTestCaseIndex: evaluation.failedTestCaseIndex,
      detailedResults: evaluation.detailedResults,
    });

    res.status(201).json({
      success: true,
      message: "Submission evaluated",
      submission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Submission error" });
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
          lastSubmission: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: "Leaderboard error" });
  }
};

// @desc    Finish a contest
// @route   POST /api/contests/:id/finish
// @access  Private
export const finishContest = async (req, res) => {
  try {
    const contestId = req.params.id;
    const userId = req.user._id;

    // Calculate total score for this user in this contest
    const submissions = await ContestSubmission.find({ contest: contestId, user: userId });
    const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);

    const registration = await ContestRegistration.findOneAndUpdate(
      { contest: contestId, user: userId },
      { 
        status: "completed", 
        score: totalScore,
        finishedAt: new Date() 
      },
      { new: true }
    );

    if (!registration) return res.status(404).json({ success: false, message: "Registration not found" });

    res.status(200).json({ success: true, message: "Contest finished", totalScore });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getContestResults = async (req, res) => {
  try {
    const submissions = await ContestSubmission.find({ contest: req.params.id, user: req.user._id })
      .populate("problem", "title points order")
      .sort({ submittedAt: -1 });
    res.status(200).json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Results error" });
  }
};
