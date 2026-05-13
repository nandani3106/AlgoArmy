// Run: node seeds/contestSeed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Contest from "../models/Contest.js";
import ContestProblem from "../models/ContestProblem.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding...");

    // Clear existing data
    await Contest.deleteMany({});
    await ContestProblem.deleteMany({});
    console.log("Cleared existing contests & problems.");

    // Create contests
    const contests = await Contest.insertMany([
      {
        title: "Weekly Challenge #12",
        description:
          "Sharpen your DSA skills with this weekly coding challenge. Solve algorithmic problems under time pressure and compete with the best!",
        difficulty: "Medium",
        startTime: new Date("2026-05-20T10:00:00Z"),
        endTime: new Date("2026-05-20T12:00:00Z"),
        durationMinutes: 120,
        rules:
          "1. You may submit multiple times per problem.\n2. Only the highest score per problem counts.\n3. No external code tools allowed.",
        prizes: "1st: ₹5,000 | 2nd: ₹3,000 | 3rd: ₹1,000",
        status: "upcoming",
      },
      {
        title: "AlgoArmy Grand Contest",
        description:
          "The flagship AlgoArmy coding contest! Advanced problems in DP, graphs, and greedy algorithms. Top performers get interview referrals.",
        difficulty: "Hard",
        startTime: new Date("2026-06-01T09:00:00Z"),
        endTime: new Date("2026-06-01T12:00:00Z"),
        durationMinutes: 180,
        rules:
          "1. Three problems of increasing difficulty.\n2. Partial scoring enabled.\n3. Penalty for wrong submissions.",
        prizes:
          "1st: ₹15,000 + Interview Referral | 2nd: ₹8,000 | 3rd: ₹3,000",
        status: "upcoming",
      },
    ]);

    console.log(`Created ${contests.length} contests.`);

    // Create problems for Weekly Challenge #12
    const problems = await ContestProblem.insertMany([
      {
        contest: contests[0]._id,
        title: "Two Sum",
        statement:
          "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.",
        inputFormat: "First line: n (size of array)\nSecond line: n space-separated integers\nThird line: target integer",
        outputFormat: "Two space-separated indices (0-indexed)",
        constraints: "2 ≤ n ≤ 10^4\n-10^9 ≤ nums[i] ≤ 10^9",
        sampleInput: "4\n2 7 11 15\n9",
        sampleOutput: "0 1",
        explanation: "nums[0] + nums[1] = 2 + 7 = 9, so the answer is [0, 1].",
        difficulty: "Easy",
        points: 100,
        order: 1,
      },
      {
        contest: contests[0]._id,
        title: "Longest Substring Without Repeating Characters",
        statement:
          "Given a string s, find the length of the longest substring without repeating characters.",
        inputFormat: "A single string s",
        outputFormat: "A single integer — the length of the longest substring",
        constraints: "0 ≤ s.length ≤ 5 × 10^4\ns consists of English letters, digits, symbols and spaces.",
        sampleInput: "abcabcbb",
        sampleOutput: "3",
        explanation:
          'The answer is "abc", with the length of 3.',
        difficulty: "Medium",
        points: 200,
        order: 2,
      },
      {
        contest: contests[0]._id,
        title: "Merge Intervals",
        statement:
          "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
        inputFormat: "First line: n (number of intervals)\nNext n lines: two space-separated integers (start end)",
        outputFormat: "Merged intervals, each on a new line",
        constraints: "1 ≤ n ≤ 10^4\n0 ≤ start_i ≤ end_i ≤ 10^4",
        sampleInput: "4\n1 3\n2 6\n8 10\n15 18",
        sampleOutput: "1 6\n8 10\n15 18",
        explanation:
          "Intervals [1,3] and [2,6] overlap, so they are merged into [1,6].",
        difficulty: "Medium",
        points: 200,
        order: 3,
      },
    ]);

    console.log(`Created ${problems.length} problems.`);
    console.log("\nSeed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seed Error:", error.message);
    process.exit(1);
  }
};

seedData();
