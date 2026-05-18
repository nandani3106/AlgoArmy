import OATest from "../models/OATest.js";
import OAQuestion from "../models/OAQuestion.js";
import Problem from "../models/problem.js";
import OASubmission from "../models/OASubmission.js";
import { evaluateCode } from "../services/judgeService.js";

// @desc    Get all OA tests
// @route   GET /api/oa
export const getAllOATests = async (req, res) => {
  try {
    const tests = await OATest.find();
    res.status(200).json({ success: true, data: tests });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get OA test by ID
// @route   GET /api/oa/:id
export const getOATestById = async (req, res) => {
  try {
    const test = await OATest.findById(req.params.id);
    if (!test) return res.status(404).json({ success: false, message: "Test not found" });
    res.status(200).json({ success: true, data: test });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get OA questions for a test (Aggregated from OATest model)
// @route   GET /api/oa/:id/questions
export const getOAQuestions = async (req, res) => {
  try {
    const test = await OATest.findById(req.params.id).populate("selectedCodingQuestions");
    if (!test) return res.status(404).json({ success: false, message: "Test not found" });

    const aggregatedQuestions = [];

    // Add MCQs
    if (test.mcqs && test.mcqs.length > 0) {
      test.mcqs.forEach((mcq, index) => {
        aggregatedQuestions.push({
          _id: `mcq-${index}`, // Temporary ID if not in DB
          type: "mcq",
          title: mcq.question,
          statement: mcq.question,
          options: mcq.options,
          correctAnswer: mcq.correctOption,
          points: mcq.marks || 10,
          order: index,
        });
      });
    }

    // Add Coding Questions
    if (test.selectedCodingQuestions && test.selectedCodingQuestions.length > 0) {
      test.selectedCodingQuestions.forEach((prob, index) => {
        aggregatedQuestions.push({
          _id: prob._id,
          type: "coding",
          title: prob.title,
          statement: prob.statement || prob.description,
          leetcodeLink: prob.leetcodeUrl || prob.leetcodeLink,
          difficulty: prob.difficulty,
          points: prob.difficulty === "Easy" ? 20 : prob.difficulty === "Medium" ? 50 : 100,
          timeLimit: prob.timeLimit || 2,
          memoryLimit: prob.memoryLimit || 256,
          sampleTestCases: prob.sampleTestCases || prob.testCases?.slice(0, 2) || [],
          hiddenTestCases: prob.hiddenTestCases || prob.testCases || [],
          examples: prob.examples || [],
          constraints: prob.constraints || "",
          inputFormat: prob.inputFormat || "",
          outputFormat: prob.outputFormat || "",
          sampleInput: prob.sampleInput || "",
          sampleOutput: prob.sampleOutput || "",
          order: (test.mcqs?.length || 0) + index + 1,
        });
      });
    }

    res.status(200).json({ success: true, data: aggregatedQuestions });
  } catch (error) {
    console.error("Get OA Questions Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Run Code for an OA coding question (Sample Test Cases Only)
// @route   POST /api/oa/:id/run
export const runOACode = async (req, res) => {
  try {
    const { questionId, code, language, customInput } = req.body;
    
    let question = await OAQuestion.findById(questionId);
    if (!question) question = await Problem.findById(questionId);

    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    let testCases = [];
    if (customInput) {
      testCases = [{ input: customInput, output: "", isHidden: false }];
    } else {
      const samples = question.sampleTestCases || question.testCases?.slice(0, 2) || [];
      testCases = samples.map(tc => ({ 
        input: tc.input, 
        output: tc.output, 
        isHidden: false 
      }));
    }

    const evaluation = await evaluateCode(
      code, 
      language, 
      testCases, 
      question.timeLimit || 2, 
      question.memoryLimit || 256
    );

    res.status(200).json({ success: true, ...evaluation });
  } catch (error) {
    console.error("Run OA Code Error:", error.message);
    res.status(500).json({ success: false, message: "Execution error" });
  }
};

// @desc    Submit a single OA question for full evaluation (All Test Cases)
// @route   POST /api/oa/:id/submit-question
export const submitOAQuestion = async (req, res) => {
  try {
    const { questionId, code, language } = req.body;
    
    let question = await OAQuestion.findById(questionId);
    if (!question) question = await Problem.findById(questionId);

    if (!question) return res.status(404).json({ success: false, message: "Question not found" });

    // Combine sample and hidden test cases for full evaluation
    const sampleTCs = question.sampleTestCases || question.testCases?.slice(0, 2) || [];
    const hiddenTCs = question.hiddenTestCases || question.testCases || [];

    const allTestCases = [
      ...sampleTCs.map(tc => ({ input: tc.input, output: tc.output, isHidden: false })),
      ...hiddenTCs.map(tc => ({ input: tc.input, output: tc.output, isHidden: true }))
    ];

    const evaluation = await evaluateCode(
      code, 
      language, 
      allTestCases, 
      question.timeLimit || 2, 
      question.memoryLimit || 256
    );

    res.status(200).json({ success: true, ...evaluation });
  } catch (error) {
    console.error("Submit Question Error:", error.message);
    res.status(500).json({ success: false, message: "Evaluation error" });
  }
};

// @desc    Submit OA test (Evaluates both MCQ and Coding)
// @route   POST /api/oa/:id/submit
export const submitOATest = async (req, res) => {
  try {
    const oaTestId = req.params.id;
    const { answers: userAnswers } = req.body;
    const userId = req.user._id;

    // Fetch the test to get aggregated questions
    const test = await OATest.findById(oaTestId).populate("selectedCodingQuestions");
    if (!test) return res.status(404).json({ success: false, message: "Test not found" });

    const mcqs = (test.mcqs || []).map((m, i) => ({
      _id: `mcq-${i}`,
      type: "mcq",
      correctAnswer: m.correctOption,
      points: m.marks || 10
    }));

    const coding = (test.selectedCodingQuestions || []).map(p => ({
      _id: p._id.toString(),
      type: "coding",
      points: p.difficulty === "Easy" ? 20 : p.difficulty === "Medium" ? 50 : 100,
      timeLimit: p.timeLimit || 2,
      memoryLimit: p.memoryLimit || 256,
      sampleTestCases: p.sampleTestCases || p.testCases?.slice(0, 2) || [],
      hiddenTestCases: p.hiddenTestCases || p.testCases || []
    }));

    const allQuestions = [...mcqs, ...coding];
    
    let totalScore = 0;
    let totalPossible = 0;
    let correctMCQs = 0;
    let incorrectMCQs = 0;
    let attemptedCount = 0;

    const processedAnswers = [];

    for (const q of allQuestions) {
      totalPossible += q.points;
      const userAns = userAnswers.find((ua) => ua.questionId === q._id.toString());

      if (!userAns || (!userAns.answer && q.type === 'mcq')) {
        processedAnswers.push({ questionId: q._id, pointsEarned: 0 });
        continue;
      }

      attemptedCount++;

      if (q.type === "mcq") {
        const isCorrect = userAns.answer === q.correctAnswer;
        if (isCorrect) {
          correctMCQs++;
          totalScore += q.points;
        } else {
          incorrectMCQs++;
        }
        processedAnswers.push({
          questionId: q._id,
          answer: userAns.answer,
          isCorrect,
          pointsEarned: isCorrect ? q.points : 0,
        });
      } else if (q.type === "coding") {
        const submittedCode = userAns.answer || "";
        const language = userAns.language || "javascript";

        const allTestCases = [
          ...q.sampleTestCases.map(tc => ({ input: tc.input, output: tc.output, isHidden: false })),
          ...q.hiddenTestCases.map(tc => ({ input: tc.input, output: tc.output, isHidden: true }))
        ];

        const evaluation = await evaluateCode(
          submittedCode, 
          language, 
          allTestCases, 
          q.timeLimit || 2, 
          q.memoryLimit || 256
        );

        const isCorrect = evaluation.verdict === "Accepted";
        const points = isCorrect ? q.points : 0;
        totalScore += points;

        processedAnswers.push({
          questionId: q._id,
          answer: submittedCode,
          language: language,
          isCorrect,
          pointsEarned: points,
          verdict: evaluation.verdict,
          executionTime: evaluation.executionTime,
          memoryUsed: evaluation.memoryUsed,
          passedTests: evaluation.passedTestCases,
          totalTests: evaluation.totalTestCases,
          complexityEstimate: evaluation.complexityEstimate,
          compilerOutput: evaluation.compilerOutput,
          detailedResults: evaluation.detailedResults,
        });
      }
    }

    const totalQuestions = allQuestions.length;
    const percentage = totalPossible > 0 ? ((totalScore / totalPossible) * 100).toFixed(2) : 0;

    const submission = await OASubmission.findOneAndUpdate(
      { user: userId, oaTest: oaTestId },
      {
        user: userId,
        oaTest: oaTestId,
        answers: processedAnswers,
        score: totalScore,
        percentage,
        totalQuestions,
        attemptedQuestions: attemptedCount,
        unattemptedQuestions: totalQuestions - attemptedCount,
        correctAnswers: correctMCQs,
        incorrectAnswers: incorrectMCQs,
        totalPossibleScore: totalPossible,
        status: "completed",
        submittedAt: Date.now(),
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, submission });
  } catch (error) {
    console.error("OA Submit Error:", error.message);
    res.status(500).json({ success: false, message: "Submission error" });
  }
};

// @desc    Save OA Progress (Partial submission)
// @route   POST /api/oa/:id/save-progress
// @access  Private
export const saveOAProgress = async (req, res) => {
  try {
    const oaTestId = req.params.id;
    const { answers: userAnswers } = req.body;
    const userId = req.user._id;

    // Fetch existing submission or create new one in 'in_progress' status
    let submission = await OASubmission.findOne({ user: userId, oaTest: oaTestId });

    if (!submission) {
      submission = new OASubmission({
        user: userId,
        oaTest: oaTestId,
        status: "in_progress",
        answers: [],
      });
    }

    // Merge/Update answers
    for (const userAns of userAnswers) {
      const idx = submission.answers.findIndex(a => a.questionId.toString() === userAns.questionId);
      if (idx >= 0) {
        submission.answers[idx].answer = userAns.answer;
        submission.answers[idx].language = userAns.language;
      } else {
        submission.answers.push({
          questionId: userAns.questionId,
          answer: userAns.answer,
          language: userAns.language,
        });
      }
    }

    await submission.save();
    res.status(200).json({ success: true, message: "Progress saved" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Save progress error" });
  }
};

// @desc    Get OA report for a test
// @route   GET /api/oa/:id/report
export const getOAReport = async (req, res) => {
  try {
    const submission = await OASubmission.findOne({
      user: req.user._id,
      oaTest: req.params.id,
    }).populate("oaTest", "title company difficulty");

    if (!submission) return res.status(404).json({ success: false, message: "Report not found" });
    res.status(200).json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: "Report error" });
  }
};
