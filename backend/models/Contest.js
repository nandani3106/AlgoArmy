import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, "Title is required"], 
      trim: true 
    },
    description: { 
      type: String, 
      required: [true, "Description is required"] 
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard", "Extreme"],
      default: "Medium",
    },
    type: {
      type: String,
      enum: ["Public", "Private", "Invite Only"],
      default: "Public",
    },
    startTime: { 
      type: Date, 
      required: [true, "Start time is required"] 
    },
    endTime: { 
      type: Date, 
      required: [true, "End time is required"] 
    },
    durationMinutes: { 
      type: Number, 
      required: [true, "Duration is required"] 
    },
    bannerImage: { 
      type: String, 
      default: "" 
    },
    rules: { 
      type: String, 
      default: "" 
    },
    prizes: { 
      type: String, 
      default: "" 
    },
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
      enum: ["upcoming", "live", "completed", "Draft", "Published", "Live"],
      default: "upcoming",
    },
    participantsCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Contest", contestSchema);
