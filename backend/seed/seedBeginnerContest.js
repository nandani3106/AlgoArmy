import mongoose from "mongoose";
import dotenv from "dotenv";
import Contest from "../models/Contest.js";
import ContestProblem from "../models/ContestProblem.js";

dotenv.config({ path: "./backend/.env" });

const seedBeginnerContest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const existingContest = await Contest.findOne({ title: "Beginner Coding Challenge 2026" });
    if (existingContest) {
      await ContestProblem.deleteMany({ contest: existingContest._id });
      await Contest.deleteOne({ _id: existingContest._id });
    }

    const contest = await Contest.create({
      title: "Beginner Coding Challenge 2026",
      description: "A beginner-friendly coding contest focused on arrays and basic mathematics.",
      difficulty: "Easy",
      startTime: new Date(),
      endTime: new Date(Date.now() + 90 * 60 * 1000),
      durationMinutes: 90,
      status: "live",
      rules: "1. No plagiarism.\n2. All test cases must pass for full credit.",
    });

    const problems = [
      {
        contest: contest._id,
        title: "Reverse an Array",
        statement: "Reverse the given array N of size M.",
        inputFormat: "M integers.",
        outputFormat: "M integers in reverse.",
        constraints: "M <= 10^5",
        difficulty: "Easy",
        points: 50,
        order: 1,
        timeLimit: 1,
        memoryLimit: 128,
        sampleTestCases: [
          { input: "5\n1 2 3 4 5", output: "5 4 3 2 1", isHidden: false }
        ],
        hiddenTestCases: [
          { input: "3\n10 20 30", output: "30 20 10", isHidden: true },
          { input: "1\n99", output: "99", isHidden: true }
        ],
        starterCode: {
          cpp: "#include <iostream>\nusing namespace std;\nint main() { return 0; }",
          python: "import sys\ndef solve(): pass",
          javascript: "const fs = require('fs');",
          java: "import java.util.*;\npublic class Main {}"
        }
      },
      {
        contest: contest._id,
        title: "Check Odd or Even",
        statement: "Print EVEN or ODD.",
        difficulty: "Easy",
        points: 50,
        order: 2,
        timeLimit: 1,
        memoryLimit: 64,
        sampleTestCases: [
          { input: "4", output: "EVEN", isHidden: false },
          { input: "7", output: "ODD", isHidden: false }
        ],
        hiddenTestCases: [
          { input: "0", output: "EVEN", isHidden: true },
          { input: "-5", output: "ODD", isHidden: true }
        ],
        starterCode: {
          cpp: "#include <iostream>\nusing namespace std;\nint main() { return 0; }",
          python: "import sys",
          javascript: "const fs = require('fs');",
          java: "import java.util.*;"
        }
      }
    ];

    await ContestProblem.insertMany(problems);
    console.log("Seeding completed.");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedBeginnerContest();
