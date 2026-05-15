import mongoose from "mongoose";

const oaSubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  oaTest: { type: mongoose.Schema.Types.ObjectId, ref: "OATest", required: true },
  answers: [
    {
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: "OAQuestion" },
      answer: { type: String }, // For MCQ, it's the option text; for coding, it's the code
      language: { type: String }, // For coding questions
      isCorrect: { type: Boolean },
      pointsEarned: { type: Number, default: 0 },
      verdict: { type: String }, // For coding: Accepted, Wrong Answer, etc.
      executionTime: { type: String },
      memoryUsed: { type: String },
      passedTests: { type: Number },
      totalTests: { type: Number },
      complexityEstimate: { type: String },
      compilerOutput: { type: String },
      detailedResults: Array,
    },
  ],
  score: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  attemptedQuestions: { type: Number, default: 0 },
  unattemptedQuestions: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  incorrectAnswers: { type: Number, default: 0 },
  totalPossibleScore: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "completed"], default: "completed" },
  submittedAt: { type: Date, default: Date.now },
});

export default mongoose.model("OASubmission", oaSubmissionSchema);
