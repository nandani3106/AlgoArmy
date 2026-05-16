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
    const test = await OATest.create(req.body);
    res.json(test);
  } catch (err) {
    res.status(500).json({ message: "Error creating OA test" });
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