import ContestSubmission from "../models/ContestSubmission.js";
import OASubmission from "../models/OASubmission.js";
import InterviewResult from "../models/InterviewResult.js";
import Contest from "../models/Contest.js";
import OATest from "../models/OATest.js";
import User from "../models/User.js";

/**
 * @desc    Get dashboard summary and recent results
 * @route   GET /api/results/dashboard
 * @access  Private
 */
export const getCandidateDashboardResults = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all relevant data for the user
    const [contestSubmissions, oaSubmissions, interviewResults] = await Promise.all([
      ContestSubmission.find({ user: userId }).populate("contest", "title"),
      OASubmission.find({ user: userId }).populate("oaTest", "title company"),
      InterviewResult.find({ user: userId }).sort({ createdAt: -1 }),
    ]);

    // Aggregate Contest Data
    const contestsParticipated = new Set(contestSubmissions.map(s => s.contest?._id?.toString())).size;
    const totalContestScore = contestSubmissions.reduce((acc, curr) => acc + (curr.score || 0), 0);
    // Mocking "contests won" as contests where user scored > 80% (just for logic)
    const contestsWon = 0; 

    // Aggregate OA Data
    const oaTestsTaken = oaSubmissions.length;
    const totalOAScore = oaSubmissions.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const averageOAScore = oaTestsTaken > 0 ? Math.round(totalOAScore / oaTestsTaken) : 0;

    // Aggregate Interview Data
    const interviewsTaken = interviewResults.length;
    const totalInterviewScore = interviewResults.reduce((acc, curr) => acc + (curr.overallScore || 0), 0);
    const averageInterviewScore = interviewsTaken > 0 ? Math.round(totalInterviewScore / interviewsTaken) : 0;

    // Calculate Overall Performance (Weighted)
    const overallPerformanceScore = Math.round((averageOAScore * 0.4) + (averageInterviewScore * 0.6));

    res.status(200).json({
      success: true,
      summary: {
        contestsParticipated,
        contestsWon,
        totalContestScore,
        oaTestsTaken,
        averageOAScore,
        interviewsTaken,
        averageInterviewScore,
        overallPerformanceScore,
      },
      recentResults: {
        contests: contestSubmissions.slice(-5).reverse(),
        oa: oaSubmissions.slice(-5).reverse(),
        interviews: interviewResults.slice(0, 5),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all contest results for user
 * @route   GET /api/results/contests
 * @access  Private
 */
export const getAllContestResults = async (req, res) => {
  try {
    const submissions = await ContestSubmission.find({ user: req.user._id })
      .populate("contest", "title")
      .sort({ submittedAt: -1 });

    const formatted = submissions.map(s => ({
      contestTitle: s.contest?.title || "Unknown Contest",
      score: s.score,
      status: s.status,
      submittedAt: s.submittedAt,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all OA results for user
 * @route   GET /api/results/oa
 * @access  Private
 */
export const getAllOAResults = async (req, res) => {
  try {
    const submissions = await OASubmission.find({ user: req.user._id })
      .populate("oaTest", "title company")
      .sort({ submittedAt: -1 });

    const formatted = submissions.map(s => ({
      testTitle: s.oaTest?.title || "Unknown Test",
      company: s.oaTest?.company || "N/A",
      score: s.score,
      submittedAt: s.submittedAt,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all interview results for user
 * @route   GET /api/results/interviews
 * @access  Private
 */
export const getAllInterviewResults = async (req, res) => {
  try {
    const results = await InterviewResult.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get global leaderboard
 * @route   GET /api/results/leaderboard
 * @access  Public
 */
export const getOverallLeaderboard = async (req, res) => {
  try {
    // We'll use MongoDB aggregation to combine scores per user
    const leaderboard = await User.aggregate([
      // Match all users
      { $match: {} },
      // Lookup Contest Submissions
      {
        $lookup: {
          from: "contestsubmissions",
          localField: "_id",
          foreignField: "user",
          as: "contests"
        }
      },
      // Lookup OA Submissions
      {
        $lookup: {
          from: "oasubmissions",
          localField: "_id",
          foreignField: "user",
          as: "oa"
        }
      },
      // Lookup Interview Results
      {
        $lookup: {
          from: "interviewresults",
          localField: "_id",
          foreignField: "user",
          as: "interviews"
        }
      },
      // Project the sums
      {
        $project: {
          fullName: 1,
          contestScore: { $sum: "$contests.score" },
          oaScore: { $sum: "$oa.score" },
          interviewScore: { $sum: "$interviews.overallScore" },
        }
      },
      // Calculate total
      {
        $addFields: {
          totalScore: { $add: ["$contestScore", "$oaScore", "$interviewScore"] }
        }
      },
      // Sort and limit
      { $sort: { totalScore: -1 } },
      { $limit: 100 }
    ]);

    const ranked = leaderboard.map((user, index) => ({
      rank: index + 1,
      ...user
    }));

    res.status(200).json({ success: true, data: ranked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get user performance trend for charts
 * @route   GET /api/results/performance-trend
 * @access  Private
 */
export const getUserPerformanceTrend = async (req, res) => {
  try {
    const userId = req.user._id;

    const [contests, oa, interviews] = await Promise.all([
      ContestSubmission.find({ user: userId }).sort({ submittedAt: 1 }).select("score submittedAt"),
      OASubmission.find({ user: userId }).sort({ submittedAt: 1 }).select("score submittedAt"),
      InterviewResult.find({ user: userId }).sort({ createdAt: 1 }).select("overallScore createdAt"),
    ]);

    res.status(200).json({
      success: true,
      data: {
        contests: contests.map(c => ({ score: c.score, date: c.submittedAt })),
        oa: oa.map(o => ({ score: o.score, date: o.submittedAt })),
        interviews: interviews.map(i => ({ score: i.overallScore, date: i.createdAt })),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
