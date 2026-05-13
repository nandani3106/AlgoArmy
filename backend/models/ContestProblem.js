import mongoose from "mongoose";

const contestProblemSchema = new mongoose.Schema({
  contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
  title: { type: String, required: [true, "Problem title is required"], trim: true },
  statement: { type: String, required: [true, "Problem statement is required"] },
  inputFormat: { type: String, default: "" },
  outputFormat: { type: String, default: "" },
  constraints: { type: String, default: "" },
  sampleInput: { type: String, default: "" },
  sampleOutput: { type: String, default: "" },
  explanation: { type: String, default: "" },
  difficulty: { type: String, default: "Medium" },
  points: { type: Number, default: 100 },
  order: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ContestProblem", contestProblemSchema);
