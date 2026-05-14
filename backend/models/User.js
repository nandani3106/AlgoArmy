import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false, // Don't return password by default in queries
  },
  role: {
    type: String,
    enum: ["candidate", "admin"],
    default: "candidate",
  },
  profileImage: {
    type: String,
    default: "",
  },
  bio: { type: String, default: "" },
  college: { type: String, default: "" },
  branch: { type: String, default: "" },
  graduationYear: { type: Number },
  skills: { type: [String], default: [] },
  github: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  leetcode: { type: String, default: "" },
  codeforces: { type: String, default: "" },
  resumeUrl: { type: String, default: "" },
  projects: { type: [String], default: [] },
  extractedResumeText: { type: String, default: "" },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);