import Problem from "../models/Problem.js";
import axios from "axios";


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
      const problem =
        await Problem.create(
          req.body
        );

      res
        .status(201)
        .json(problem);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          "Error creating problem",
      });
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

      // Split example testcases
      const examples =
        q.exampleTestcases
          ?.split("\n") || [];

      res.json({
        title: q.title,
        difficulty:
          q.difficulty,
        description:
          q.content,
        tags:
          q.topicTags.map(
            (t) =>
              t.name
          ),

        sampleInput:
          examples[0] ||
          "",

        sampleOutput:
          examples[1] ||
          "",

        constraints:
          "Auto-fill manually if needed",

        hiddenTestCase:
          examples[2] ||
          "",

        leetcodeLink:
          url,

        starterCode,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          "Failed to fetch LeetCode problem",
      });
    }
  };