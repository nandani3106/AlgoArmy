import { useState } from "react";
import { Plus } from "lucide-react";

export default function Contests() {
  const [contests, setContests] = useState([]);

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

  const availableProblems = [
    "Two Sum",
    "Binary Search",
    "Merge Intervals",
    "Graph Traversal",
    "DP Knapsack",
  ];

  const handleChange = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const toggleProblem = (problem) => {
    if (form.selectedProblems.includes(problem)) {
      handleChange(
        "selectedProblems",
        form.selectedProblems.filter(
          (p) => p !== problem
        )
      );
    } else {
      handleChange(
        "selectedProblems",
        [...form.selectedProblems, problem]
      );
    }
  };

  const handleCreate = () => {
    if (!form.title) return;

    setContests([...contests, form]);
    alert("Contest created!");
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">
        Contest Management
      </h1>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">

        {/* Basic Info */}
        <h2 className="text-xl font-semibold mb-6">
          Create New Contest
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="Contest Title"
            value={form.title}
            onChange={(e) =>
              handleChange("title", e.target.value)
            }
            className="border rounded-xl px-4 py-3"
          />

          <select
            value={form.type}
            onChange={(e) =>
              handleChange("type", e.target.value)
            }
            className="border rounded-xl px-4 py-3"
          >
            <option>Public</option>
            <option>Private</option>
            <option>Invite Only</option>
          </select>

          <select
            value={form.difficulty}
            onChange={(e) =>
              handleChange(
                "difficulty",
                e.target.value
              )
            }
            className="border rounded-xl px-4 py-3"
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <input
            type="number"
            placeholder="Duration (min)"
            value={form.duration}
            onChange={(e) =>
              handleChange(
                "duration",
                e.target.value
              )
            }
            className="border rounded-xl px-4 py-3"
          />
        </div>

        <textarea
          placeholder="Contest Description"
          rows={4}
          value={form.description}
          onChange={(e) =>
            handleChange(
              "description",
              e.target.value
            )
          }
          className="w-full border rounded-xl px-4 py-3 mt-4"
        />

        {/* Dates */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <input
            type="datetime-local"
            value={form.startDate}
            onChange={(e) =>
              handleChange(
                "startDate",
                e.target.value
              )
            }
            className="border rounded-xl px-4 py-3"
          />

          <input
            type="datetime-local"
            value={form.endDate}
            onChange={(e) =>
              handleChange(
                "endDate",
                e.target.value
              )
            }
            className="border rounded-xl px-4 py-3"
          />
        </div>

        {/* Select Problems */}
        <h3 className="text-lg font-semibold mt-8 mb-4">
          Select DSA Problems
        </h3>

        <div className="grid md:grid-cols-2 gap-3">
          {availableProblems.map((problem) => (
            <label
              key={problem}
              className="flex items-center gap-2"
            >
              <input
                type="checkbox"
                checked={form.selectedProblems.includes(
                  problem
                )}
                onChange={() =>
                  toggleProblem(problem)
                }
              />
              {problem}
            </label>
          ))}
        </div>

        {/* Contest Rules */}
        <h3 className="text-lg font-semibold mt-8 mb-4">
          Contest Rules
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={form.liveLeaderboard}
              onChange={() =>
                handleChange(
                  "liveLeaderboard",
                  !form.liveLeaderboard
                )
              }
            />
            Live Leaderboard
          </label>

          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={form.freezeLeaderboard}
              onChange={() =>
                handleChange(
                  "freezeLeaderboard",
                  !form.freezeLeaderboard
                )
              }
            />
            Freeze Leaderboard
          </label>

          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={form.wrongPenalty}
              onChange={() =>
                handleChange(
                  "wrongPenalty",
                  !form.wrongPenalty
                )
              }
            />
            Wrong Submission Penalty
          </label>

          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={form.partialScoring}
              onChange={() =>
                handleChange(
                  "partialScoring",
                  !form.partialScoring
                )
              }
            />
            Partial Scoring
          </label>

          <input
            type="number"
            placeholder="Max submissions/problem"
            value={form.maxSubmissions}
            onChange={(e) =>
              handleChange(
                "maxSubmissions",
                e.target.value
              )
            }
            className="border rounded-xl px-4 py-3"
          />

          <select
            value={form.status}
            onChange={(e) =>
              handleChange("status", e.target.value)
            }
            className="border rounded-xl px-4 py-3"
          >
            <option>Draft</option>
            <option>Published</option>
            <option>Live</option>
          </select>
        </div>

        <button
          onClick={handleCreate}
          className="mt-8 bg-orange-500 text-white px-6 py-3 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} />
          Create Contest
        </button>
      </div>

      <div className="mt-6 text-slate-600">
        Total Contests: {contests.length}
      </div>
    </>
  );
}