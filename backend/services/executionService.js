/**
 * Mock Code Execution Service
 * Simulates code execution against test cases.
 * Can be replaced with Judge0 or any other judge API in the future.
 */

export const executeCode = async (code, language, testCases) => {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const results = [];
  let passedCount = 0;

  // Mock outputs based on some keywords or just random pass/fail
  // In a real mock, you'd try to "parse" simple code, but here we'll just simulate
  for (const tc of testCases) {
    const isCompilationError = code.toLowerCase().includes("compile_error");
    const isRuntimeError = code.toLowerCase().includes("runtime_error");
    const isTimeLimit = code.toLowerCase().includes("tle_error");
    
    if (isCompilationError) {
      return {
        success: false,
        status: "Compilation Error",
        error: "SyntaxError: Unexpected token ')'",
        executionTime: "0 ms",
        memoryUsed: "0 MB",
      };
    }

    if (isRuntimeError) {
      return {
        success: false,
        status: "Runtime Error",
        error: "ZeroDivisionError: division by zero",
        executionTime: "12 ms",
        memoryUsed: "4 MB",
      };
    }

    if (isTimeLimit) {
      return {
        success: false,
        status: "Time Limit Exceeded",
        error: "Execution timed out after 2000ms",
        executionTime: "> 2000 ms",
        memoryUsed: "15 MB",
      };
    }

    // Default: Simulate some logic
    // If code contains "correct", we pass all
    // If code is empty, we fail all
    const passed = code.length > 20 && !code.toLowerCase().includes("fail");
    
    if (passed) passedCount++;

    results.push({
      input: tc.input || "Sample Input",
      expected: tc.output || "Sample Output",
      actual: passed ? (tc.output || "Sample Output") : "Unexpected Output",
      passed: passed,
    });
  }

  const total = testCases.length || 1;
  const executionTime = `${Math.floor(Math.random() * 100) + 10} ms`;
  const memoryUsed = `${Math.floor(Math.random() * 20) + 5} MB`;
  
  return {
    success: true,
    status: passedCount === total ? "Accepted" : (passedCount > 0 ? "Partially Accepted" : "Wrong Answer"),
    passedTests: passedCount,
    totalTests: total,
    executionTime,
    memoryUsed,
    detailedResults: results,
    timeComplexity: "O(n)", // Mock estimate
    spaceComplexity: "O(1)", // Mock estimate
  };
};
