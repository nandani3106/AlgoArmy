import OATest from "../models/OATest.js";

// GET ALL OA TESTS (IMPORTANT → shows uploaded tests)
export const getOATests = async (req, res) => {
  try {
    const tests = await OATest.find()
      .populate("selectedCodingQuestions")
      .sort({ createdAt: -1 });

    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching OA tests" });
  }
};

// CREATE OA TEST
export const createOATest = async (req, res) => {
  try {
    const testData = {
      ...req.body,
      createdBy: req.user._id,
    };
    const test = await OATest.create(testData);
    res.json(test);
  } catch (err) {
    console.error("Create OA Error:", err.message);
    res.status(500).json({ message: "Error creating OA test", error: err.message });
  }
};

// GET SINGLE OA TEST
export const getOATestById = async (req, res) => {
  try {
    const test = await OATest.findById(req.params.id).populate(
      "selectedCodingQuestions"
    );
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: "OA test not found" });
  }
};

// UPDATE OA TEST
export const updateOATest = async (req, res) => {
  try {
    const test = await OATest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: "Error updating OA test" });
  }
};

// DELETE OA TEST
export const deleteOATest = async (req, res) => {
  try {
    await OATest.findByIdAndDelete(req.params.id);
    res.json({ message: "OA Test deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting OA test" });
  }
};