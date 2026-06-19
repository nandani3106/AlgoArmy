import dotenv from "dotenv";
import { 
  extractMetadata,
  generateCppWrapper,
  generateJavaWrapper,
  generatePythonWrapper,
  generateJavascriptWrapper
} from "./codeWrapperService.js";

dotenv.config();

/**
 * Judge Service for AlgoArmy
 * Uses Judge0 CE API (ce.judge0.com) — confirmed working.
 */

const JUDGE0_URL = process.env.JUDGE0_BASE_URL || "https://ce.judge0.com";

const isLeetCodeStyle = (code) => {
  if (!code) return false;
  return code.includes("class Solution") || code.includes("class Solution:") || code.includes("var Solution") || code.includes("const Solution") || code.includes("Solution::");
};

const isAlreadyWrapped = (code, language) => {
  if (!code) return false;
  const lang = language.toLowerCase();
  if (lang === 'cpp' || lang === 'c++') {
    return code.includes("int main(");
  }
  if (lang === 'java') {
    return code.includes("public class Main");
  }
  if (lang === 'python' || lang === 'python3') {
    return code.includes("__main__");
  }
  if (lang === 'javascript' || lang === 'js') {
    return code.includes("function main()");
  }
  return false;
};

const wrapCodeIfNeeded = (code, language, functionMetadata) => {
  if (isAlreadyWrapped(code, language)) {
    return code;
  }

  const hasMetadata = functionMetadata && functionMetadata.functionName;
  if (!hasMetadata && !isLeetCodeStyle(code)) {
    return code;
  }

  let meta = functionMetadata;
  if (!meta || !meta.functionName || !meta.parameters || (Array.isArray(meta.parameters) && meta.parameters.length === 0 && !meta.functionName)) {
    meta = extractMetadata(code, language);
  }
  if (!meta || !meta.functionName) {
    // If database metadata is empty, extract from code directly as fallback
    meta = extractMetadata(code, language);
  }
  if (!meta || !meta.functionName) {
    console.warn("[Judge] LeetCode style detected but failed to extract function metadata.");
    return code;
  }

  const lang = language.toLowerCase();
  try {
    if (lang === 'cpp' || lang === 'c++') {
      return generateCppWrapper(code, meta);
    }
    if (lang === 'java') {
      return generateJavaWrapper(code, meta);
    }
    if (lang === 'python' || lang === 'python3') {
      return generatePythonWrapper(code, meta);
    }
    if (lang === 'javascript' || lang === 'js') {
      return generateJavascriptWrapper(code, meta);
    }
  } catch (e) {
    console.error("[Judge] Error wrapping code:", e.message);
  }

  return code;
};

// Confirmed language IDs on ce.judge0.com
const LANGUAGE_IDS = {
  javascript: 93,  // Node.js 18.15.0
  python: 71,  // Python 3.8.1
  cpp: 54,  // C++ (GCC 9.2.0)
  java: 62,  // Java (OpenJDK 13.0.1)
  c: 50,  // C (GCC 9.2.0)
};

// ── Helpers ─────────────────────────────────────────────────────────
const normalizeOutput = (output) => {
  if (!output) return "";
  return output
    .toString()
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map(line => line.trimEnd())
    .join("\n")
    .trim();
};

