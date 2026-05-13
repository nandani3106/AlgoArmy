import mongoose from "mongoose";

const contestSchema = new mongoose.Schema({
  title: { type: String, required: [true, "Title is required"], trim: true },
  description: { type: String, required: [true, "Description is required"] },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard", "Extreme"],
    default: "Medium",
  },
  startTime: { type: Date, required: [true, "Start time is required"] },
  endTime: { type: Date, required: [true, "End time is required"] },
  durationMinutes: { type: Number, required: [true, "Duration is required"] },
  bannerImage: { type: String, default: "" },
  rules: { type: String, default: "" },
  prizes: { type: String, default: "" },
  status: {
    type: String,
    enum: ["upcoming", "live", "completed"],
    default: "upcoming",
  },
  participantsCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Contest", contestSchema);
