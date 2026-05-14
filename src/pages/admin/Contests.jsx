import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getProblems } from "../../api/problemApi";
import { createContest, getContests } from "../../api/contestApi";

export default function Contests() {
  const { isDark } = useTheme();

  const [contests, setContests] = useState([]);
  const [allProblems, setAllProblems] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    type: "Public",
    startDate: "",
    endDate: "",
    duration: "",
    selectedProblems: [],
    liveLeaderboard: true,
    freezeLeaderboard: false,
    maxSubmissions: 10,
    wrongPenalty: false,
    partialScoring: true,
    status: "Draft",
  });

  // ================= LOAD DATA =================
  useEffect(() => {
    loadProblems();
    loadContests();
  }, []);

  const loadProblems = async () => {
    try {
      const res = await getProblems();
      setAllProblems(res.data);
    } catch (err) {
      console.log("Error fetching problems:", err);
    }
  };

  const loadContests = async () => {
    try {
      const res = await getContests();
      setContests(res.data);
    } catch (err) {
      console.log("Error fetching contests:", err);
    }
  };

  // ================= FORM =================
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ================= TOGGLE PROBLEM =================
  const toggleProblem = (id) => {
    setForm((prev) => {
      const exists = prev.selectedProblems.includes(id);

      return {
        ...prev,
        selectedProblems: exists
          ? prev.selectedProblems.filter((p) => p !== id)
          : [...prev.selectedProblems, id],
      };
    });
  };

  // ================= CREATE CONTEST (🔥 FIXED) =================
  const handleCreate = async () => {
    if (!form.title) {
      alert("Title required");
      return;
    }

    try {
      const res = await createContest(form);

      // refresh from DB (IMPORTANT)
      await loadContests();

      alert("Contest saved to MongoDB!");

      // reset form
      setForm({
        title: "",
        description: "",
        difficulty: "Easy",
        type: "Public",
        startDate: "",
        endDate: "",
        duration: "",
        selectedProblems: [],
        liveLeaderboard: true,
        freezeLeaderboard: false,
        maxSubmissions: 10,
        wrongPenalty: false,
        partialScoring: true,
        status: "Draft",
      });
    } catch (err) {
      console.log("Create contest error:", err);
      alert("Failed to create contest");
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
        Contest Management
      </h1>

      {/* ================= FORM ================= */}
      <div
        className={`rounded-2xl p-6 shadow-sm border ${
          isDark
            ? "bg-[#151823] border-[#1e293b]"
            : "bg-white border-slate-200"
        }`}
      >
        <h2 className={`text-xl font-semibold mb-6 ${isDark ? "text-white" : ""}`}>
          Create New Contest
        </h2>

        {/* BASIC INPUTS */}
        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="Contest Title"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className={inputClass}
          />

          <select
            value={form.type}
            onChange={(e) => handleChange("type", e.target.value)}
            className={inputClass}
          >
            <option>Public</option>
            <option>Private</option>
            <option>Invite Only</option>
          </select>

          <select
            value={form.difficulty}
            onChange={(e) => handleChange("difficulty", e.target.value)}
            className={inputClass}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <input
            type="number"
            placeholder="Duration (min)"
            value={form.duration}
            onChange={(e) => handleChange("duration", e.target.value)}
            className={inputClass}
          />
        </div>

        <textarea
          placeholder="Contest Description"
          rows={4}
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className={`w-full mt-4 ${inputClass}`}
        />

        {/* DATES */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <input
            type="datetime-local"
            value={form.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
            className={inputClass}
          />

          <input
            type="datetime-local"
            value={form.endDate}
            onChange={(e) => handleChange("endDate", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* ================= PROBLEM SELECTOR ================= */}
        <h3 className={`text-lg font-semibold mt-8 mb-4 ${isDark ? "text-white" : ""}`}>
          Select DSA Problems
        </h3>

        <div className="border rounded-xl p-4 max-h-64 overflow-y-auto">
          {allProblems.map((problem) => (
            <label
              key={problem._id}
              className={`flex items-center justify-between p-2 border-b ${
                isDark ? "text-slate-300" : ""
              }`}
            >
              <div>
                <p className="font-medium">{problem.title}</p>
                <p className="text-sm text-gray-500">
                  {problem.tag} • {problem.difficulty}
                </p>
              </div>

              <input
                type="checkbox"
                checked={form.selectedProblems.includes(problem._id)}
                onChange={() => toggleProblem(problem._id)}
              />
            </label>
          ))}
        </div>

        {/* ================= RULES ================= */}
        <h3 className={`text-lg font-semibold mt-8 mb-4 ${isDark ? "text-white" : ""}`}>
          Contest Rules
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={form.liveLeaderboard}
              onChange={() =>
                handleChange("liveLeaderboard", !form.liveLeaderboard)
              }
            />
            Live Leaderboard
          </label>

          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={form.freezeLeaderboard}
              onChange={() =>
                handleChange("freezeLeaderboard", !form.freezeLeaderboard)
              }
            />
            Freeze Leaderboard
          </label>

          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={form.wrongPenalty}
              onChange={() =>
                handleChange("wrongPenalty", !form.wrongPenalty)
              }
            />
            Wrong Penalty
          </label>

          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={form.partialScoring}
              onChange={() =>
                handleChange("partialScoring", !form.partialScoring)
              }
            />
            Partial Scoring
          </label>

          <input
            type="number"
            placeholder="Max submissions/problem"
            value={form.maxSubmissions}
            onChange={(e) =>
              handleChange("maxSubmissions", e.target.value)
            }
            className={inputClass}
          />

          <select
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className={inputClass}
          >
            <option>Draft</option>
            <option>Published</option>
            <option>Live</option>
          </select>
        </div>

        {/* CREATE BUTTON */}
        <button
          onClick={handleCreate}
          className="mt-8 bg-orange-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-orange-600 transition"
        >
          <Plus size={18} />
          Create Contest
        </button>
      </div>

      {/* ================= CONTEST LIST ================= */}
      <div className="mt-10">
        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? "text-white" : ""}`}>
          Your Contests ({contests.length})
        </h2>

        {contests.length === 0 ? (
          <p className="text-gray-500">No contests found</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {contests.map((contest) => (
              <div
                key={contest._id}
                className={`p-4 rounded-xl border ${
                  isDark
                    ? "bg-[#151823] border-[#1e293b] text-white"
                    : "bg-white"
                }`}
              >
                <h3 className="text-lg font-bold">{contest.title}</h3>

                <p className="text-sm text-gray-500 mt-1">
                  {contest.type} • {contest.difficulty}
                </p>

                <p className="mt-2">
                  Status: <b>{contest.status}</b>
                </p>

                <p className="text-sm mt-1">
                  Problems: {contest.selectedProblems?.length || 0}
                </p>

                <div className="text-xs text-gray-400 mt-2">
                  <p>Start: {contest.startDate || "N/A"}</p>
                  <p>End: {contest.endDate || "N/A"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}