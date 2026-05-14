import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    name: String,
    email: String,
    profession: String,
    phone: String,
    company: String,
    bio: String,
    skills: String,

    notifications: { type: Boolean, default: true },
    emailAlerts: { type: Boolean, default: true },
    twoFactor: { type: Boolean, default: false },

    theme: { type: String, default: "Light" },

    defaultContestDuration: { type: Number, default: 90 },
    defaultOADuration: { type: Number, default: 60 },
    defaultInterviewDuration: { type: Number, default: 30 },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);