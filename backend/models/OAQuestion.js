import mongoose from "mongoose";

const oaQuestionSchema = new mongoose.Schema(
  {
    oaTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OATest",
      required: true,
    },
    type: {
      type: String,
      enum: ["mcq", "coding"],
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please provide a question title"],
    },
    statement: {
      type: String,
      default: "",
    },
    options: {
      type: [String],
      default: [],
    },
    correctAnswer: {
      type: String,
      default: "",
    },
    points: {
      type: Number,
      default: 10,
    },
    order: {
      type: Number,
      default: 1,
    },
    // Coding specific fields
    timeLimit: { type: Number, default: 2 },
    memoryLimit: { type: Number, default: 256 },
    sampleTestCases: [
      { input: String, output: String, isHidden: { type: Boolean, default: false } }
    ],
    hiddenTestCases: [
      { input: String, output: String, isHidden: { type: Boolean, default: true } }
    ],
  },
  {
    timestamps: true,
  }
);

const OAQuestion = mongoose.model("OAQuestion", oaQuestionSchema);
export default OAQuestion;