const estimateComplexity = (code) => {
  const c = code.toLowerCase();
  let time = "O(1)";
  const loops = (c.match(/for\s*\(|while\s*\(|for\s+\w+\s+in|for\s+\w+\s+of/g) || []).length;
  if (c.includes("binarysearch") || c.includes("binary_search") || c.match(/mid\s*=\s*/)) time = "O(log n)";
  else if (c.includes("sort(") || c.includes("sorted(")) time = "O(n log n)";
  else if (loops >= 2) time = "O(n²)";
  else if (loops >= 1 || c.includes("map(") || c.includes("filter(")) time = "O(n)";
  let space = "O(1)";
  if (c.includes("map") || c.includes("set") || c.includes(".push(") || c.includes("append(")) {
    space = time === "O(n²)" ? "O(n²)" : "O(n)";
  }
  return { time, space, explanation: `Estimated ${time} time, ${space} space.` };
};

/**
 * Submit code to Judge0 and return the finished result.
 * wait=true is honoured by ce.judge0.com — result comes back immediately.
 * Falls back to polling if somehow a token is returned instead.
 */
const runOnJudge0 = async (source_code, language_id, stdin, expected_output, timeLimit, memoryLimit) => {
  const body = JSON.stringify({
    source_code: Buffer.from(source_code).toString("base64"),
    language_id,
    stdin: Buffer.from(stdin || "").toString("base64"),
    expected_output: Buffer.from(expected_output || "").toString("base64"),
    cpu_time_limit: timeLimit,
    memory_limit: memoryLimit * 1024,
  });

  const res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Judge0 HTTP ${res.status}: ${text}`);
  }

  let data = await res.json();

  if (data.error) throw new Error(data.error);
  if (data.message && !data.status && !data.token) {
    throw new Error(Buffer.from(data.message, "base64").toString("utf-8"));
  }

  const decodeFields = (obj) => {
    if (obj.stdout) obj.stdout = Buffer.from(obj.stdout, "base64").toString("utf-8");
    if (obj.stderr) obj.stderr = Buffer.from(obj.stderr, "base64").toString("utf-8");
    if (obj.compile_output) obj.compile_output = Buffer.from(obj.compile_output, "base64").toString("utf-8");
    if (obj.message) obj.message = Buffer.from(obj.message, "base64").toString("utf-8");
    return obj;
  };

  if (data.status && data.status.id > 2) {
    return decodeFields(data);
  }

  const token = data.token;
  if (!token) throw new Error("Judge0 returned neither a result nor a token");

  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 1500));
    const poll = await fetch(`${JUDGE0_URL}/submissions/${token}?base64_encoded=true`);
    data = await poll.json();
    if (data.status && data.status.id > 2) {
      return decodeFields(data);
    }
  }

  throw new Error("Judge0 timed out waiting for result");
};

// ── Main evaluate function ───────────────────────────────────────────
export const evaluateCode = async (code, language, testCases, timeLimit = 5, memoryLimit = 256, functionMetadata = null) => {
  if (!testCases || testCases.length === 0) {
    console.warn("[Judge] 0 test cases — nothing to evaluate.");
    return {
      success: false,
      verdict: "No Test Cases",
      passedTestCases: 0,
      totalTestCases: 0,
      executionTime: "0 ms",
      memoryUsed: "0 MB",
      detailedResults: [],
      compilerOutput: "No test cases configured for this problem. Ask the admin to add visible test cases.",
      complexityEstimate: estimateComplexity(code),
      failedTestCaseIndex: -1,
      score: 0,
    };
  }

  const langId = LANGUAGE_IDS[language.toLowerCase()] || 93;
  const executableCode = wrapCodeIfNeeded(code, language, functionMetadata);
  const results = [];
  let passedCount = 0;
  let overallVerdict = "Accepted";
  let totalTime = 0;
  let maxMemory = 0;
  let compilerOutput = "";
  let failedIndex = -1;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const expectedOut = tc.output ?? tc.expectedOutput ?? "";

    try {
      const data = await runOnJudge0(
        executableCode, langId, tc.input || "", expectedOut, timeLimit, memoryLimit
      );

      const statusId = data.status?.id ?? 0;
      const statusDesc = data.status?.description || "Unknown";
      const actualOutput = data.stdout ? normalizeOutput(data.stdout) : "";
      const stderr = data.stderr ? normalizeOutput(data.stderr) : "";

      if (data.compile_output) compilerOutput = data.compile_output;

      const timeTaken = parseFloat(data.time || 0);
      const memUsed = parseFloat(data.memory || 0) / 1024;
      totalTime += timeTaken;
      maxMemory = Math.max(maxMemory, memUsed);

      // Judge0 status 3 = Accepted
      const isPassed = statusId === 3;

      if (!isPassed && failedIndex === -1) {
        failedIndex = i;
        if (statusDesc.includes("Wrong Answer")) overallVerdict = "Wrong Answer";
        else if (statusDesc.includes("Time Limit")) overallVerdict = "Time Limit Exceeded";
        else if (statusDesc.includes("Memory Limit")) overallVerdict = "Memory Limit Exceeded";
        else if (statusDesc.includes("Runtime Error")) overallVerdict = "Runtime Error";
        else if (statusDesc.includes("Compilation")) overallVerdict = "Compilation Error";
        else overallVerdict = statusDesc;
      }

      if (isPassed) passedCount++;

      results.push({
        input: tc.input || "",
        expected: expectedOut,
        actual: actualOutput || stderr || data.message || "",
        passed: isPassed,
        status: statusDesc,
        time: `${(timeTaken * 1000).toFixed(0)} ms`,
        memory: `${memUsed.toFixed(2)} MB`,
        isHidden: tc.isHidden || false,
      });

    } catch (err) {
      console.error(`[Judge0] TC ${i + 1} error:`, err.message);
      results.push({
        input: tc.input || "",
        expected: expectedOut,
        actual: `Error: ${err.message}`,
        passed: false,
        status: "Internal Error",
        time: "0 ms",
        memory: "0 MB",
        isHidden: tc.isHidden || false,
      });
      if (failedIndex === -1) { failedIndex = i; overallVerdict = "Internal Error"; }
    }
  }

  return {
    success: true,
    verdict: passedCount === testCases.length ? "Accepted" : overallVerdict,
    passedTestCases: passedCount,
    totalTestCases: testCases.length,
    executionTime: `${(totalTime * 1000).toFixed(0)} ms`,
    memoryUsed: `${maxMemory.toFixed(2)} MB`,
    detailedResults: results,
    compilerOutput,
    complexityEstimate: estimateComplexity(code),
    failedTestCaseIndex: failedIndex,
    score: passedCount === testCases.length ? 100 : 0,
  };
};
