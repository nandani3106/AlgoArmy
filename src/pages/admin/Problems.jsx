import { useState, useEffect } from "react";
import { Plus, Wand2, Trash2, Edit3, Eye, EyeOff, PlusCircle, X, Save, ChevronDown, ChevronUp, Lock, Unlock } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  fetchLeetCode,
  createProblem,
  updateProblem,
  deleteProblemApi,
  getProblems,
} from "../../api/problemApi";

const EMPTY_FORM = {
  title: "",
  difficulty: "Easy",
  tag: "Array",
  leetcodeLink: "",
  description: "",
  constraints: "",
  sampleInput: "",
  sampleOutput: "",
  starterCpp: "",
  starterPython: "",
  starterJava: "",
  starterJs: "",
  points: 100,
  status: "Draft",
  testCases: [{ input: "", output: "" }],
  hiddenTestCases: [{ input: "", output: "" }],
};

// ── Defined OUTSIDE Problems to prevent remount on each keystroke ──
function TestCaseRow({ type, idx, tc, isHidden, isDark, canRemove, onRemove, onUpdate }) {
  const inputCls = `w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all ${isDark
      ? "bg-[#1a1d2b] border-[#2d3348] text-slate-200 placeholder:text-slate-500 focus:border-orange-500/60"
      : "bg-white border-slate-300 text-slate-800 focus:border-orange-400"
    }`;
  const labelCls = `block text-xs font-semibold uppercase tracking-widest mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"
    }`;

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 ${isHidden
          ? isDark
            ? "bg-purple-900/10 border-purple-700/30"
            : "bg-purple-50 border-purple-200"
          : isDark
            ? "bg-[#1a1d2b] border-[#2d3348]"
            : "bg-slate-50 border-slate-200"
        }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 ${isHidden
              ? isDark ? "text-purple-400" : "text-purple-600"
              : isDark ? "text-slate-400" : "text-slate-500"
            }`}
        >
          {isHidden ? <Lock size={11} /> : <Unlock size={11} />}
          {isHidden ? "Hidden " : ""}Test Case {idx + 1}
        </span>
        {canRemove && (
          <button
            onClick={() => onRemove(type, idx)}
            className="p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-500/10 transition-all"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Input</label>
          <textarea
            rows={3}
            value={tc.input}
            onChange={(e) => onUpdate(type, idx, "input", e.target.value)}
            placeholder={`stdin for test case ${idx + 1}`}
            className={`${inputCls} font-mono text-xs`}
          />
        </div>
        <div>
          <label className={labelCls}>Expected Output</label>
          <textarea
            rows={3}
            value={tc.output}
            onChange={(e) => onUpdate(type, idx, "output", e.target.value)}
            placeholder={`expected stdout for test case ${idx + 1}`}
            className={`${inputCls} font-mono text-xs`}
          />
        </div>
      </div>
    </div>
  );
}

export default function Problems() {
  const { isDark } = useTheme();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [expandedSection, setExpandedSection] = useState("basic"); // basic | testcases | hidden | starter

  const [form, setForm] = useState(EMPTY_FORM);

  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("All");

  const allTags = ["All", ...new Set(problems.flatMap(p => {
    const pt = Array.isArray(p.tags) ? p.tags : p.tag ? [p.tag] : [];
    return pt.filter(Boolean);
  }))];

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDifficulty = difficultyFilter === "All" || problem.difficulty === difficultyFilter;

    const pTags = Array.isArray(problem.tags) ? problem.tags : problem.tag ? [problem.tag] : [];
    const matchesTag = tagFilter === "All" || pTags.some(t => t.toLowerCase() === tagFilter.toLowerCase());

    return matchesSearch && matchesDifficulty && matchesTag;
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
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ── Test Case helpers ──────────────────────────────────
  const addTestCase = (type) => {
    setForm((prev) => ({
      ...prev,
      [type]: [...prev[type], { input: "", output: "" }],
    }));
  };

  const removeTestCase = (type, idx) => {
    setForm((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== idx),
    }));
  };

  const updateTestCase = (type, idx, field, value) => {
    setForm((prev) => {
      const updated = [...prev[type]];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, [type]: updated };
    });
  };

  // ── Strip HTML ─────────────────────────────────────────
  const cleanHTML = (html) => {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
  };

  // ── Auto-fill from LeetCode ────────────────────────────
  const handleAutoFill = async () => {
    if (!form.leetcodeLink) {
      alert("Please paste a LeetCode link first");
      return;
    }
    try {
      setLoading(true);
      const res = await fetchLeetCode(form.leetcodeLink);
      const data = res.data;

      const importedTC = (data.testCases || []).map((tc) => ({
        input: tc.input || "",
        output: tc.output || "",
      }));

      setForm((prev) => ({
        ...prev,
        title: data.title || "",
        difficulty: data.difficulty || "Easy",
        tag: data.tags?.[0] || "Array",
        description: cleanHTML(data.description),
        constraints: data.constraints || "",
        sampleInput: data.sampleInput || "",
        sampleOutput: data.sampleOutput || "",
        starterCpp: data.starterCode?.cpp || "",
        starterPython: data.starterCode?.python || "",
        starterJava: data.starterCode?.java || "",
        starterJs: data.starterCode?.javascript || "",
        testCases: importedTC.length > 0 ? importedTC : [{ input: "", output: "" }],
      }));

      alert("Problem auto-filled! Review & add hidden test cases manually.");
    } catch (error) {
      console.log(error);
      alert("Failed to fetch LeetCode problem");
    } finally {
      setLoading(false);
    }
  };

  // ── Create / Update ────────────────────────────────────
  const handleSave = async () => {
    if (!form.title || !form.description) {
      alert("Please fill in Title and Description");
      return;
    }

    const visibleTC = form.testCases.filter((tc) => tc.input.trim());
    const hiddenTC = form.hiddenTestCases.filter((tc) => tc.input.trim());

    if (visibleTC.length === 0) {
      alert("Add at least one visible test case with input");
      return;
    }

    try {
      const payload = { ...form, testCases: visibleTC, hiddenTestCases: hiddenTC };

      if (editingId) {
        const res = await updateProblem(editingId, payload);
        setProblems((prev) =>
          prev.map((p) => (p._id === editingId ? res.data : p))
        );
        alert("Problem updated!");
      } else {
        const res = await createProblem(payload);
        setProblems((prev) => [...prev, res.data]);
        alert("Problem created!");
      }

      resetForm();
    } catch (error) {
      console.log(error);
      alert("Failed to save problem");
    }
  };

  const handleEdit = (problem) => {
    setEditingId(problem._id);
    setForm({
      title: problem.title || "",
      difficulty: problem.difficulty || "Easy",
      tag: problem.tags?.[0] || "Array",
      leetcodeLink: problem.leetcodeLink || "",
      description: problem.description || problem.statement || "",
      constraints: Array.isArray(problem.constraints)
        ? problem.constraints.join("\n")
        : problem.constraints || "",
      sampleInput: problem.sampleInput || "",
      sampleOutput: problem.sampleOutput || "",
      starterCpp: problem.starterCode?.cpp || "",
      starterPython: problem.starterCode?.python || "",
      starterJava: problem.starterCode?.java || "",
      starterJs: problem.starterCode?.javascript || "",
      points: problem.points || 100,
      status: problem.status || "Draft",
      testCases:
        problem.testCases?.length > 0
          ? problem.testCases.map((tc) => ({ input: tc.input || "", output: tc.output || tc.expectedOutput || "" }))
          : [{ input: "", output: "" }],
      hiddenTestCases:
        problem.hiddenTestCases?.length > 0
          ? problem.hiddenTestCases.map((tc) => ({ input: tc.input || "", output: tc.output || "" }))
          : [{ input: "", output: "" }],
    });
    setShowForm(true);
    setExpandedSection("basic");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this problem permanently?")) return;
    try {
      await deleteProblemApi(id);
      setProblems((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      alert("Failed to delete problem");
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setExpandedSection("basic");
  };

  // ── Styles ─────────────────────────────────────────────
  const card = `rounded-2xl border ${isDark ? "bg-[#151823] border-[#1e293b]" : "bg-white border-slate-200"}`;
  const inputCls = `w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all ${isDark
      ? "bg-[#1a1d2b] border-[#2d3348] text-slate-200 placeholder:text-slate-500 focus:border-orange-500/60"
      : "bg-white border-slate-300 text-slate-800 focus:border-orange-400"
    }`;
  const labelCls = `block text-xs font-semibold uppercase tracking-widest mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`;
  const sectionBtn = (active) =>
    `flex items-center justify-between w-full px-5 py-4 rounded-xl font-semibold text-sm transition-all ${active
      ? isDark
        ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
        : "bg-orange-50 text-orange-600 border border-orange-200"
      : isDark
        ? "bg-[#1a1d2b] text-slate-300 border border-[#2d3348] hover:border-orange-500/30"
        : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-orange-300"
    }`;


  const diffColor = (d) =>
    d === "Easy" ? "text-emerald-400" : d === "Medium" ? "text-yellow-400" : "text-red-400";

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : ""}`}>
          DSA Problem Management
        </h1>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-orange-500/20"
          >
            <Plus size={16} /> New Problem
          </button>
        )}
      </div>

      {/* ── FORM ─────────────────────────────────────────── */}
      {showForm && (
        <div className={`${card} p-6 mb-8 shadow-xl`}>
          {/* Form Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${isDark ? "text-white" : ""}`}>
              {editingId ? "✏️ Edit Problem" : "✨ Add New Problem"}
            </h2>
            <button onClick={resetForm} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3">

            {/* ── SECTION 1: Basic Info ── */}
            <button className={sectionBtn(expandedSection === "basic")} onClick={() => setExpandedSection(expandedSection === "basic" ? "" : "basic")}>
              <span>📋 Basic Information</span>
              {expandedSection === "basic" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {expandedSection === "basic" && (
              <div className={`${card} p-5 space-y-4`}>
                {/* Title + LeetCode */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Problem Title *</label>
                    <input type="text" placeholder="e.g. Two Sum" value={form.title} onChange={(e) => handleChange("title", e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>LeetCode Link (for Auto-fill)</label>
                    <div className="flex gap-2">
                      <input type="text" placeholder="https://leetcode.com/problems/..." value={form.leetcodeLink} onChange={(e) => handleChange("leetcodeLink", e.target.value)} className={`${inputCls} flex-1`} />
                      <button onClick={handleAutoFill} disabled={loading} className="px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 text-sm font-semibold transition-all disabled:opacity-50 whitespace-nowrap">
                        <Wand2 size={14} /> {loading ? "Filling..." : "Auto-fill"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Difficulty + Tag + Points + Status */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className={labelCls}>Difficulty</label>
                    <select value={form.difficulty} onChange={(e) => handleChange("difficulty", e.target.value)} className={inputCls}>
                      <option>Easy</option><option>Medium</option><option>Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Tag</label>
                    <select value={form.tag} onChange={(e) => handleChange("tag", e.target.value)} className={inputCls}>
                      <option>Array</option><option>String</option><option>DP</option>
                      <option>Graph</option><option>Tree</option><option>Backtracking</option>
                      <option>Math</option><option>Greedy</option><option>Hash Table</option>
                      <option>Two Pointers</option><option>Binary Search</option><option>Stack</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Points</label>
                    <input type="number" value={form.points} onChange={(e) => handleChange("points", Number(e.target.value))} className={inputCls} min={10} max={1000} />
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select value={form.status} onChange={(e) => handleChange("status", e.target.value)} className={inputCls}>
                      <option>Draft</option><option>Published</option>
                    </select>
                  </div>
                </div>

                {/* Description + Constraints */}
                <div>
                  <label className={labelCls}>Problem Description *</label>
                  <textarea rows={6} value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Full problem statement..." className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Constraints (one per line)</label>
                  <textarea rows={3} value={form.constraints} onChange={(e) => handleChange("constraints", e.target.value)} placeholder={"1 <= n <= 10^5\n0 <= nums[i] <= 1000"} className={`${inputCls} font-mono`} />
                </div>
              </div>
            )}

            {/* ── SECTION 2: Visible Test Cases ── */}
            <button
              className={sectionBtn(expandedSection === "testcases")}
              onClick={() => setExpandedSection(expandedSection === "testcases" ? "" : "testcases")}
            >
              <span className="flex items-center gap-2">
                <Eye size={15} /> Visible Test Cases
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${isDark ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-700"}`}>
                  {form.testCases.length}
                </span>
              </span>
              {expandedSection === "testcases" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {expandedSection === "testcases" && (
              <div className={`${card} p-5 space-y-4`}>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  🟢 These test cases are shown to candidates when they click <strong>Run Code</strong>. Input/output is visible.
                </p>
                <div className="space-y-3">
                  {form.testCases.map((tc, idx) => (
                    <TestCaseRow
                      key={idx}
                      type="testCases"
                      idx={idx}
                      tc={tc}
                      isHidden={false}
                      isDark={isDark}
                      canRemove={form.testCases.length > 1}
                      onRemove={removeTestCase}
                      onUpdate={updateTestCase}
                    />
                  ))}
                </div>
                <button
                  onClick={() => addTestCase("testCases")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-dashed transition-all ${isDark
                      ? "border-green-500/30 text-green-400 hover:border-green-500/60 hover:bg-green-500/5"
                      : "border-green-300 text-green-600 hover:border-green-500 hover:bg-green-50"
                    }`}
                >
                  <PlusCircle size={15} /> Add Test Case
                </button>
              </div>
            )}

            {/* ── SECTION 3: Hidden Test Cases ── */}
            <button
              className={sectionBtn(expandedSection === "hidden")}
              onClick={() => setExpandedSection(expandedSection === "hidden" ? "" : "hidden")}
            >
              <span className="flex items-center gap-2">
                <EyeOff size={15} /> Hidden Test Cases
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700"}`}>
                  {form.hiddenTestCases.length}
                </span>
              </span>
              {expandedSection === "hidden" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {expandedSection === "hidden" && (
              <div className={`${card} p-5 space-y-4`}>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  🔒 These test cases are <strong>never shown</strong> to candidates. They are checked only on <strong>Submit</strong>. Input/output stays hidden in results.
                </p>
                <div className="space-y-3">
                  {form.hiddenTestCases.map((tc, idx) => (
                    <TestCaseRow
                      key={idx}
                      type="hiddenTestCases"
                      idx={idx}
                      tc={tc}
                      isHidden={true}
                      isDark={isDark}
                      canRemove={form.hiddenTestCases.length > 1}
                      onRemove={removeTestCase}
                      onUpdate={updateTestCase}
                    />
                  ))}
                </div>
                <button
                  onClick={() => addTestCase("hiddenTestCases")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-dashed transition-all ${isDark
                      ? "border-purple-500/30 text-purple-400 hover:border-purple-500/60 hover:bg-purple-500/5"
                      : "border-purple-300 text-purple-600 hover:border-purple-500 hover:bg-purple-50"
                    }`}
                >
                  <PlusCircle size={15} /> Add Hidden Test Case
                </button>
              </div>
            )}

            {/* ── SECTION 4: Starter Code ── */}
            <button
              className={sectionBtn(expandedSection === "starter")}
              onClick={() => setExpandedSection(expandedSection === "starter" ? "" : "starter")}
            >
              <span>{"</>"} Starter Code Templates</span>
              {expandedSection === "starter" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {expandedSection === "starter" && (
              <div className={`${card} p-5 grid md:grid-cols-2 gap-4`}>
                {[
                  { label: "C++", field: "starterCpp" },
                  { label: "Python", field: "starterPython" },
                  { label: "Java", field: "starterJava" },
                  { label: "JavaScript", field: "starterJs" },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <label className={labelCls}>{label}</label>
                    <textarea rows={6} value={form[field]} onChange={(e) => handleChange(field, e.target.value)} placeholder={`${label} starter code...`} className={`${inputCls} font-mono text-xs`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save / Cancel */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-[#1e293b]">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20"
            >
              <Save size={15} />
              {editingId ? "Update Problem" : "Save Problem"}
            </button>
            <button
              onClick={resetForm}
              className={`px-5 py-3 rounded-xl font-semibold text-sm border transition-all ${isDark ? "border-[#2d3348] text-slate-400 hover:text-white hover:bg-white/5" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── PROBLEMS LIST ─────────────────────────────────── */}
      <div className="mt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className={`text-2xl font-bold ${isDark ? "text-white" : ""}`}>
            Problems Library
            <span className={`ml-3 text-base font-normal ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {problems.length !== filteredProblems.length ? (
                `(${filteredProblems.length} filtered of ${problems.length} total)`
              ) : (
                `(${problems.length} total)`
              )}
            </span>
          </h2>
        </div>

        {/* Search & Filter Options */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search problems by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none text-sm transition-all ${isDark
                  ? "bg-[#1a1d2b] border-[#2d3348] text-slate-200 placeholder:text-slate-500 focus:border-orange-500/60"
                  : "bg-white border-slate-300 text-slate-800 focus:border-orange-400"
                }`}
            />
            <div className="absolute left-3 top-3.5 text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <div className="flex-1 md:flex-none">
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className={`w-full md:w-48 px-3 py-2.5 rounded-xl border outline-none text-sm transition-all ${isDark
                    ? "bg-[#1a1d2b] border-[#2d3348] text-slate-200 focus:border-orange-500/60"
                    : "bg-white border-slate-300 text-slate-800 focus:border-orange-400"
                  }`}
              >
                <option value="All">All Categories</option>
                {allTags.filter(t => t !== "All").map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="flex-1 md:flex-none">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className={`w-full md:w-40 px-3 py-2.5 rounded-xl border outline-none text-sm transition-all ${isDark
                    ? "bg-[#1a1d2b] border-[#2d3348] text-slate-200 focus:border-orange-500/60"
                    : "bg-white border-slate-300 text-slate-800 focus:border-orange-400"
                  }`}
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {filteredProblems.length === 0 && (
          <div className={`${card} p-12 text-center`}>
            <p className={`text-lg ${isDark ? "text-slate-400" : "text-slate-500"}`}>No problems found matching filters.</p>
          </div>
        )}

        <div className="space-y-3">
          {filteredProblems.map((problem) => (
            <div
              key={problem._id}
              className={`${card} p-5 flex items-center gap-4 hover:border-orange-500/30 transition-all group`}
            >
              {/* Difficulty badge */}
              <div className={`w-2 h-14 rounded-full flex-shrink-0 ${problem.difficulty === "Easy" ? "bg-emerald-500" :
                  problem.difficulty === "Medium" ? "bg-yellow-500" : "bg-red-500"
                }`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`font-bold text-base truncate ${isDark ? "text-white" : ""}`}>
                    {problem.title}
                  </h3>
                  <span className={`text-xs font-bold ${diffColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                  {problem.status === "Published" ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">Published</span>
                  ) : (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isDark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}>Draft</span>
                  )}
                </div>

                <div className={`flex items-center gap-3 mt-1 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  <span>{problem.tags?.[0] || "—"}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye size={11} className="text-green-400" />
                    {problem.testCases?.length || 0} test cases
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <EyeOff size={11} className="text-purple-400" />
                    {problem.hiddenTestCases?.length || 0} hidden
                  </span>
                  <span>·</span>
                  <span>{problem.points || 100} pts</span>
                </div>

                <p className={`mt-1 text-xs truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {cleanHTML(problem.description).slice(0, 120)}...
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                <button
                  onClick={() => handleEdit(problem)}
                  className={`p-2 rounded-lg transition-all ${isDark ? "hover:bg-orange-500/10 text-slate-400 hover:text-orange-400" : "hover:bg-orange-50 text-slate-400 hover:text-orange-500"}`}
                  title="Edit problem"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(problem._id)}
                  className={`p-2 rounded-lg transition-all ${isDark ? "hover:bg-red-500/10 text-slate-400 hover:text-red-400" : "hover:bg-red-50 text-slate-400 hover:text-red-500"}`}
                  title="Delete problem"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}