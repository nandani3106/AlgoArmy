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
    type: {
      type: String,
      enum: ["MCQ", "Coding", "Mixed"],
      default: "Mixed",
    },
    // 🔥 Coding Questions (from Problem collection)
    selectedCodingQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
      },
    ],
    // MCQs (multiple supported)
    mcqs: [
      {
        question: String,
        options: [String],
        correctOption: String,
        marks: Number,
      },
    ],
    // Proctoring settings
    proctoring: {
      camera: { type: Boolean, default: false },
      mic: { type: Boolean, default: false },
      eyeTracking: { type: Boolean, default: false },
      tabSwitch: { type: Boolean, default: false },
      copyPasteBlock: { type: Boolean, default: false },
      fullScreen: { type: Boolean, default: false },
    },
    result: {
      type: String,
      enum: ["Immediate", "Later"],
      default: "Later",
    },
    passingScore: {
      type: Number,
      default: 50,
    },
    negativeMarking: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["upcoming", "live", "completed", "Draft", "Published", "Live"],
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

export default mongoose.model("OATest", oaTestSchema);
