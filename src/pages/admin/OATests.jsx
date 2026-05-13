import { useState } from "react";
import { Plus } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function OATests() {
  const { isDark } = useTheme();
  const [tests, setTests] = useState([]);

  const [form, setForm] = useState({
    title: "",
    duration: "",
    type: "Mixed",
    selectedCodingQuestions: "",
    mcqQuestion: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "A",
    marks: 1,
    negativeMarking: false,
    randomizeQuestions: true,
    shuffleOptions: true,
    autoSubmit: true,
    camera: true,
    mic: true,
    eyeTracking: true,
    tabSwitch: true,
    copyPasteBlock: true,
    fullScreen: true,
    result: "Later",
    passingScore: 50,
  });

  const handleChange = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const handleCreate = () => {
    if (!form.title || !form.duration) return;

    setTests([...tests, form]);
    alert("OA Test created!");
  };

  const inputClass = `border rounded-xl px-4 py-3 ${
    isDark
      ? 'bg-[#1a1d2b] border-[#2d3348] text-slate-200 placeholder:text-slate-500'
      : ''
  }`;

  return (
    <>
      <h1 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : ''}`}>
        OA Test Management
      </h1>

      <div className={`rounded-2xl p-6 shadow-sm border ${
        isDark
          ? 'bg-[#151823] border-[#1e293b]'
          : 'bg-white border-slate-200'
      }`}>
        <h2 className={`text-xl font-semibold mb-6 ${isDark ? 'text-white' : ''}`}>
          Create New OA Test
        </h2>

        {/* Basic */}
        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="OA Title"
            value={form.title}
            onChange={(e) =>
              handleChange("title", e.target.value)
            }
            className={inputClass}
          />

          <input
            placeholder="Duration (min)"
            type="number"
            value={form.duration}
            onChange={(e) =>
              handleChange(
                "duration",
                e.target.value
              )
            }
            className={inputClass}
          />

          <select
            value={form.type}
            onChange={(e) =>
              handleChange("type", e.target.value)
            }
            className={inputClass}
          >
            <option>MCQ</option>
            <option>Coding</option>
            <option>Mixed</option>
          </select>

          <input
            placeholder="Select Coding Questions (IDs)"
            value={form.selectedCodingQuestions}
            onChange={(e) =>
              handleChange(
                "selectedCodingQuestions",
                e.target.value
              )
            }
            className={inputClass}
          />
        </div>

        {/* MCQ Builder */}
        <h3 className={`text-lg font-semibold mt-8 mb-4 ${isDark ? 'text-white' : ''}`}>
          Add MCQ Question
        </h3>

        <textarea
          placeholder="MCQ Question"
          rows={3}
          value={form.mcqQuestion}
          onChange={(e) =>
            handleChange(
              "mcqQuestion",
              e.target.value
            )
          }
          className={`w-full ${inputClass}`}
        />

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <input
            placeholder="Option A"
            value={form.optionA}
            onChange={(e) =>
              handleChange("optionA", e.target.value)
            }
            className={inputClass}
          />

          <input
            placeholder="Option B"
            value={form.optionB}
            onChange={(e) =>
              handleChange("optionB", e.target.value)
            }
            className={inputClass}
          />

          <input
            placeholder="Option C"
            value={form.optionC}
            onChange={(e) =>
              handleChange("optionC", e.target.value)
            }
            className={inputClass}
          />

          <input
            placeholder="Option D"
            value={form.optionD}
            onChange={(e) =>
              handleChange("optionD", e.target.value)
            }
            className={inputClass}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <select
            value={form.correctOption}
            onChange={(e) =>
              handleChange(
                "correctOption",
                e.target.value
              )
            }
            className={inputClass}
          >
            <option>A</option>
            <option>B</option>
            <option>C</option>
            <option>D</option>
          </select>

          <input
            type="number"
            placeholder="Marks"
            value={form.marks}
            onChange={(e) =>
              handleChange("marks", e.target.value)
            }
            className={inputClass}
          />

          <label className={`flex items-center gap-2 ${isDark ? 'text-slate-300' : ''}`}>
            <input
              type="checkbox"
              checked={form.negativeMarking}
              onChange={() =>
                handleChange(
                  "negativeMarking",
                  !form.negativeMarking
                )
              }
            />
            Negative Marking
          </label>
        </div>

        {/* Proctoring */}
        <h3 className={`text-lg font-semibold mt-8 mb-4 ${isDark ? 'text-white' : ''}`}>
          Proctoring Settings
        </h3>

        <div className="grid md:grid-cols-2 gap-3">
          {[
            "camera",
            "mic",
            "eyeTracking",
            "tabSwitch",
            "copyPasteBlock",
            "fullScreen",
          ].map((item) => (
            <label
              key={item}
              className={`flex items-center gap-2 ${isDark ? 'text-slate-300' : ''}`}
            >
              <input
                type="checkbox"
                checked={form[item]}
                onChange={() =>
                  handleChange(
                    item,
                    !form[item]
                  )
                }
              />
              {item}
            </label>
          ))}
        </div>

        {/* Result */}
        <h3 className={`text-lg font-semibold mt-8 mb-4 ${isDark ? 'text-white' : ''}`}>
          Result Settings
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <select
            value={form.result}
            onChange={(e) =>
              handleChange("result", e.target.value)
            }
            className={inputClass}
          >
            <option>Immediate</option>
            <option>Later</option>
          </select>

          <input
            type="number"
            placeholder="Passing Score %"
            value={form.passingScore}
            onChange={(e) =>
              handleChange(
                "passingScore",
                e.target.value
              )
            }
            className={inputClass}
          />
        </div>

        <button
          onClick={handleCreate}
          className="mt-8 bg-orange-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-orange-600 transition"
        >
          <Plus size={18} />
          Create OA Test
        </button>
      </div>
    </>
  );
}