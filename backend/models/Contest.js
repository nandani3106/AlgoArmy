import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    type: {
      type: String,
      enum: ["Public", "Private", "Invite Only"],
      default: "Public",
    },

    startDate: Date,
    endDate: Date,
    duration: Number,

    selectedProblems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
      },
    ],

    liveLeaderboard: { type: Boolean, default: true },
    freezeLeaderboard: { type: Boolean, default: false },
    maxSubmissions: { type: Number, default: 10 },
    wrongPenalty: { type: Boolean, default: false },
    partialScoring: { type: Boolean, default: true },

    status: {
      type: String,
      enum: ["Draft", "Published", "Live"],
      default: "Draft",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Contest", contestSchema);