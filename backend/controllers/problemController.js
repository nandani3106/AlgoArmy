import Problem from "../models/problem.js";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { extractMetadata } from "../services/codeWrapperService.js";


const getFunctionMetadataFromStarterCode = (starterCodeObj) => {
  if (!starterCodeObj) return null;
  const languages = ['cpp', 'java', 'python', 'javascript'];
  for (const lang of languages) {
    const code = starterCodeObj[lang];
    if (code) {
      const meta = extractMetadata(code, lang);
      if (meta) return meta;
    }
  }
  return null;
};


// =============================
// GET ALL PROBLEMS
// =============================
export const getProblems = async (
  req,
  res
) => {
  try {
    const problems =
      await Problem.find();

    res.json(problems);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        "Error fetching problems",
    });
  }
};


// =============================
// CREATE NEW PROBLEM
// =============================
export const createProblem =
  async (req, res) => {
    try {
      // Map constraints strictly to an array of strings
      let constraintsArray = [];
      if (Array.isArray(req.body.constraints)) {
        constraintsArray = req.body.constraints;
      } else if (typeof req.body.constraints === "string") {
        constraintsArray = req.body.constraints.split("\n").map(c => c.trim()).filter(Boolean);
      }

      // Map visible test cases array with schema fields
      let finalTestCases = [];
      if (req.body.testCases && req.body.testCases.length > 0) {
        finalTestCases = req.body.testCases.map(t => ({
          input: t.input,
          output: t.expectedOutput || t.output || "",
          expectedOutput: t.expectedOutput || t.output || "",
          isHidden: false
        }));
      } else {
        finalTestCases = [
          {
            input: req.body.sampleInput || "",
            output: req.body.sampleOutput || "",
            expectedOutput: req.body.sampleOutput || "",
            isHidden: false
          }
        ];
      }

      // Map hidden test cases separately
      let finalHiddenTestCases = [];
      if (req.body.hiddenTestCases && req.body.hiddenTestCases.length > 0) {
        finalHiddenTestCases = req.body.hiddenTestCases.map(t => ({
          input: t.input,
          output: t.expectedOutput || t.output || "",
          isHidden: true
        }));
      }

      const problemData = {
        title: req.body.title,
        difficulty: req.body.difficulty,
        tags: req.body.tag ? [req.body.tag] : (req.body.tags || []),
        description: req.body.statement || req.body.description || "",
        statement: req.body.statement || req.body.description || "",
        constraints: constraintsArray,
        inputFormat: req.body.inputFormat || "Read standard inputs according to the description.",
        outputFormat: req.body.outputFormat || "Print the output corresponding to the problem.",
        sampleInput: req.body.sampleInput || (finalTestCases[0] ? finalTestCases[0].input : ""),
        sampleOutput: req.body.sampleOutput || (finalTestCases[0] ? finalTestCases[0].expectedOutput : ""),
        examples: (req.body.examples && req.body.examples.length > 0) ? req.body.examples : [
          {
            input: req.body.sampleInput || "",
            output: req.body.sampleOutput || "",
            explanation: ""
          }
        ],
        testCases: finalTestCases,
        hiddenTestCases: finalHiddenTestCases,
        leetcodeUrl: req.body.leetcodeLink,
        leetcodeLink: req.body.leetcodeLink,
        starterCode: {
          cpp: req.body.starterCpp || "",
          python: req.body.starterPython || "",
          java: req.body.starterJava || "",
          javascript: req.body.starterJs || "",
        },
        functionMetadata: getFunctionMetadataFromStarterCode({
          cpp: req.body.starterCpp || "",
          python: req.body.starterPython || "",
          java: req.body.starterJava || "",
          javascript: req.body.starterJs || "",
        })
      };

      console.log("Creating problem with test cases:", finalTestCases.length, "visible,", finalHiddenTestCases.length, "hidden");

      const problem = await Problem.create(problemData);
      res.status(201).json(problem);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Error creating problem",
      });
    }
  };


