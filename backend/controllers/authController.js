import Activity from "../models/Activity.js";

export const loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    // after password validation success:
    await Activity.create({
      userId: user._id,
      type: "LOGIN",
    });

    user.lastLogin = new Date();
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};