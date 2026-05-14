import mongoose from "mongoose";

const interviewResultSchema = new mongoose.Schema(
  {
    name: String,
    role: String,

    status: {
      type: String,
      enum: ["Completed", "Flagged", "Rejected", "Shortlisted"],
      default: "Completed",
    },

    confidence: Number,
    communication: Number,
    technical: Number,
    problemSolving: Number,
    overall: Number,

    summary: String,
  },
  { timestamps: true }
);

export default mongoose.model("InterviewResult", interviewResultSchema);