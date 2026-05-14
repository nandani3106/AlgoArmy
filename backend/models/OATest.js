import mongoose from "mongoose";

const oaTestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    duration: { type: Number, required: true },

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
      camera: Boolean,
      mic: Boolean,
      eyeTracking: Boolean,
      tabSwitch: Boolean,
      copyPasteBlock: Boolean,
      fullScreen: Boolean,
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
      enum: ["Draft", "Published", "Live"],
      default: "Draft",
    },
  },
  { timestamps: true }
);

export default mongoose.model("OATest", oaTestSchema);