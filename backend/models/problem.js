import mongoose from "mongoose";

const testCaseSchema =
  new mongoose.Schema({
    input: String,
    output: String,
  });

const starterCodeSchema =
  new mongoose.Schema({
    cpp: String,
    java: String,
    python: String,
    javascript: String,
  });

const problemSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
      },

      difficulty: {
        type: String,
        enum: [
          "Easy",
          "Medium",
          "Hard",
        ],
        required: true,
      },

      tags: [
        {
          type: String,
        },
      ],

      description: {
        type: String,
        required: true,
      },

      constraints: {
        type: String,
      },

      exampleInput: {
        type: String,
      },

      exampleOutput: {
        type: String,
      },

      leetcodeLink: {
        type: String,
      },

      testCases: [
        testCaseSchema,
      ],

      starterCode:
        starterCodeSchema,
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "Problem",
  problemSchema
);