import { useState, useEffect } from "react";
import { Plus, Wand2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  fetchLeetCode,
  createProblem,
  getProblems,
} from "../../api/problemApi";

export default function Problems() {
  const { isDark } = useTheme();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    difficulty: "Easy",
    tag: "Array",
    leetcodeLink: "",
    description: "",
    constraints: "",
    sampleInput: "",
    sampleOutput: "",
    hiddenTestCase: "",

    // ✅ STARTER CODE TEMPLATES
    starterCpp: "",
    starterPython: "",
    starterJava: "",
    starterJs: "",

    points: 100,
    status: "Draft",
  });

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      const res = await getProblems();
      setProblems(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // AUTO FILL FROM LEETCODE
  const handleAutoFill = async () => {
    if (!form.leetcodeLink) {
      alert("Please paste LeetCode link first");
      return;
    }

    try {
      setLoading(true);

      const res = await fetchLeetCode(form.leetcodeLink);
      const data = res.data;

      setForm((prev) => ({
        ...prev,
        title: data.title || "",
        difficulty: data.difficulty || "Easy",
        tag: data.tags?.[0] || "Array",
        description: data.description || "",
        constraints: data.constraints || "",
        sampleInput: data.exampleInput || "",
        sampleOutput: data.exampleOutput || "",
        hiddenTestCase: data.hiddenTestCase || "",

        // ✅ AUTO FILL STARTER CODE
        starterCpp: data.starterCode?.cpp || "",
        starterPython: data.starterCode?.python || "",
        starterJava: data.starterCode?.java || "",
        starterJs: data.starterCode?.javascript || "",
      }));

      alert("Problem auto-filled successfully!");
    } catch (error) {
      console.log(error);
      alert("Failed to fetch LeetCode problem");
    } finally {
      setLoading(false);
    }
  };

  // SAVE TO MONGODB
  const handleCreate = async () => {
    if (!form.title || !form.description) {
      alert("Please fill title and description");
      return;
    }

    try {
      const res = await createProblem(form);

      setProblems([...problems, res.data]);

      alert("Problem saved to MongoDB!");

      setForm({
        title: "",
        difficulty: "Easy",
        tag: "Array",
        leetcodeLink: "",
        description: "",
        constraints: "",
        sampleInput: "",
        sampleOutput: "",
        hiddenTestCase: "",

        starterCpp: "",
        starterPython: "",
        starterJava: "",
        starterJs: "",

        points: 100,
        status: "Draft",
      });
    } catch (error) {
      console.log(error);
      alert("Failed to save problem");
    }
  };

  const inputClass = `border rounded-xl px-4 py-3 ${
    isDark
      ? "bg-[#1a1d2b] border-[#2d3348] text-slate-200 placeholder:text-slate-500"
      : "bg-white border-slate-300"
  }`;

  return (
    <>
      <h1 className={`text-3xl font-bold mb-8 ${isDark ? "text-white" : ""}`}>
        DSA Problem Management
      </h1>

      {/* FORM SECTION */}
      <div
        className={`rounded-2xl p-6 shadow-sm border ${
          isDark
            ? "bg-[#151823] border-[#1e293b]"
            : "bg-white border-slate-200"
        }`}
      >
        <h2 className={`text-xl font-semibold mb-6 ${isDark ? "text-white" : ""}`}>
          Add New Problem
        </h2>

        {/* BASIC INPUTS */}
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Problem Title"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className={inputClass}
          />

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="LeetCode Link"
              value={form.leetcodeLink}
              onChange={(e) => handleChange("leetcodeLink", e.target.value)}
              className={`flex-1 ${inputClass}`}
            />

            <button
              onClick={handleAutoFill}
              disabled={loading}
              className="bg-blue-600 text-white px-4 rounded-xl"
            >
              <Wand2 size={16} />
            </button>
          </div>

          <select
            value={form.difficulty}
            onChange={(e) => handleChange("difficulty", e.target.value)}
            className={inputClass}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <select
            value={form.tag}
            onChange={(e) => handleChange("tag", e.target.value)}
            className={inputClass}
          >
            <option>Array</option>
            <option>String</option>
            <option>DP</option>
            <option>Graph</option>
            <option>Tree</option>
          </select>
        </div>

        {/* DESCRIPTION */}
        <div className="mt-6 space-y-4">
          <textarea
            placeholder="Problem Description"
            rows={5}
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className={`w-full ${inputClass}`}
          />

          <textarea
            placeholder="Constraints"
            rows={3}
            value={form.constraints}
            onChange={(e) => handleChange("constraints", e.target.value)}
            className={`w-full ${inputClass}`}
          />

          <textarea
            placeholder="Sample Input"
            rows={3}
            value={form.sampleInput}
            onChange={(e) => handleChange("sampleInput", e.target.value)}
            className={`w-full ${inputClass}`}
          />

          <textarea
            placeholder="Sample Output"
            rows={3}
            value={form.sampleOutput}
            onChange={(e) => handleChange("sampleOutput", e.target.value)}
            className={`w-full ${inputClass}`}
          />

          <textarea
            placeholder="Hidden Test Cases"
            rows={3}
            value={form.hiddenTestCase}
            onChange={(e) => handleChange("hiddenTestCase", e.target.value)}
            className={`w-full ${inputClass}`}
          />
        </div>

        {/* ✅ STARTER CODE TEMPLATES */}
        <div className="mt-8 space-y-4">
          <h3 className={`text-lg font-semibold ${isDark ? "text-white" : ""}`}>
            Starter Code Templates
          </h3>

          <textarea
            placeholder="C++ Starter Code"
            rows={6}
            value={form.starterCpp}
            onChange={(e) => handleChange("starterCpp", e.target.value)}
            className={`w-full font-mono ${inputClass}`}
          />

          <textarea
            placeholder="Python Starter Code"
            rows={6}
            value={form.starterPython}
            onChange={(e) => handleChange("starterPython", e.target.value)}
            className={`w-full font-mono ${inputClass}`}
          />

          <textarea
            placeholder="Java Starter Code"
            rows={6}
            value={form.starterJava}
            onChange={(e) => handleChange("starterJava", e.target.value)}
            className={`w-full font-mono ${inputClass}`}
          />

          <textarea
            placeholder="JavaScript Starter Code"
            rows={6}
            value={form.starterJs}
            onChange={(e) => handleChange("starterJs", e.target.value)}
            className={`w-full font-mono ${inputClass}`}
          />
        </div>

        <button
          onClick={handleCreate}
          className="mt-8 bg-orange-500 text-white px-6 py-3 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} />
          Add Problem
        </button>
      </div>

      {/* PROBLEMS LIST */}
      <div className="mt-8">
        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? "text-white" : ""}`}>
          Uploaded Problems
        </h2>

        {problems.map((problem, index) => (
          <div
            key={index}
            className={`p-5 rounded-2xl border mb-4 ${
              isDark
                ? "bg-[#151823] border-[#1e293b]"
                : "bg-white"
            }`}
          >
            <h3 className={`font-semibold ${isDark ? "text-white" : ""}`}>
              {problem.title}
            </h3>

            <p className={isDark ? "text-slate-400" : ""}>
              {problem.tag} • {problem.difficulty}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}