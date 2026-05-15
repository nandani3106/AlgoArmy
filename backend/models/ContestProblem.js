import mongoose from "mongoose";

const contestProblemSchema = new mongoose.Schema({
  contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
  title: { type: String, required: [true, "Problem title is required"], trim: true },
  statement: { type: String, required: [true, "Problem statement is required"] },
  inputFormat: { type: String, default: "" },
  outputFormat: { type: String, default: "" },
  constraints: { type: String, default: "" },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
  points: { type: Number, default: 100 },
  order: { type: Number, default: 1 },
  timeLimit: { type: Number, default: 2 }, // seconds
  memoryLimit: { type: Number, default: 256 }, // MB
  examples: [
    {
      input: String,
      output: String,
      explanation: String,
    }
  ],
  sampleTestCases: [
    {
      input: String,
      output: String,
      isHidden: { type: Boolean, default: false }
    }
  ],
  hiddenTestCases: [
    {
      input: String,
      output: String,
      isHidden: { type: Boolean, default: true }
    }
  ],
  starterCode: {
    cpp: String,
    java: String,
    python: String,
    javascript: String,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ContestProblem", contestProblemSchema);
