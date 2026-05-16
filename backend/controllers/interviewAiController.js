import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFParse } from "pdf-parse";
import User from "../models/User.js";
import InterviewResult from "../models/InterviewResult.js";
import {
  extractResumeData,
  generateInterviewQuestions,
  evaluateInterviewResponse,
} from "../services/geminiService.js";

/**
 * @desc    Evaluate interview transcript and save results.
 * @route   POST /api/interview-ai/submit
 * @access  Private
 */
export const submitInterview = async (req, res) => {
  try {
    const { questions, answers } = req.body;
    const userId = req.user._id;

    if (!questions || !answers || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Questions and answers are required.",
      });
    }

    // 1. Evaluate via Gemini
    const evaluation = await evaluateInterviewResponse({ questions, answers });

    // 2. Save to database
    const result = new InterviewResult({
      user: userId,
      questions,
      answers,
      technicalScore: evaluation.technicalScore,
      communicationScore: evaluation.communicationScore,
      overallScore: evaluation.overallScore,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
    });

    await result.save();

    return res.status(200).json({
      success: true,
      resultId: result._id,
      evaluation,
    });
  } catch (error) {
    console.error("submitInterview Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @desc    Parse uploaded resume, extract skills/projects via Gemini,
 *          then generate tailored interview questions.
 * @route   POST /api/interview-ai/generate
 * @access  Private
 */
export const parseResumeAndGenerateQuestions = async (req, res) => {
  try {
    // 1. Load the current user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2. Ensure a resume has been uploaded
    if (!user.resumeUrl) {
      return res.status(400).json({
        success: false,
        message: "No resume uploaded. Please upload a resume first.",
      });
    }

    // 3. Resolve the file path on disk
    //    resumeUrl is stored as "/uploads/resumes/resume-xxxxx.pdf"
    const filePath = path.join(__dirname, "..", user.resumeUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Resume file not found on server. Please re-upload.",
      });
    }

    // 4. Read and parse the PDF using pdf-parse v2
    let resumeText;
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const parser = new PDFParse({ data: dataBuffer });
      const result = await parser.getText();
      resumeText = result.text;
    } catch (pdfErr) {
      console.error("PDF Parse Error:", pdfErr.message);
      return res.status(422).json({
        success: false,
        message: "Failed to parse the PDF file. The file may be corrupted or image-only.",
      });
    }

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(422).json({
        success: false,
        message: "No readable text found in the PDF. The resume may be image-based.",
      });
    }

    // 5. Save extracted text to the user document
    user.extractedResumeText = resumeText;

    // 6. Extract skills and projects via Gemini
    let skills, projects;
    try {
      const extracted = await extractResumeData(resumeText);
      skills = extracted.skills;
      projects = extracted.projects;
    } catch (aiErr) {
      console.error("Gemini Extract Error:", aiErr.message);
      return res.status(502).json({
        success: false,
        message: "AI service failed to analyze the resume. Please try again.",
      });
    }

    // 7. Save extracted data to the user document
    user.skills = skills;
    user.projects = projects;
    await user.save();

    // 8. Generate interview questions based on the profile
    let questions;
    try {
      const result = await generateInterviewQuestions({
        fullName: user.fullName,
        role: user.role,
        skills,
        projects,
      });
      questions = result.questions;
    } catch (aiErr) {
      console.error("Gemini Questions Error:", aiErr.message);
      return res.status(502).json({
        success: false,
        message: "AI service failed to generate questions. Please try again.",
      });
    }

    // 9. Return the complete result
    return res.status(200).json({
      success: true,
      skills,
      projects,
      questions,
    });
  } catch (error) {
    console.error("parseResumeAndGenerateQuestions Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc    Regenerate interview questions using already-saved skills/projects.
 * @route   POST /api/interview-ai/regenerate
 * @access  Private
 */
export const regenerateInterviewQuestions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Ensure we have profile data to work with
    if (!user.skills || user.skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No skills found. Please parse your resume first.",
      });
    }

    let questions;
    try {
      const result = await generateInterviewQuestions({
        fullName: user.fullName,
        role: user.role,
        skills: user.skills,
        projects: user.projects || [],
      });
      questions = result.questions;
    } catch (aiErr) {
      console.error("Gemini Regenerate Error:", aiErr.message);
      return res.status(502).json({
        success: false,
        message: "AI service failed to generate questions. Please try again.",
      });
    }

    // Save the new questions to the user profile
    user.generatedQuestions = questions;
    await user.save();

    return res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error("regenerateInterviewQuestions Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
