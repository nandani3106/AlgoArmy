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
    const { answers: userAnswers } = req.body;
    const oaTestId = req.params.id;
    const userId = req.user._id;

    const questions = await OAQuestion.find({ oaTest: oaTestId });
    
    let score = 0;
    let totalPossibleScore = 0;
    let attemptedQuestions = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    const processedAnswers = [];

    for (const q of questions) {
      totalPossibleScore += (q.points || 0);
      
      const userAnswerObj = userAnswers.find((a) => a.questionId === q._id.toString());
      const userAnswerText = userAnswerObj ? String(userAnswerObj.answer).trim() : "";
      const isAttempted = userAnswerText !== "";
      
      if (isAttempted) attemptedQuestions++;

      const correctAnswerText = String(q.correctAnswer).trim();
      let isCorrect = false;
      let pointsEarned = 0;

      if (q.type === "mcq") {
        isCorrect = isAttempted && userAnswerText.toLowerCase() === correctAnswerText.toLowerCase();
        pointsEarned = isCorrect ? (q.points || 0) : 0;
        
        if (isAttempted) {
          if (isCorrect) correctAnswers++;
          else incorrectAnswers++;
        }
      } else {
        // Coding questions
        isCorrect = false; 
        pointsEarned = 0;
      }

      score += pointsEarned;

      processedAnswers.push({
        question: q._id,
        answer: userAnswerText,
        isCorrect,
        pointsEarned,
      });
    }

    const totalQuestions = questions.length;
    const unattemptedQuestions = totalQuestions - attemptedQuestions;
    const percentage = totalPossibleScore > 0 ? (score / totalPossibleScore) * 100 : 0;

    const submission = await OASubmission.findOneAndUpdate(
      { oaTest: oaTestId, user: userId },
      {
        oaTest: oaTestId,
        user: userId,
        answers: processedAnswers,
        score,
        percentage: Math.round(percentage * 100) / 100,
        totalQuestions,
        attemptedQuestions,
        unattemptedQuestions,
        correctAnswers,
        incorrectAnswers,
        totalPossibleScore,
        status: "Submitted",
        submittedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        returnDocument: "after"
      }
    );

    res.status(200).json({
      success: true,
      message: "Assessment submitted successfully",
      submission
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
    }).populate("oaTest", "title company durationMinutes difficulty");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "No submission found",
      });
    }

    res.status(200).json({
      success: true,
      submission
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
