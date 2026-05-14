import mongoose from "mongoose";
import dotenv from "dotenv";
import Contest from "../models/Contest.js";
import ContestProblem from "../models/ContestProblem.js";

dotenv.config();

const contests = [
  {
    title: "Global Code Sprint 2026",
    description: "The ultimate competitive programming challenge of the year. Compete with thousands of developers globally.",
    startTime: new Date(Date.now() + 86400000), // tomorrow
    endTime: new Date(Date.now() + 86400000 * 1.5),
    durationMinutes: 120,
    status: "upcoming",
  },
  {
    title: "AlgoArmy Weekly Challenge #42",
    description: "Sharpen your data structures and algorithms skills with our weekly sprint.",
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000 * 3),
    durationMinutes: 180,
    status: "live",
  },
  {
    title: "Amazon Hiring Challenge",
    description: "Mock coding contest based on real hiring challenges.",
    startTime: new Date(),
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours later
    durationMinutes: 180,
    difficulty: "Hard",
    status: "live"
  }
];

const seedContests = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for Contest seeding...");

    // Delete existing
    await Contest.deleteMany({});
    await ContestProblem.deleteMany({});
    console.log("Deleted existing contests and problems.");

    // Create Contests
    const createdContests = await Contest.insertMany(contests);
    console.log(`Inserted ${createdContests.length} contests.`);

    // Create Problems for the live contest
    const liveContest = createdContests[1];
    const problems = [
      {
        contest: liveContest._id,
        title: "Two Sum",
        statement:
          "Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to the target.",
        description:
          "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        difficulty: "Easy",
        points: 10,
        constraints: "2 <= nums.length <= 10^4",
        order: 1,
      },
      {
        contest: liveContest._id,
        title: "Longest Substring Without Repeating Characters",
        statement:
          "Given a string s, find the length of the longest substring without repeating characters.",
        description:
          "Given a string s, find the length of the longest substring without repeating characters.",
        difficulty: "Medium",
        points: 30,
        constraints: "0 <= s.length <= 5 * 10^4",
        order: 2,
      },
      {
        contest: liveContest._id,
        title: "Median of Two Sorted Arrays",
        statement:
          "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
        description:
          "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
        difficulty: "Hard",
        points: 50,
        constraints: "nums1.length == m, nums2.length == n",
        order: 3,
      },
    ];


    await ContestProblem.insertMany(problems);
    console.log("Inserted 3 contest problems.");

    console.log("Contest Seeding Completed Successfully!");
    process.exit();
  } catch (err) {
    console.error("Contest Seeding Failed:", err.message);
    process.exit(1);
  }
};

seedContests();
