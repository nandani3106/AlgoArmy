import mongoose from "mongoose";

const testCaseSchema = new mongoose.Schema({
  input: String,
  output: String,
  expectedOutput: String,
  isHidden: { type: Boolean, default: false }
});

const starterCodeSchema = new mongoose.Schema({
  cpp: String,
  java: String,
  python: String,
  javascript: String,
});

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },

    tags: [
      {
        type: String,
      },
    ],

    description: {
      type: String,
    },

    statement: {
      type: String,
    },

    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      }
    ],

    constraints: [
      {
        type: String,
      }
    ],

    inputFormat: {
      type: String,
    },

    outputFormat: {
      type: String,
    },

    sampleInput: {
      type: String,
    },

    sampleOutput: {
      type: String,
    },

    hiddenTestCases: {
      type: Array,
      default: [],
    },

    leetcodeUrl: {
      type: String,
    },

    leetcodeLink: {
      type: String,
    },

    testCases: [
      testCaseSchema
    ],

    starterCode: {
      type: starterCodeSchema,
      default: () => ({})
    },

    points: {
      type: Number,
      default: 100,
    },

    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },

    order: {
      type: Number,
      default: 1,
    }
  },
  { timestamps: true }
);

export default mongoose.models.Problem || mongoose.model("Problem", problemSchema);