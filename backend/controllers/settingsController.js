import Settings from "../models/Settings.js";


// GET SETTINGS
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create({});
    }

    res.json(settings);
  } catch (err) {
    console.log("SETTINGS ERROR:", err);
    res.status(500).json({
      message: "Failed to get settings",
    });
  }
};


// UPDATE SETTINGS
export const updateSettings = async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate(
      {},
      {
        $set: req.body,
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.json(settings);
  } catch (err) {
    console.log("UPDATE ERROR:", err);

    res.status(500).json({
      message: "Failed to update settings",
    });
  }
};