import { useState } from "react";
import { Plus } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function Problems() {
  const { isDark } = useTheme();
  const [problems, setProblems] = useState([]);

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
    starterCpp: "",
    starterPython: "",
    starterJava: "",
    starterJs: "",
    points: 100,
    status: "Draft",
  });

  const handleChange = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const handleCreate = () => {
    if (!form.title || !form.description) return;

    setProblems([...problems, form]);

    alert("Problem added successfully!");

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
  };

  const inputClass = `border rounded-xl px-4 py-3 ${
    isDark
      ? 'bg-[#1a1d2b] border-[#2d3348] text-slate-200 placeholder:text-slate-500'
      : ''
  }`;

  return (
    <>
      <h1 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : ''}`}>
        DSA Problem Management
      </h1>

      {/* Form */}
      <div className={`rounded-2xl p-6 shadow-sm border ${
        isDark
          ? 'bg-[#151823] border-[#1e293b]'
          : 'bg-white border-slate-200'
      }`}>
        <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : ''}`}>
          Add New Problem
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          <input
            type="text"
            placeholder="Problem Title"
            value={form.title}
            onChange={(e) =>
              handleChange("title", e.target.value)
            }
            className={inputClass}
          />

          <input
            type="text"
            placeholder="LeetCode Link"
            value={form.leetcodeLink}
            onChange={(e) =>
              handleChange(
                "leetcodeLink",
                e.target.value
              )
            }
            className={inputClass}
          />

          <select
            value={form.difficulty}
            onChange={(e) =>
              handleChange(
                "difficulty",
                e.target.value
              )
            }
            className={inputClass}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <select
            value={form.tag}
            onChange={(e) =>
              handleChange("tag", e.target.value)
            }
            className={inputClass}
          >
            <option>Array</option>
            <option>String</option>
            <option>DP</option>
            <option>Graph</option>
            <option>Tree</option>
            <option>Greedy</option>
          </select>

          <input
            type="number"
            placeholder="Points"
            value={form.points}
            onChange={(e) =>
              handleChange(
                "points",
                e.target.value
              )
            }
            className={inputClass}
          />

          <select
            value={form.status}
            onChange={(e) =>
              handleChange(
                "status",
                e.target.value
              )
            }
            className={inputClass}
          >
            <option>Draft</option>
            <option>Published</option>
          </select>
        </div>

        {/* Text Areas */}
        <div className="mt-6 space-y-4">
          <textarea
            placeholder="Problem Description"
            rows={5}
            value={form.description}
            onChange={(e) =>
              handleChange(
                "description",
                e.target.value
              )
            }
            className={`w-full ${inputClass}`}
          />

          <textarea
            placeholder="Constraints"
            rows={3}
            value={form.constraints}
            onChange={(e) =>
              handleChange(
                "constraints",
                e.target.value
              )
            }
            className={`w-full ${inputClass}`}
          />

          <textarea
            placeholder="Sample Input"
            rows={3}
            value={form.sampleInput}
            onChange={(e) =>
              handleChange(
                "sampleInput",
                e.target.value
              )
            }
            className={`w-full ${inputClass}`}
          />

          <textarea
            placeholder="Sample Output"
            rows={3}
            value={form.sampleOutput}
            onChange={(e) =>
              handleChange(
                "sampleOutput",
                e.target.value
              )
            }
            className={`w-full ${inputClass}`}
          />

          <textarea
            placeholder="Hidden Test Cases"
            rows={3}
            value={form.hiddenTestCase}
            onChange={(e) =>
              handleChange(
                "hiddenTestCase",
                e.target.value
              )
            }
            className={`w-full ${inputClass}`}
          />
        </div>

        {/* Starter Code */}
        <h3 className={`text-lg font-semibold mt-8 mb-4 ${isDark ? 'text-white' : ''}`}>
          Starter Code Templates
        </h3>

        <div className="space-y-4">
          <textarea
            placeholder="C++ Starter Code"
            rows={5}
            value={form.starterCpp}
            onChange={(e) =>
              handleChange(
                "starterCpp",
                e.target.value
              )
            }
            className={`w-full font-mono ${inputClass}`}
          />

          <textarea
            placeholder="Python Starter Code"
            rows={5}
            value={form.starterPython}
            onChange={(e) =>
              handleChange(
                "starterPython",
                e.target.value
              )
            }
            className={`w-full font-mono ${inputClass}`}
          />

          <textarea
            placeholder="Java Starter Code"
            rows={5}
            value={form.starterJava}
            onChange={(e) =>
              handleChange(
                "starterJava",
                e.target.value
              )
            }
            className={`w-full font-mono ${inputClass}`}
          />

          <textarea
            placeholder="JavaScript Starter Code"
            rows={5}
            value={form.starterJs}
            onChange={(e) =>
              handleChange(
                "starterJs",
                e.target.value
              )
            }
            className={`w-full font-mono ${inputClass}`}
          />
        </div>

        <button
          onClick={handleCreate}
          className="mt-8 bg-orange-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-orange-600 transition"
        >
          <Plus size={18} />
          Add Problem
        </button>
      </div>

      {/* Problem count */}
      <div className={`mt-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        Total Problems Added: {problems.length}
      </div>
    </>
  );
}