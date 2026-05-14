import mongoose from "mongoose";
import dotenv from "dotenv";
import OATest from "../models/OATest.js";
import OAQuestion from "../models/OAQuestion.js";

dotenv.config();

const seedOA = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for OA Seeding...");

    // Clear existing
    await OATest.deleteMany({});
    await OAQuestion.deleteMany({});
    console.log("Cleared existing OA data.");

    // Create a Sample OA Test
    const test = await OATest.create({
      title: "Frontend Engineering Assessment",
      company: "TechNova Solutions",
      description: "A comprehensive test to evaluate your JavaScript, React, and CSS skills. This assessment is designed to test both theoretical knowledge and practical implementation.",
      durationMinutes: 45,
      difficulty: "Medium",
      instructions: "1. Ensure a stable internet connection.\n2. Once started, the timer cannot be paused.\n3. Each MCQ carries 10 points.\n4. Read each question carefully before answering.",
      status: "live",
      totalQuestions: 5,
    });

    // Create Sample Questions
    const questions = [
      {
        oaTest: test._id,
        type: "mcq",
        title: "React Virtual DOM",
        statement: "What is the primary purpose of the Virtual DOM in React?",
        options: [
          "To directly manipulate the browser's DOM for better speed.",
          "To create a lightweight copy of the real DOM for efficient updates.",
          "To provide a backup of the DOM in case of server failure.",
          "To handle server-side rendering exclusively."
        ],
        correctAnswer: "To create a lightweight copy of the real DOM for efficient updates.",
        points: 10,
        order: 1
      },
      {
        oaTest: test._id,
        type: "mcq",
        title: "JavaScript Closures",
        statement: "Which of the following best describes a closure in JavaScript?",
        options: [
          "A function that is called immediately after its definition.",
          "A way to close the browser tab using JavaScript.",
          "A function that remembers and accesses its lexical scope even when executed outside that scope.",
          "A strictly typed variable that cannot be changed."
        ],
        correctAnswer: "A function that remembers and accesses its lexical scope even when executed outside that scope.",
        points: 10,
        order: 2
      },
      {
        oaTest: test._id,
        type: "mcq",
        title: "CSS Box Model",
        statement: "In the standard CSS box model, what is included in the 'total width' calculation of an element?",
        options: [
          "Only Content width.",
          "Content width + Padding.",
          "Content width + Padding + Border.",
          "Content width + Padding + Border + Margin."
        ],
        correctAnswer: "Content width + Padding + Border + Margin.",
        points: 10,
        order: 3
      },
      {
        oaTest: test._id,
        type: "mcq",
        title: "React Hooks",
        statement: "Which hook is used to handle side effects in a functional component?",
        options: [
          "useState",
          "useContext",
          "useEffect",
          "useReducer"
        ],
        correctAnswer: "useEffect",
        points: 10,
        order: 4
      },
      {
        oaTest: test._id,
        type: "mcq",
        title: "Higher Order Functions",
        statement: "Which of these is NOT a higher-order function in JavaScript?",
        options: [
          "map()",
          "filter()",
          "reduce()",
          "Math.random()"
        ],
        correctAnswer: "Math.random()",
        points: 10,
        order: 5
      }
    ];

    await OAQuestion.insertMany(questions);
    console.log("OA Seed Data Created Successfully!");

    process.exit();
  } catch (error) {
    console.error("OA Seeding Error:", error.message);
    process.exit(1);
  }
};

seedOA();
