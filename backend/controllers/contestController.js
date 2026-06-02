import Contest from "../models/Contest.js";
import ContestProblem from "../models/ContestProblem.js";
import ContestSubmission from "../models/ContestSubmission.js";
import ContestRegistration from "../models/ContestRegistration.js";
import Problem from "../models/problem.js";
import mongoose from "mongoose";
import { evaluateCode } from "../services/judgeService.js";

// Helper to sync selectedProblems on Contest document into ContestProblem collection
const syncContestProblems = async (contestId) => {
  try {
    const contest = await Contest.findById(contestId).populate("selectedProblems");
    if (!contest) return;

    const existingCPs = await ContestProblem.find({ contest: contestId });

    // Remove ContestProblems that are no longer in selectedProblems list
    const contestProblemsToRemove = existingCPs.filter(cp => {
      const originalProblem = (contest.selectedProblems || []).find(p => p.title === cp.title);
      return !originalProblem;
    });

    for (const cp of contestProblemsToRemove) {
      await ContestProblem.findByIdAndDelete(cp._id);
    }

    // Refresh and update all selected problems (upsert to ensure self-healing and complete data synchrony)
    let syncCount = 0;
    for (let i = 0; i < (contest.selectedProblems || []).length; i++) {
      const p = contest.selectedProblems[i];
      const cpData = {
        contest: contestId,
        title: p.title,
        statement: p.statement || p.description || "",
        inputFormat: p.inputFormat || "",
        outputFormat: p.outputFormat || "",
        constraints: p.constraints || "",
        difficulty: p.difficulty || "Medium",
        points: p.points || 100,
        order: i + 1,
        timeLimit: 2,
        memoryLimit: 256,
        examples: p.examples || [],
        sampleTestCases: p.testCases || [],
        hiddenTestCases: p.hiddenTestCases || [],
        starterCode: {
          cpp: p.starterCode?.cpp || "",
          java: p.starterCode?.java || "",
          python: p.starterCode?.python || "",
          javascript: p.starterCode?.javascript || p.starterCode?.js || "",
        }
      };

      await ContestProblem.findOneAndUpdate(
        { contest: contestId, title: p.title },
        cpData,
        { upsert: true, new: true }
      );
      syncCount++;
    }

    if (syncCount > 0) {
      console.log(`Synced & updated ${syncCount} problems for contest: ${contest.title}`);
    }
  } catch (error) {
    console.error("Error syncing contest problems:", error);
  }
};

