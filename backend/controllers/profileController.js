import User from "../models/User.js";

// @desc    Get logged-in user's profile
// @route   GET /api/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      fullName,
      bio,
      college,
      branch,
      graduationYear,
      skills,
      github,
      linkedin,
      leetcode,
      codeforces,
      resumeUrl,
      profileImage,
    } = req.body;

    if (fullName !== undefined) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (college !== undefined) user.college = college;
    if (branch !== undefined) user.branch = branch;
    if (graduationYear !== undefined) user.graduationYear = graduationYear;
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (leetcode !== undefined) user.leetcode = leetcode;
    if (codeforces !== undefined) user.codeforces = codeforces;
    if (resumeUrl !== undefined) user.resumeUrl = resumeUrl;
    if (profileImage !== undefined) user.profileImage = profileImage;

    // Handle skills — accept comma-separated string or array
    if (skills !== undefined) {
      if (typeof skills === "string") {
        user.skills = skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      } else if (Array.isArray(skills)) {
        user.skills = skills.map((s) => s.trim()).filter((s) => s.length > 0);
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update Profile Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
