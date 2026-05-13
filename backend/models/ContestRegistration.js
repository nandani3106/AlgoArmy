import mongoose from "mongoose";

const contestRegistrationSchema = new mongoose.Schema({
  contest: { type: mongoose.Schema.Types.ObjectId, ref: "Contest", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  registeredAt: { type: Date, default: Date.now },
});

// Compound unique index — one registration per user per contest
contestRegistrationSchema.index({ contest: 1, user: 1 }, { unique: true });

export default mongoose.model("ContestRegistration", contestRegistrationSchema);
