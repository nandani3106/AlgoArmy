import mongoose from "mongoose";

const oaLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  oaTest: { type: mongoose.Schema.Types.ObjectId, ref: "OATest", required: true },
  // Setup verification log
  setupCheck: {
    permissions: {
      camera: { type: String },
      mic: { type: String },
      screen: { type: String },
      notifications: { type: String },
      clipboard: { type: String },
      fullscreen: { type: String },
      internet: { type: String },
      tabVisibility: { type: String },
      windowFocus: { type: String }
    },
    browser: { type: String },
    os: { type: String },
    timestamp: { type: Date, default: Date.now }
  },
  // Dynamic list of proctoring violations/events
  violations: [
    {
      eventType: { type: String, required: true }, // e.g. "Camera Disabled", "Fullscreen Exited", "Tab Switched", "Window Unfocused", etc.
      description: { type: String },
      severity: { type: String, enum: ["INFO", "WARNING", "CRITICAL"], default: "CRITICAL" },
      timestamp: { type: Date, default: Date.now }
    }
  ],
  violationCount: { type: Number, default: 0 },
  integrityScore: { type: Number, default: 100 }
}, { timestamps: true });

export default mongoose.model("OALog", oaLogSchema);
