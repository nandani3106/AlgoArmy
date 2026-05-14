import mongoose from "mongoose";
import dotenv from "dotenv";
import OATest from "../models/OATest.js";
import OAQuestion from "../models/OAQuestion.js";

dotenv.config();

const tests = [
  {
    title: "Software Engineer Assessment",
    company: "Amazon",
    description: "Evaluate core computer science fundamentals and problem-solving skills.",
    durationMinutes: 60,
    difficulty: "Medium",
    instructions: "Please ensure your webcam is on. Tab switching is monitored.",
    status: "live",
    totalQuestions: 5,
  },
  {
    title: "Full Stack Developer Challenge",
    company: "Google",
    description: "Assessment covering React, Node.js, and System Design concepts.",
    durationMinutes: 90,
    difficulty: "Hard",
    instructions: "Answer all questions. Coding questions require passing all test cases.",
    status: "upcoming",
    totalQuestions: 0,
  },
];

const seedOA = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for OA seeding...");

    // Delete existing
    await OATest.deleteMany({});
    await OAQuestion.deleteMany({});
    console.log("Deleted existing OA tests and questions.");

    // Create Tests
    const createdTests = await OATest.insertMany(tests);
    console.log(`Inserted ${createdTests.length} OA tests.`);

    // Create Questions for the live test
    const liveTest = createdTests[0];
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
        type: "mcq",
        title: "JavaScript Scopes",
        statement: "What is the scope of a variable declared with 'let'?",
        options: ["Global Scope", "Function Scope", "Block Scope", "Module Scope"],
        correctAnswer: "Block Scope",
        points: 10,
        order: 2,
      },
      {
        oaTest: liveTest._id,
        type: "mcq",
        title: "React State Management",
        statement: "Which hook is most suitable for sharing data across many components without passing props?",
        options: ["useState", "useEffect", "useContext", "useMemo"],
        correctAnswer: "useContext",
        points: 10,
        order: 3,
      },
      {
        oaTest: liveTest._id,
        type: "mcq",
        title: "Database Indexing",
        statement: "What is the primary trade-off when adding an index to a database column?",
        options: [
          "Faster reads, slower writes",
          "Slower reads, faster writes",
          "Increased storage, faster writes",
          "Decreased storage, slower reads"
        ],
        correctAnswer: "Faster reads, slower writes",
        points: 10,
        order: 4,
      },
      {
        oaTest: liveTest._id,
        type: "coding",
        title: "Reverse a String",
        statement: "Write a function that reverses a string in-place.",
        points: 50,
        order: 5,
      },
    ];

    await OAQuestion.insertMany(questions);
    console.log("Inserted 5 OA questions.");

    console.log("OA Seeding Completed Successfully!");
    process.exit();
  } catch (err) {
    console.error("OA Seeding Failed:", err.message);
    process.exit(1);
  }
};

seedOA();
