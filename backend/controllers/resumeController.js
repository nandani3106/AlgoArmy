import User from "../models/User.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @desc    Upload resume for the logged-in user
 * @route   POST /api/resume/upload
 * @access  Private
 */
export const uploadResume = async (req, res) => {
  try {
    // Multer attaches the file to req.file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please attach a PDF resume.",
      });
    }

    // Build the public URL for the uploaded file
    const resumeUrl = `/uploads/resumes/${req.file.filename}`;

    // Persist the URL on the user document
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resumeUrl },
      { returnDocument: "after" }
    );

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      resumeUrl,
      user,
    });
  } catch (error) {
    console.error("Upload Resume Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while uploading resume",
    });
  }
};

/**
 * @desc    Get resume URL for the logged-in user
 * @route   GET /api/resume
 * @access  Private
 */
export const getResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("resumeUrl");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      resumeUrl: user.resumeUrl || "",
    });
  } catch (error) {
    console.error("Get Resume Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching resume",
    });
  }
};

/**
 * @desc    Delete resume for the logged-in user
 * @route   DELETE /api/resume
 * @access  Private
 */
export const deleteResume = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Optionally delete the physical file from disk
    if (user.resumeUrl) {
      const filePath = path.join(__dirname, "..", user.resumeUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Clear the resumeUrl field
    user.resumeUrl = "";
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    console.error("Delete Resume Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting resume",
    });
  }
};
