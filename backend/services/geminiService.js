import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "gemini-2.0-flash";

/**
 * Helper — creates and returns a Gemini client instance.
 * Throws if the API key is missing.
 */
function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env");
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

/**
 * Helper — clean raw resume text for better Gemini parsing accuracy.
 */
function cleanResumeText(text) {
  return text
    .replace(/[ \t]+/g, " ")
    .replace(/(\r?\n\s*){3,}/g, "\n\n")
    .trim();
}

/**
 * Extract structured resume data (skills + projects) from raw text.
 */
export async function extractResumeData(resumeText) {
  const ai = getGeminiClient();
  const cleaned = cleanResumeText(resumeText);

  const prompt = `You are an expert ATS resume parser.

Extract technical skills and project names from the resume.

Return ONLY valid JSON in this exact format:
{
  "skills": [],
  "projects": []
}

Rules:
1. Include all technical skills from any technical domain.
2. Include programming languages, frameworks, libraries, databases, tools, cloud platforms, cybersecurity tools, AI/ML libraries, mobile frameworks, and other technical technologies.
3. Do not include soft skills.
4. Remove duplicates.
5. Preserve correct capitalization.
6. Extract only project names.
7. Return at most 50 skills and 20 projects.
8. Return JSON only.

Resume Text:
${cleaned}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    let text = response.text;

    // Remove markdown wrappers if present
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    }

    const data = JSON.parse(text);

    // Normalize results
    const normalize = (arr) => {
      if (!Array.isArray(arr)) return [];
      return [...new Set(
        arr.map(item => String(item).trim()).filter(item => item.length > 0)
      )];
    };

    return {
      skills: normalize(data.skills),
      projects: normalize(data.projects),
    };
  } catch (err) {
    console.error("extractResumeData failed:", err);
    return { skills: [], projects: [] };
  }
}

/**
 * Generate a tailored set of interview questions based on the candidate profile.
 */
export async function generateInterviewQuestions(profileData) {
  const ai = getGeminiClient();
  const { fullName, role, skills, projects } = profileData;

  const prompt = `
You are an expert technical interviewer at a top tech company.

Generate exactly 10 interview questions for the following candidate:

Name: ${fullName}
Role: ${role || "Software Engineer"}
Skills: ${skills.join(", ")}
Projects: ${projects.join(", ")}

Requirements:
- 6 technical questions based on the candidate's skills and projects
- 2 project-based questions asking about specific projects listed above
- 2 HR/behavioral questions suitable for a software engineering role
- Questions should range from intermediate to advanced difficulty
- Be specific — reference actual skills and projects from the profile

Respond ONLY with valid JSON in this exact format, no extra text:
{
  "questions": [
    { "type": "technical", "question": "..." },
    { "type": "technical", "question": "..." },
    { "type": "technical", "question": "..." },
    { "type": "technical", "question": "..." },
    { "type": "technical", "question": "..." },
    { "type": "technical", "question": "..." },
    { "type": "project", "question": "..." },
    { "type": "project", "question": "..." },
    { "type": "behavioral", "question": "..." },
    { "type": "behavioral", "question": "..." }
  ]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    let text = response.text;

    // Remove markdown wrappers if present
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    }

    const data = JSON.parse(text);

    return {
      questions: Array.isArray(data.questions) ? data.questions : [],
    };
  } catch (err) {
    console.error("generateInterviewQuestions failed:", err);
    // Return fallback questions
    return {
      questions: [
        { type: "technical", question: "Can you explain your experience with the technologies listed on your resume?" },
        { type: "technical", question: "How do you stay updated with the latest trends in software development?" },
        { type: "project", question: "Which project are you most proud of and why?" },
        { type: "behavioral", question: "Tell me about a time you faced a difficult technical challenge." }
      ]
    };
  }
}
