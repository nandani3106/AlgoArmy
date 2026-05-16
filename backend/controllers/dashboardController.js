import User from "../models/User.js";
import Problem from "../models/Problem.js";
import Contest from "../models/Contest.js";
import OATest from "../models/OATest.js";
import AIInterview from "../models/AIInterview.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      users,
      problems,
      contests,
      oaTests,
      aiInterviews,
    ] = await Promise.all([
      User.countDocuments(),
      Problem.countDocuments(),
      Contest.countDocuments(),
      OATest.countDocuments(),
      AIInterview.countDocuments(),
    ]);

    // latest contest
    const latestContest = await Contest.findOne()
      .sort({ createdAt: -1 });

    // latest OA test
    const latestOA = await OATest.findOne()
      .sort({ createdAt: -1 });

    // latest interview
    const latestInterview =
      await AIInterview.findOne()
        .sort({ createdAt: -1 });

    res.json({
      users,
      problems,
      contests,
      oaTests,
      aiInterviews,

      recentActivity: [
        latestContest
          ? `Contest "${latestContest.title}" created`
          : null,

        latestOA
          ? `OA Test "${latestOA.title}" uploaded`
          : null,

        latestInterview
          ? `AI Interview completed`
          : null,
      ].filter(Boolean),
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Dashboard fetch failed",
    });
  }
};