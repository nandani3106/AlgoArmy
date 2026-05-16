import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    type: {
      type: String,
      enum: ["LOGIN", "VISIT", "LOGOUT", "SUBMISSION"],
      required: true,
    },

    path: {
      type: String,
      default: "",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

export default mongoose.model("Activity", activitySchema);