import mongoose from "mongoose";

const aiInterviewSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    role: {
      type: String,
      default: "Software Engineer",
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    techStack: [String],

    // AI generated / manual questions
    questions: [
      {
        question: String,
        expectedAnswer: String,
        type: {
          type: String,
          enum: ["Technical", "Behavioral", "DSA"],
        },
      },
    ],

    duration: Number,

    status: {
      type: String,
      enum: ["Draft", "Scheduled", "Completed"],
      default: "Draft",
    },

    createdBy: {
      type: String, // later replace with userId
    },
  },
  { timestamps: true }
);

export default mongoose.model("AIInterview", aiInterviewSchema);