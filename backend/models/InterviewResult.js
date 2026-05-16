import mongoose from "mongoose";

const interviewResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: String,
    role: String,
    questions: {
      type: Array,
      default: [],
    },
    answers: {
      type: Array,
      default: [],
    },
    technicalScore: {
      type: Number,
      default: 0,
    },
    communicationScore: {
      type: Number,
      default: 0,
    },
    overallScore: {
      type: Number,
      default: 0,
    },
    // Admin/Detailed Scores
    confidence: Number,
    communication: Number,
    technical: Number,
    problemSolving: Number,
    overall: Number,
    
    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Completed", "Flagged", "Rejected", "Shortlisted"],
      default: "Completed",
    },
    summary: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("InterviewResult", interviewResultSchema);