// =============================
// UPDATE PROBLEM
// =============================
export const updateProblem = async (req, res) => {
  try {
    const { id } = req.params;

    // Map constraints
    let constraintsArray = [];
    if (Array.isArray(req.body.constraints)) {
      constraintsArray = req.body.constraints;
    } else if (typeof req.body.constraints === "string") {
      constraintsArray = req.body.constraints.split("\n").map(c => c.trim()).filter(Boolean);
    }

    // Map visible test cases
    let finalTestCases = [];
    if (req.body.testCases && req.body.testCases.length > 0) {
      finalTestCases = req.body.testCases.map(t => ({
        input: t.input,
        output: t.expectedOutput || t.output || "",
        expectedOutput: t.expectedOutput || t.output || "",
        isHidden: false
      }));
    }

    // Map hidden test cases
    let finalHiddenTestCases = [];
    if (req.body.hiddenTestCases && req.body.hiddenTestCases.length > 0) {
      finalHiddenTestCases = req.body.hiddenTestCases.map(t => ({
        input: t.input,
        output: t.expectedOutput || t.output || "",
        isHidden: true
      }));
    }

    const updateData = {
      title: req.body.title,
      difficulty: req.body.difficulty,
      tags: req.body.tag ? [req.body.tag] : (req.body.tags || []),
      description: req.body.statement || req.body.description || "",
      statement: req.body.statement || req.body.description || "",
      constraints: constraintsArray,
      inputFormat: req.body.inputFormat || "Read standard inputs according to the description.",
      outputFormat: req.body.outputFormat || "Print the output corresponding to the problem.",
      sampleInput: req.body.sampleInput || (finalTestCases[0] ? finalTestCases[0].input : ""),
      sampleOutput: req.body.sampleOutput || (finalTestCases[0] ? finalTestCases[0].expectedOutput : ""),
      testCases: finalTestCases,
      hiddenTestCases: finalHiddenTestCases,
      leetcodeUrl: req.body.leetcodeLink,
      leetcodeLink: req.body.leetcodeLink,
      starterCode: {
        cpp: req.body.starterCpp || "",
        python: req.body.starterPython || "",
        java: req.body.starterJava || "",
        javascript: req.body.starterJs || "",
      },
      functionMetadata: getFunctionMetadataFromStarterCode({
        cpp: req.body.starterCpp || "",
        python: req.body.starterPython || "",
        java: req.body.starterJava || "",
        javascript: req.body.starterJs || "",
      })
    };

    const problem = await Problem.findByIdAndUpdate(id, updateData, { new: true });
    if (!problem) return res.status(404).json({ message: "Problem not found" });

    console.log("Updated problem:", problem.title, "- TC:", finalTestCases.length, "HTC:", finalHiddenTestCases.length);
    res.json(problem);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating problem" });
  }
};


// =============================
// DELETE PROBLEM
// =============================
export const deleteProblem =
  async (req, res) => {
    try {
      await Problem.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Problem deleted",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          "Error deleting problem",
      });
    }
  };


