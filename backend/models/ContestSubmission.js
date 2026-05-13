import mongoose from "mongoose";

const contestSubmissionSchema = new mongoose.Schema({
  contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: "ContestProblem", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  code: { type: String, required: [true, "Code is required"] },
  language: { type: String, required: [true, "Language is required"] },
  status: {
    type: String,
    enum: ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error"],
    default: "Accepted",
  },
  score: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
});

export default mongoose.model("ContestSubmission", contestSubmissionSchema);
