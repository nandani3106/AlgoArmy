import mongoose from "mongoose";
import dotenv from "dotenv";
import OATest from "../models/OATest.js";
import OAQuestion from "../models/OAQuestion.js";

dotenv.config();

const seedOA = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await OATest.deleteMany({});
    await OAQuestion.deleteMany({});

    const tests = await OATest.insertMany([
      {
        title: "Software Engineer Assessment",
        company: "Amazon",
        description: "Evaluate core computer science fundamentals.",
        durationMinutes: 60,
        difficulty: "Medium",
        status: "live",
        totalQuestions: 2,
      }
    ]);

    const liveTest = tests[0];
    const questions = [
      {
        oaTest: liveTest._id,
        type: "mcq",
        title: "REST API Methods",
        statement: "Which HTTP method is typically used to update an existing resource?",
        options: ["GET", "POST", "PUT", "DELETE"],
        correctAnswer: "PUT",
        points: 10,
        order: 1,
      },
      {
        oaTest: liveTest._id,
        type: "coding",
        title: "Sum of Two",
        statement: "Given two integers a and b, return their sum.",
        points: 50,
        order: 2,
        timeLimit: 1,
        memoryLimit: 128,
        sampleTestCases: [
          { input: "1 2", output: "3", isHidden: false }
        ],
        hiddenTestCases: [
          { input: "10 20", output: "30", isHidden: true },
          { input: "-1 -1", output: "-2", isHidden: true }
        ],
      },
    ];

    await OAQuestion.insertMany(questions);
    console.log("OA Seeding Completed.");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedOA();
