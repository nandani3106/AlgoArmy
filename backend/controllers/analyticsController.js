import User from "../models/User.js";
import Contest from "../models/Contest.js";
import Problem from "../models/Problem.js";
import OATest from "../models/OATest.js";
import AIInterview from "../models/AIInterview.js";
import Activity from "../models/Activity.js";

export const getAnalytics = async (req, res) => {
  try {
    // ================= USERS =================
    const totalUsers = await User.countDocuments();

    // ================= CONTENT =================
    const totalContests = await Contest.countDocuments();
    const totalProblems = await Problem.countDocuments();
    const totalOATests = await OATest.countDocuments();
    const totalAIInterviews = await AIInterview.countDocuments();

    // ================= ACTIVITY =================
    const totalLogins = await Activity.countDocuments({ type: "LOGIN" });
    const totalVisits = await Activity.countDocuments({ type: "VISIT" });

    // DAU (daily active users)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dauUsers = await Activity.distinct("userId", {
      createdAt: { $gte: today },
    });

    // Weekly growth
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const weeklyUsers = await User.countDocuments({
      createdAt: { $gte: last7Days },
    });

    const weeklyContests = await Contest.countDocuments({
      createdAt: { $gte: last7Days },
    });

    const weeklyProblems = await Problem.countDocuments({
      createdAt: { $gte: last7Days },
    });

    const weeklyOAs = await OATest.countDocuments({
      createdAt: { $gte: last7Days },
    });

    const weeklyAI = await AIInterview.countDocuments({
      createdAt: { $gte: last7Days },
    });

    // ================= RESPONSE =================
    res.json({
      users: {
        total: totalUsers,
        weekly: weeklyUsers,
      },

      contests: {
        total: totalContests,
        weekly: weeklyContests,
      },

      problems: {
        total: totalProblems,
        weekly: weeklyProblems,
      },

      oaTests: {
        total: totalOATests,
        weekly: weeklyOAs,
      },

      aiInterviews: {
        total: totalAIInterviews,
        weekly: weeklyAI,
      },

      activity: {
        logins: totalLogins,
        visits: totalVisits,
        dau: dauUsers.length,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Analytics failed" });
  }
};