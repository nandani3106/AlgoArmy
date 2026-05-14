import Activity from "../models/Activity.js";

export const trackActivity = (type) => {
  return async (req, res, next) => {
    try {
      await Activity.create({
        userId: req.user?._id || null,
        type,
        path: req.originalUrl,
      });
    } catch (err) {
      console.log("Activity error:", err.message);
    }

    next();
  };
};