// @desc    Get all contests (Unified)
// @route   GET /api/contests
// @access  Public
export const getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find().populate("selectedProblems").sort({ startTime: 1 });
    res.status(200).json({ success: true, data: contests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Compatibility for admin branch
export const getContests = getAllContests;

// @desc    Get contest by ID
// @route   GET /api/contests/:id
// @access  Public
export const getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id).populate("selectedProblems");
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
    if (existing) return res.status(200).json({ success: true, message: "Already registered" });

    await ContestRegistration.create({ contest: contestId, user: userId });
    contest.participantsCount += 1;
    await contest.save();

    res.status(201).json({ success: true, message: "Successfully registered" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get user's contest session details
// @route   GET /api/contests/:id/session
// @access  Private
export const getContestSession = async (req, res) => {
  try {
    const registration = await ContestRegistration.findOne({ contest: req.params.id, user: req.user._id });
    if (!registration) return res.status(404).json({ success: false, message: "Registration not found" });
    res.status(200).json({ success: true, registration });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get problems for a contest
// @route   GET /api/contests/:id/problems
// @access  Public
export const getContestProblems = async (req, res) => {
  try {
    // Proactively sync chosen problems
    await syncContestProblems(req.params.id);

    const problems = await ContestProblem.find({ contest: req.params.id }).sort({ order: 1 });
    const contest = await Contest.findById(req.params.id).select("startTime durationMinutes title");
    res.status(200).json({ success: true, count: problems.length, problems, contest });
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
    if (!registration) return res.status(403).json({ success: false, message: "Not registered" });

    if (registration.status === "completed") {
      return res.status(400).json({ success: false, message: "Contest already finished. No more submissions allowed." });
    }

    const contest = await Contest.findById(req.params.id);
    if (contest && contest.durationMinutes) {
      const startTime = new Date(registration.registeredAt).getTime();
      const endTime = startTime + (contest.durationMinutes * 60 * 1000);
      if (Date.now() > endTime) {
        registration.status = "completed";
        registration.finishedAt = new Date();
        await registration.save();
        return res.status(400).json({ success: false, message: "Contest time has expired. Submissions closed." });
      }
    }

    // Combine sample and hidden test cases
    const allTestCases = [
      ...problem.sampleTestCases.map(tc => ({ ...tc.toObject(), isHidden: false })),
      ...problem.hiddenTestCases.map(tc => ({ ...tc.toObject(), isHidden: true }))
    ];

    const evaluation = await evaluateCode(code, language, allTestCases, problem.timeLimit, problem.memoryLimit);

    // Rule: Points only for 100% pass, and only count once per distinct problem
    let finalScore = 0;
    if (evaluation.verdict === "Accepted") {
      const alreadyPassed = await ContestSubmission.exists({
        contest: req.params.id,
        problem: problemId,
        user: req.user._id,
        verdict: "Accepted"
      });
      finalScore = alreadyPassed ? 0 : problem.points;
    }

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
      // Group by user and problem first, to get the max score achieved on that problem
      {
        $group: {
          _id: { user: "$user", problem: "$problem" },
          maxProblemScore: { $max: "$score" },
          lastProblemSubmission: { $max: "$submittedAt" }
        }
      },
      // Group by user, summing the max scores across all problems
      {
        $group: {
          _id: "$_id.user",
          totalScore: { $sum: "$maxProblemScore" },
          lastSubmission: { $max: "$lastProblemSubmission" }
        }
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

    // Calculate total score for this user in this contest by taking the max score per distinct problem
    const submissions = await ContestSubmission.find({ contest: contestId, user: userId });
    const problemScores = {};
    submissions.forEach(s => {
      if (s.problem) {
        const pId = s.problem.toString();
        problemScores[pId] = Math.max(problemScores[pId] || 0, s.score);
      }
    });
    const totalScore = Object.values(problemScores).reduce((sum, val) => sum + val, 0);

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

// @desc    Get results for a contest
// @route   GET /api/contests/:id/results
// @access  Private
export const getContestResults = async (req, res) => {
  try {
    const contestId = req.params.id;
    const totalProblems = await ContestProblem.countDocuments({ contest: contestId });

    const submissions = await ContestSubmission.find({ contest: contestId, user: req.user._id })
      .populate("problem", "title points order")
      .populate("contest", "title")
      .sort({ submittedAt: -1 });

    console.log("getContestResults called. req.params.id:", req.params.id);
    console.log("Submissions count for user in this contest:", submissions.length);

    const attemptedProblemIds = new Set();
    const correctProblemIds = new Set();

    submissions.forEach(sub => {
      if (sub.problem) {
        const pId = sub.problem._id.toString();
        attemptedProblemIds.add(pId);
        if (sub.verdict === "Accepted") {
          correctProblemIds.add(pId);
        }
      }
    });

    res.status(200).json({
      success: true,
      submissions,
      stats: {
        totalQuestions: totalProblems,
        attemptedQuestions: attemptedProblemIds.size,
        correctQuestions: correctProblemIds.size
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Results error" });
  }
};

// Admin Functions
// @desc    Create contest
// @route   POST /api/contests
// @access  Private/Admin
export const createContest = async (req, res) => {
  try {
    const contest = await Contest.create({
      ...req.body,
      createdBy: req.user._id,
    });
    if (contest) {
      await syncContestProblems(contest._id);
    }
    res.status(201).json({ success: true, data: contest });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating contest" });
  }
};

// @desc    Update contest
// @route   PUT /api/contests/:id
// @access  Private/Admin
export const updateContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (contest) {
      await syncContestProblems(contest._id);
    }
    res.json({ success: true, data: contest });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating contest" });
  }
};

// @desc    Delete contest
// @route   DELETE /api/contests/:id
// @access  Private/Admin
export const deleteContest = async (req, res) => {
  try {
    await Contest.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Contest deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting contest" });
  }
};
