import User from "../models/User.js";
import ContestSubmission from "../models/ContestSubmission.js";
import OASubmission from "../models/OASubmission.js";
import InterviewResult from "../models/InterviewResult.js";

// @desc    Get logged-in user's profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 1. Calculate solved problems
    // Contest Accepted Submissions
    const acceptedContestSubmissions = await ContestSubmission.find({ user: userId, verdict: "Accepted" });
    const uniqueContestProblems = new Set(acceptedContestSubmissions.map(s => s.problem.toString()));
    const contestProblemsSolved = uniqueContestProblems.size;

    // OA Correct Questions
    const oaSubmissions = await OASubmission.find({ user: userId, status: "completed" });
    let oaQuestionsSolved = 0;
    oaSubmissions.forEach(sub => {
      if (sub.answers && Array.isArray(sub.answers)) {
        sub.answers.forEach(ans => {
          if (ans.isCorrect) {
            oaQuestionsSolved++;
          }
        });
      }
    });

    const problemsSolved = contestProblemsSolved + oaQuestionsSolved;

    // 2. Calculate globalRank dynamically using aggregation
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
    const userIndex = leaderboard.findIndex(u => u._id.toString() === userId.toString());
    const globalRank = userIndex !== -1 ? userIndex + 1 : 1;

    // 3. Contest wins (mocked or counted)
    const contestWins = 0;

    // 4. Calculate accuracy
    const totalContestSubmissions = await ContestSubmission.countDocuments({ user: userId });
    let totalOaQuestions = 0;
    oaSubmissions.forEach(sub => {
      if (sub.answers && Array.isArray(sub.answers)) {
        totalOaQuestions += sub.answers.length;
      }
    });
    const totalSubmissions = totalContestSubmissions + totalOaQuestions;
    const correctSubmissions = acceptedContestSubmissions.length + oaQuestionsSolved;
    const accuracyVal = totalSubmissions > 0 ? Math.round((correctSubmissions / totalSubmissions) * 100) : 100;
    const accuracy = `${accuracyVal}%`;

    // 5. Streak calculation
    const allActivityDates = [];

    const contestDates = await ContestSubmission.find({ user: userId }).select("submittedAt");
    contestDates.forEach(d => {
      if (d.submittedAt) allActivityDates.push(new Date(d.submittedAt));
    });

    const oaDates = await OASubmission.find({ user: userId }).select("submittedAt");
    oaDates.forEach(d => {
      if (d.submittedAt) allActivityDates.push(new Date(d.submittedAt));
    });

    const interviewDates = await InterviewResult.find({ user: userId }).select("createdAt");
    interviewDates.forEach(d => {
      if (d.createdAt) allActivityDates.push(new Date(d.createdAt));
    });

    // Sort dates descending, filter unique dates
    const sortedDates = allActivityDates
      .map(d => d.toDateString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .map(d => new Date(d))
      .sort((a, b) => b - a);

    let streak = 0;
    if (sortedDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const firstActiveDate = new Date(sortedDates[0]);
      firstActiveDate.setHours(0, 0, 0, 0);

      if (firstActiveDate.getTime() === today.getTime() || firstActiveDate.getTime() === yesterday.getTime()) {
        streak = 1;
        let expectedTime = firstActiveDate.getTime();
        for (let i = 1; i < sortedDates.length; i++) {
          const nextDate = new Date(sortedDates[i]);
          nextDate.setHours(0, 0, 0, 0);
          expectedTime -= 24 * 60 * 60 * 1000;
          if (nextDate.getTime() === expectedTime) {
            streak++;
          } else {
            break;
          }
        }
      }
    }

    const stats = {
      problemsSolved,
      globalRank,
      contestWins,
      accuracy,
      streak
    };

    // 6. Combined recent activity feed
    const combinedActivity = [];

    const latestContestSubmissions = await ContestSubmission.find({ user: userId })
      .populate("contest", "title")
      .sort({ submittedAt: -1 })
      .limit(5);

    const latestOaSubmissions = await OASubmission.find({ user: userId })
      .populate("oaTest", "title")
      .sort({ submittedAt: -1 })
      .limit(5);

    const latestInterviews = await InterviewResult.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    latestContestSubmissions.forEach(sub => {
      combinedActivity.push({
        type: "Contest",
        title: sub.contest?.title || "Coding Contest",
        date: sub.submittedAt,
        result: sub.verdict || `${sub.score} pts`,
      });
    });

    latestOaSubmissions.forEach(sub => {
      combinedActivity.push({
        type: "OA",
        title: sub.oaTest?.title || "Online Assessment",
        date: sub.submittedAt,
        result: `${sub.percentage}%`,
      });
    });

    latestInterviews.forEach(res => {
      combinedActivity.push({
        type: "Interview",
        title: `${res.role || "AI"} Interview`,
        date: res.createdAt,
        result: `${res.overallScore}%`,
      });
    });

    combinedActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentActivity = combinedActivity.slice(0, 5);

    res.status(200).json({
      success: true,
      user,
      stats,
      recentActivity
    });
  } catch (error) {
    console.error("Get Profile Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      fullName,
      bio,
      college,
      branch,
      graduationYear,
      skills,
      github,
      linkedin,
      leetcode,
      codeforces,
      resumeUrl,
      profileImage,
    } = req.body;

    if (fullName !== undefined) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (college !== undefined) user.college = college;
    if (branch !== undefined) user.branch = branch;
    if (graduationYear !== undefined) user.graduationYear = graduationYear;
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (leetcode !== undefined) user.leetcode = leetcode;
    if (codeforces !== undefined) user.codeforces = codeforces;
    if (resumeUrl !== undefined) user.resumeUrl = resumeUrl;
    if (profileImage !== undefined) user.profileImage = profileImage;

    // Handle skills — accept comma-separated string or array
    if (skills !== undefined) {
      if (typeof skills === "string") {
        user.skills = skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      } else if (Array.isArray(skills)) {
        user.skills = skills.map((s) => s.trim()).filter((s) => s.length > 0);
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
