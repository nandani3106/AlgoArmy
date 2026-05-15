import mongoose from "mongoose";

const contestSubmissionSchema = new mongoose.Schema({
  contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: "ContestProblem", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  verdict: { 
    type: String, 
    enum: ["Accepted", "Wrong Answer", "Compilation Error", "Runtime Error", "Time Limit Exceeded", "Memory Limit Exceeded", "Pending"],
    default: "Pending" 
  },
  score: { type: Number, default: 0 },
  passedTestCases: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  executionTime: { type: String, default: "0 ms" },
  memoryUsed: { type: String, default: "0 MB" },
  compilerOutput: { type: String, default: "" },
  complexityEstimate: { type: String, default: "N/A" },
  failedTestCaseIndex: { type: Number, default: -1 },
  detailedResults: [
    {
      input: String,
      expected: String,
      actual: String,
      passed: Boolean,
      status: String,
      time: String,
      memory: String,
      isHidden: Boolean
    }
  ],
  submittedAt: { type: Date, default: Date.now },
});

export default mongoose.model("ContestSubmission", contestSubmissionSchema);
