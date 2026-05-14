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
  },
  {
    timestamps: true,
  }
);

const OAQuestion = mongoose.model("OAQuestion", oaQuestionSchema);
export default OAQuestion;
