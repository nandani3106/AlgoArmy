import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/problem.js';
import Contest from './models/Contest.js';
import ContestProblem from './models/ContestProblem.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB.");

    const contests = await Contest.find().populate('selectedProblems');
    console.log("CONTESTS:");
    contests.forEach(c => {
      console.log({
        id: c._id,
        title: c.title,
        status: c.status,
        startTime: c.startTime,
        endTime: c.endTime,
        durationMinutes: c.durationMinutes,
        problemsCount: c.selectedProblems?.length || 0,
      });
    });

    const problems = await Problem.find();
    console.log("\nALL PROBLEMS IN PROBLEM COLLECTION:");
    problems.forEach(p => {
      console.log({
        id: p._id,
        title: p.title,
        testCasesCount: p.testCases?.length || 0,
        hiddenTestCasesCount: p.hiddenTestCases?.length || 0,
      });
    });

    const contestProblems = await ContestProblem.find();
    console.log("\nCONTEST PROBLEMS:");
    contestProblems.forEach(p => {
      console.log({
        id: p._id,
        contestId: p.contest,
        title: p.title,
        sampleTestCases: p.sampleTestCases?.length || 0,
        hiddenTestCases: p.hiddenTestCases?.length || 0,
      });
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
