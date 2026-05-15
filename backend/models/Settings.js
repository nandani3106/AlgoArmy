import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ================= PROFILE =================
    name: String,
    email: String,
    profession: String,
    phone: String,
    company: String,
    bio: String,
    skills: String,

    // ================= PLATFORM INFO =================
    platformName: {
      type: String,
      default: "AlgoArmy",
    },

    tagline: {
      type: String,
      default: "Smarter Interviews, Better Hiring",
    },

    language: {
      type: String,
      default: "English",
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    dateFormat: {
      type: String,
      default: "DD MMM YYYY",
    },

    timeFormat: {
      type: String,
      default: "24 Hour",
    },

    // ================= SITE SETTINGS =================
    platformLive: {
      type: Boolean,
      default: true,
    },

    userRegistration: {
      type: Boolean,
      default: true,
    },

    emailVerification: {
      type: Boolean,
      default: true,
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    // ================= AI SETTINGS =================
    aiModel: {
      type: String,
      default: "GPT-4o",
    },

    evaluationStrictness: {
      type: String,
      default: "Medium",
    },

    plagiarismDetection: {
      type: Boolean,
      default: true,
    },

    aiFeedbackVisibility: {
      type: Boolean,
      default: true,
    },

    // ================= INTERVIEW SETTINGS =================
    defaultInterviewDuration: {
      type: Number,
      default: 30,
    },

    maxInterviewDuration: {
      type: Number,
      default: 120,
    },

    enableCodeEditor: {
      type: Boolean,
      default: true,
    },

    allowCopyPaste: {
      type: Boolean,
      default: false,
    },

    // ================= OLD SETTINGS =================
    notifications: {
      type: Boolean,
      default: true,
    },

    emailAlerts: {
      type: Boolean,
      default: true,
    },

    twoFactor: {
      type: Boolean,
      default: false,
    },

    theme: {
      type: String,
      default: "Light",
    },

    defaultContestDuration: {
      type: Number,
      default: 90,
    },

    defaultOADuration: {
      type: Number,
      default: 60,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);