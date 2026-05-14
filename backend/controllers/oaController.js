import OATest from "../models/OATest.js";
import OAQuestion from "../models/OAQuestion.js";
import OASubmission from "../models/OASubmission.js";

/**
 * @desc    Get all OA tests
 * @route   GET /api/oa
 * @access  Public
 */
export const getAllOATests = async (req, res) => {
  try {
    const tests = await OATest.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tests.length, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get OA test by ID
 * @route   GET /api/oa/:id
 * @access  Public
 */
export const getOATestById = async (req, res) => {
  try {
    const test = await OATest.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }
    res.status(200).json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get questions for a specific OA test
 * @route   GET /api/oa/:id/questions
 * @access  Public
 */
export const getOAQuestions = async (req, res) => {
  try {
    const questions = await OAQuestion.find({ oaTest: req.params.id }).sort({ order: 1 });
    res.status(200).json({ success: true, count: questions.length, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Submit OA test
 * @route   POST /api/oa/:id/submit
 * @access  Private
 */
export const submitOATest = async (req, res) => {
  try {
    const { answers } = req.body; // Array of { questionId, answer }
    const testId = req.params.id;
    const userId = req.user._id;

    // Check if submission already exists
    let submission = await OASubmission.findOne({ oaTest: testId, user: userId });
    if (submission && submission.status === "Submitted") {
      return res.status(400).json({ success: false, message: "Test already submitted" });
    }

    const questions = await OAQuestion.find({ oaTest: testId });
    let totalScore = 0;
    const processedAnswers = [];

    for (const q of questions) {
      const userAnswer = answers.find((a) => a.questionId === q._id.toString());
      const isCorrect = userAnswer ? userAnswer.answer === q.correctAnswer : false;
      const pointsEarned = isCorrect ? q.points : 0;

      if (isCorrect) totalScore += pointsEarned;

      processedAnswers.push({
        question: q._id,
        answer: userAnswer ? userAnswer.answer : "",
        isCorrect,
        pointsEarned,
      });
    }

    submission = await OASubmission.create({
      oaTest: testId,
      user: userId,
      answers: processedAnswers,
      score: totalScore,
      status: "Submitted",
    });

    res.status(201).json({
      success: true,
      message: "Test submitted successfully",
      score: totalScore,
      data: submission,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get OA report for a user
 * @route   GET /api/oa/:id/report
 * @access  Private
 */
export const getOAReport = async (req, res) => {
  try {
    const submission = await OASubmission.findOne({
      oaTest: req.params.id,
      user: req.user._id,
    }).populate("oaTest");

    if (!submission) {
      return res.status(404).json({ success: false, message: "No submission found for this test" });
    }

    res.status(200).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
