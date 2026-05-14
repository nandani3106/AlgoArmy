import mongoose from "mongoose";

const oaSubmissionSchema = new mongoose.Schema(
  {
    oaTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OATest",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "OAQuestion",
        },
        answer: String, // index for MCQ, code for coding
        isCorrect: Boolean,
        pointsEarned: {
          type: Number,
          default: 0,
        },
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["In Progress", "Submitted"],
      default: "Submitted",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const OASubmission = mongoose.model("OASubmission", oaSubmissionSchema);
export default OASubmission;
