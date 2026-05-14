import mongoose from "mongoose";

const oaTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a test title"],
    },
    company: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    durationMinutes: {
      type: Number,
      required: [true, "Please provide duration in minutes"],
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    instructions: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["upcoming", "live", "completed"],
      default: "upcoming",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const OATest = mongoose.model("OATest", oaTestSchema);
export default OATest;
