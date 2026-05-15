import dotenv from "dotenv";
dotenv.config();

/**
 * Judge Service for AlgoArmy
 * Uses Judge0 CE API to execute and evaluate code.
 */

// Judge0 Language IDs
const LANGUAGE_IDS = {
  javascript: 93, // Node.js 18
  python: 71,     // Python 3.8.1
  cpp: 54,        // C++ (GCC 9.2.0)
  java: 62,       // Java (OpenJDK 13.0.1)
};

const JUDGE0_URL =
  process.env.JUDGE0_BASE_URL || "https://ce.judge0.com";
/**
 * Normalizes output by trimming whitespace and handling line endings.
 */
const normalizeOutput = (output) => {
  if (!output) return "";
  return output
    .toString()
    .replace(/\r\n/g, "\n") // Windows to Unix
    .split("\n")
    .map(line => line.trimEnd()) // Trim trailing spaces on each line
    .join("\n")
    .trim(); // Trim leading/trailing whitespace from entire output
};

/**
 * Estimates time complexity based on code patterns.
 * (Simple heuristic-based estimation)
 */
const estimateComplexity = (code, language) => {
  const codeLower = code.toLowerCase();

  if (codeLower.includes("for") || codeLower.includes("while")) {
    // Nested loops check
    const loopCount = (codeLower.match(/for|while/g) || []).length;
    if (loopCount >= 2) {
      if (codeLower.includes("[") && codeLower.includes("]")) return "O(n²)";
      return "O(n log n)";
    }
    return "O(n)";
  }

  if (codeLower.includes("binarysearch") || codeLower.includes("log")) {
    return "O(log n)";
  }

  return "O(1)";
};

/**
 * Evaluates code against a list of test cases.
 */
export const evaluateCode = async (code, language, testCases, timeLimit = 2, memoryLimit = 256) => {
  const results = [];
  let passedCount = 0;
  let overallVerdict = "Accepted";
  let totalTime = 0;
  let maxMemory = 0;
  let compilerOutput = "";
  let failedIndex = -1;

  const langId = LANGUAGE_IDS[language.toLowerCase()] || 93;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];

    try {
      // Create submission on Judge0
      const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

        },
        body: JSON.stringify({
          source_code: code,
          language_id: langId,
          stdin: tc.input,
          expected_output: tc.output,
          cpu_time_limit: timeLimit,
          memory_limit: memoryLimit * 1024, // Judge0 uses KB
        }),
      });

      const data = await response.json();

      // Process result
      const status = data.status?.description || "Unknown";
      const actualOutput = data.stdout ? normalizeOutput(data.stdout) : "";
      const expectedOutput = normalizeOutput(tc.output);
      const compileMsg = data.compile_output || "";

      if (compileMsg) compilerOutput = compileMsg;

      const timeTaken = parseFloat(data.time || 0);
      const memUsed = parseFloat(data.memory || 0) / 1024; // Convert to MB

      totalTime += timeTaken;
      maxMemory = Math.max(maxMemory, memUsed);

      const isPassed = data.status?.id === 3; // 3 is "Accepted" in Judge0

      results.push({
        input: tc.input,
        expected: tc.output,
        actual: actualOutput || (data.stderr || data.message || ""),
        passed: isPassed,
        status: status,
        time: `${(timeTaken * 1000).toFixed(0)} ms`,
        memory: `${memUsed.toFixed(2)} MB`,
        isHidden: tc.isHidden || false,
      });

      if (isPassed) {
        passedCount++;
      } else {
        // Map Judge0 status to our verdicts
        if (status === "Wrong Answer") overallVerdict = "Wrong Answer";
        else if (status.includes("Time Limit")) overallVerdict = "Time Limit Exceeded";
        else if (status.includes("Memory Limit")) overallVerdict = "Memory Limit Exceeded";
        else if (status.includes("Runtime Error")) overallVerdict = "Runtime Error";
        else if (status.includes("Compilation Error")) overallVerdict = "Compilation Error";
        else overallVerdict = status;

        if (failedIndex === -1) failedIndex = i;

        // Rule: Stop if any test case fails (including hidden)
        // But for "Run Code" we might want to continue. 
        // For "Submit", we can stop. 
        // Here we'll continue to get full results for the UI, but mark failedIndex.
      }
    } catch (error) {
      console.error("Judge0 Error:", error.message);
      results.push({
        input: tc.input,
        expected: tc.output,
        actual: "Evaluation engine error",
        passed: false,
        status: "Internal Error",
        time: "0 ms",
        memory: "0 MB",
        isHidden: tc.isHidden || false,
      });
      overallVerdict = "Internal Error";
      if (failedIndex === -1) failedIndex = i;
    }
  }

  const complexity = estimateComplexity(code, language);

  return {
    success: true,
    verdict: passedCount === testCases.length ? "Accepted" : overallVerdict,
    passedTestCases: passedCount,
    totalTestCases: testCases.length,
    executionTime: `${(totalTime * 1000).toFixed(0)} ms`,
    memoryUsed: `${maxMemory.toFixed(2)} MB`,
    detailedResults: results,
    compilerOutput: compilerOutput,
    complexityEstimate: complexity,
    failedTestCaseIndex: failedIndex,
    score: passedCount === testCases.length ? 100 : 0, // Rule: Full points only if all pass
  };
};