// =============================
// FETCH FROM LEETCODE
// =============================
export const fetchLeetCodeProblem =
  async (req, res) => {
    try {
      const { url } = req.body;

      // SAFETY CHECK
      if (!url) {
        return res
          .status(400)
          .json({
            message:
              "LeetCode URL is required",
          });
      }

      const match =
        url.match(
          /leetcode\.com\/problems\/([^/]+)/
        );

      if (!match) {
        return res
          .status(400)
          .json({
            message:
              "Invalid LeetCode URL",
          });
      }

      const slug = match[1];

      const query = `
        query questionData($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            title
            difficulty
            content
            topicTags {
              name
            }
            exampleTestcases
            codeSnippets {
              lang
              code
            }
          }
        }
      `;

      const response =
      await axios.post(
        "https://leetcode.com/graphql",
        {
          query,
          variables: {
            titleSlug: slug,
          },
        },
        {
          headers: {
            "Content-Type":
              "application/json",
            "User-Agent":
              "Mozilla/5.0",
          },
        }
      );

      const q =
        response.data.data
          .question;

      const starterCode =
        {};

      q.codeSnippets.forEach(
        (item) => {
          if (
            item.lang ===
            "C++"
          ) {
            starterCode.cpp =
              item.code;
          }

          if (
            item.lang ===
            "Java"
          ) {
            starterCode.java =
              item.code;
          }

          if (
            item.lang ===
            "Python3"
          ) {
            starterCode.python =
              item.code;
          }

          if (
            item.lang ===
            "JavaScript"
          ) {
            starterCode.javascript =
              item.code;
          }
        }
      );

      // =============================
      // ROBUST LOCAL HTML PARSER (NO GEMINI QUOTA REQUIRED)
      // =============================
      let statement = "";
      let examples = [];
      let constraints = "";
      let inputFormat = "Read standard inputs according to the description.";
      let outputFormat = "Print the output corresponding to the problem.";
      let sampleInput = "";
      let sampleOutput = "";
      let finalTestCases = [];

      // 1. Extract Constraints from HTML
      const constraintsMatch = (q.content || "").match(/(?:<strong>Constraints:<\/strong>|Constraints:)([\s\S]*?)(?:<\/ul>)/i);
      if (constraintsMatch) {
        const listItems = constraintsMatch[1].match(/<li>([\s\S]*?)<\/li>/gi);
        if (listItems) {
          constraints = listItems.map(item => {
            return item
              .replace(/<\/?li>/gi, "")
              .replace(/<code>/gi, "")
              .replace(/<\/code>/gi, "")
              .replace(/<sup>/gi, "^")
              .replace(/<\/sup>/gi, "")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .replace(/&le;/g, "<=")
              .replace(/&ge;/g, ">=")
              .replace(/&nbsp;/g, " ")
              .replace(/<[^>]*>/g, "")
              .trim();
          }).join("\n");
        }
      }

      // 2. Extract Examples from HTML <pre> blocks
      const preMatches = (q.content || "").match(/<pre>([\s\S]*?)<\/pre>/gi);
      if (preMatches) {
        preMatches.forEach((preBlock) => {
          let content = preBlock.replace(/<\/?pre>/gi, "");

          // Extract Input
          let input = "";
          const inputMatch = content.match(/(?:<strong>Input:<\/strong>|Input:)([\s\S]*?)(?=(?:<strong>Output:<\/strong>|Output:|<strong>Explanation:<\/strong>|Explanation:|$))/i);
          if (inputMatch) {
            input = inputMatch[1]
              .replace(/&nbsp;/g, " ")
              .replace(/<[^>]*>/g, "")
              .trim();
          }

          // Extract Output
          let output = "";
          const outputMatch = content.match(/(?:<strong>Output:<\/strong>|Output:)([\s\S]*?)(?=(?:<strong>Explanation:<\/strong>|Explanation:|$))/i);
          if (outputMatch) {
            output = outputMatch[1]
              .replace(/&nbsp;/g, " ")
              .replace(/<[^>]*>/g, "")
              .trim();
          }

          // Extract Explanation
          let explanation = "";
          const explanationMatch = content.match(/(?:<strong>Explanation:<\/strong>|Explanation:)([\s\S]*?)$/i);
          if (explanationMatch) {
            explanation = explanationMatch[1]
              .replace(/&nbsp;/g, " ")
              .replace(/<[^>]*>/g, "")
              .trim();
          }

          if (input || output) {
            examples.push({ input, output, explanation });
          }
        });
      }

      // 3. Clean Description (Statement) - strip examples and constraints section
      const firstExampleIdx = (q.content || "").indexOf('class="example"');
      if (firstExampleIdx !== -1) {
        const pStart = (q.content || "").lastIndexOf("<p>", firstExampleIdx);
        if (pStart !== -1) {
          statement = q.content.substring(0, pStart);
        } else {
          statement = q.content.substring(0, firstExampleIdx).replace(/<strong[^>]*>$/, "").replace(/<p[^>]*>$/, "");
        }
      } else {
        const fallbackIdx = (q.content || "").search(/Example\s*1/i);
        if (fallbackIdx !== -1) {
          statement = q.content.substring(0, fallbackIdx).replace(/<strong[^>]*>$/, "").replace(/<p[^>]*>$/, "");
        } else {
          statement = q.content || "";
        }
      }
      statement = statement.trim();

      // 4. Parse exampleTestcases from LeetCode standard input lines
      let numParams = 1;
      if (examples.length > 0 && examples[0].input) {
        const equalsCount = (examples[0].input.match(/=/g) || []).length;
        if (equalsCount > 0) numParams = equalsCount;
      }

      const rawLines = q.exampleTestcases?.split("\n").map(l => l.trim()).filter(Boolean) || [];
      const testcaseInputs = [];
      for (let i = 0; i < rawLines.length; i += numParams) {
        const chunk = rawLines.slice(i, i + numParams);
        if (chunk.length === numParams) {
          testcaseInputs.push(chunk.join("\n"));
        }
      }

      testcaseInputs.forEach((inp, idx) => {
        const out = examples[idx]?.output || examples[0]?.output || "";
        finalTestCases.push({ input: inp, output: out });
      });

      if (finalTestCases.length > 0) {
        sampleInput = finalTestCases[0].input;
        sampleOutput = finalTestCases[0].output;
      } else if (examples.length > 0) {
        sampleInput = examples[0].input;
        sampleOutput = examples[0].output;
      }

      // If local extraction failed to find critical parts, fall back to Gemini
      if ((!constraints || examples.length === 0) && process.env.GEMINI_API_KEY && q.content) {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const geminiPrompt = `
You are an expert algorithms developer. You are scraping a LeetCode problem description in HTML format.
Your task is to parse the HTML and extract the following structured details accurately.

LeetCode HTML content:
${q.content}

Return ONLY a valid JSON object in the following format:
{
  "statement": "The full, rich text problem statement. Clean the HTML tags, preserve code formatting, preserve mathematical equations and line breaks. Exclude examples, constraints, or input/output formats if they are in separate sections.",
  "examples": [
    {
      "input": "...",
      "output": "...",
      "explanation": "..."
    }
  ],
  "constraints": "Clean, formatted string of all constraints (e.g. 1 <= n <= 10^5), one per line.",
  "inputFormat": "A description of what the input contains.",
  "outputFormat": "A description of what the output should be.",
  "sampleInput": "The raw input string for the first example.",
  "sampleOutput": "The raw output string for the first example."
}

Do not include any markdown styling, only return raw JSON.
`;

          const geminiRes = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: geminiPrompt,
          });

          let text = geminiRes.text;
          if (text.startsWith("```")) {
            text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
          }

          const parsed = JSON.parse(text);
          if (parsed.statement) statement = parsed.statement;
          if (parsed.examples && parsed.examples.length > 0) examples = parsed.examples;
          if (parsed.constraints) constraints = parsed.constraints;
          if (parsed.inputFormat) inputFormat = parsed.inputFormat;
          if (parsed.outputFormat) outputFormat = parsed.outputFormat;
          if (parsed.sampleInput) sampleInput = parsed.sampleInput;
          if (parsed.sampleOutput) sampleOutput = parsed.sampleOutput;
        } catch (geminiErr) {
          console.error("Gemini fallback parsing failed:", geminiErr.message);
        }
      }

      const extractedMeta = getFunctionMetadataFromStarterCode(starterCode);

      res.json({
        title: q.title,
        difficulty: q.difficulty,
        description: statement,
        statement,
        examples,
        constraints: constraints || "No constraints provided.",
        inputFormat,
        outputFormat,
        sampleInput,
        sampleOutput,
        testCases: finalTestCases.length > 0 ? finalTestCases : (examples.map(ex => ({ input: ex.input, output: ex.output }))),
        hiddenTestCases: finalTestCases.length > 0 ? finalTestCases : (examples.map(ex => ({ input: ex.input, output: ex.output }))),
        tags: q.topicTags.map((t) => t.name),
        leetcodeUrl: url,
        leetcodeLink: url,
        starterCode,
        functionMetadata: extractedMeta,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          "Failed to fetch LeetCode problem",
      });
    }
  };