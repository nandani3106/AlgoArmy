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
 * Estimates both time and space complexity based on code patterns.
 * (Sophisticated heuristic-based Big-O analysis)
 */
const estimateComplexity = (code, language) => {
  const codeLower = code.toLowerCase();
  
  // 1. Time Complexity Estimation
  let time = "O(1)";
  const loopCount = (codeLower.match(/for\s*\(|while\s*\(|for\s+\w+\s+in|for\s+\w+\s+of/g) || []).length;
  
  if (codeLower.includes("binarysearch") || codeLower.includes("binary_search") || codeLower.match(/mid\s*=\s*/)) {
    time = "O(log n)";
  } else if (codeLower.includes("sort(") || codeLower.includes("sorted(")) {
    time = "O(n log n)";
  } else if (loopCount >= 2 && (codeLower.includes("nested") || codeLower.match(/(for|while).*\{.*(for|while)/s))) {
    time = "O(n²)";
  } else if (loopCount >= 1 || codeLower.includes("each") || codeLower.includes("map(") || codeLower.includes("filter(")) {
    time = "O(n)";
  } else if (codeLower.includes("recursion") || codeLower.includes("solve(") || codeLower.match(/function\s+(\w+)\(.*\)\s*\{.*(\1)\(.*\)/s)) {
    time = "O(2ⁿ)";
  }
  
  // 2. Space Complexity Estimation
  let space = "O(1)";
  if (codeLower.includes("map") || codeLower.includes("set") || codeLower.includes("dict") || codeLower.includes("new array") || codeLower.includes(".push(") || codeLower.includes("append(")) {
    space = "O(n)";
    if (time === "O(n²)" && (codeLower.includes("grid") || codeLower.includes("matrix") || codeLower.includes("dp = new array"))) {
      space = "O(n²)";
    }
  } else if (codeLower.includes("recursion") || codeLower.includes("call stack") || codeLower.match(/function\s+(\w+)\(.*\)\s*\{.*(\1)\(.*\)/s)) {
    space = "O(n)";
  }

  return {
    time,
    space,
    explanation: `Estimated ${time} time based on loops and ${space} space based on container allocations.`
  };
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
