import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

import { getProblems } from "../../api/problemApi";
import { getOATests, createOATest } from "../../api/oaTestApi";

export default function OATests() {
  const { isDark } = useTheme();

  const [tests, setTests] = useState([]);
  const [allProblems, setAllProblems] = useState([]);

  // ================= FORM =================
  const [form, setForm] = useState({
    title: "",
    duration: "",
    type: "Mixed",

    selectedCodingQuestions: [],

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

  // ================= LOAD DATA =================
  useEffect(() => {
    loadTests();
    loadProblems();
  }, []);

  const loadTests = async () => {
    try {
      const res = await getOATests();
      setTests(res.data);
    } catch (err) {
      console.log("Error loading OA tests:", err);
    }
  };

  const loadProblems = async () => {
    try {
      const res = await getProblems();
      setAllProblems(res.data);
    } catch (err) {
      console.log("Error loading problems:", err);
    }
  };

  // ================= HANDLE CHANGE =================
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ================= TOGGLE PROBLEM =================
  const toggleProblem = (id) => {
    setForm((prev) => {
      const exists = prev.selectedCodingQuestions.includes(id);

      return {
        ...prev,
        selectedCodingQuestions: exists
          ? prev.selectedCodingQuestions.filter((p) => p !== id)
          : [...prev.selectedCodingQuestions, id],
      };
    });
  };

  // ================= CREATE OA TEST (DB) =================
  const handleCreate = async () => {
    if (!form.title || !form.duration) return;

    const payload = {
      title: form.title,
      duration: form.duration,
      type: form.type,

      selectedProblems: form.selectedCodingQuestions,

      mcqs: [
        {
          question: form.mcqQuestion,
          options: [form.optionA, form.optionB, form.optionC, form.optionD],
          correctAnswer: form.correctOption,
          marks: form.marks,
        },
      ],

      proctoring: {
        camera: form.camera,
        mic: form.mic,
        eyeTracking: form.eyeTracking,
        tabSwitch: form.tabSwitch,
        copyPasteBlock: form.copyPasteBlock,
        fullScreen: form.fullScreen,
      },

      result: form.result,
      passingScore: form.passingScore,
      negativeMarking: form.negativeMarking,
    };

    try {
      const res = await createOATest(payload);

      await loadTests(); // refresh from DB

      alert("OA Test created!");

      // reset form
      setForm({
        title: "",
        duration: "",
        type: "Mixed",

        selectedCodingQuestions: [],

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
        copyPasteBlock: false,
        fullScreen: true,

        result: "Later",
        passingScore: 50,
      });
    } catch (err) {
      console.log(err);
      alert("Failed to create OA test");
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
        OA Test Management
      </h1>

      {/* ================= FORM ================= */}
      <div
        className={`rounded-2xl p-6 shadow-sm border ${
          isDark
            ? "bg-[#151823]"
            : "bg-white border-slate-200"
        }`}
      >
        <h2 className={`text-xl font-semibold mb-6 ${isDark ? "text-white" : ""}`}>
          Create New OA Test
        </h2>

        {/* BASIC */}
        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="OA Title"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            className={inputClass}
          />

          <input
            placeholder="Duration (min)"
            type="number"
            value={form.duration}
            onChange={(e) => handleChange("duration", e.target.value)}
            className={inputClass}
          />

          <select
            value={form.type}
            onChange={(e) => handleChange("type", e.target.value)}
            className={inputClass}
          >
            <option>MCQ</option>
            <option>Coding</option>
            <option>Mixed</option>
          </select>
        </div>

        {/* ================= CODING QUESTIONS ================= */}
        <h3 className="mt-6 font-semibold">Select Coding Problems</h3>

        <div className="border rounded-xl p-4 max-h-48 overflow-y-auto">
          {allProblems.map((p) => (
            <label key={p._id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.selectedCodingQuestions.includes(p._id)}
                onChange={() => toggleProblem(p._id)}
              />
              {p.title}
            </label>
          ))}
        </div>

        {/* ================= MCQ ================= */}
        <h3 className="mt-6 font-semibold">MCQ</h3>

        <textarea
          placeholder="Question"
          value={form.mcqQuestion}
          onChange={(e) => handleChange("mcqQuestion", e.target.value)}
          className={`w-full mt-2 ${inputClass}`}
        />

        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <input value={form.optionA} onChange={(e) => handleChange("optionA", e.target.value)} className={inputClass} placeholder="A" />
          <input value={form.optionB} onChange={(e) => handleChange("optionB", e.target.value)} className={inputClass} placeholder="B" />
          <input value={form.optionC} onChange={(e) => handleChange("optionC", e.target.value)} className={inputClass} placeholder="C" />
          <input value={form.optionD} onChange={(e) => handleChange("optionD", e.target.value)} className={inputClass} placeholder="D" />
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <select
            value={form.correctOption}
            onChange={(e) => handleChange("correctOption", e.target.value)}
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
            onChange={(e) => handleChange("marks", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* ================= BUTTON ================= */}
        <button
          onClick={handleCreate}
          className="mt-8 bg-orange-500 text-white px-6 py-3 rounded-xl flex items-center gap-2"
        >
          <Plus size={18} />
          Create OA Test
        </button>
      </div>

      {/* ================= LIST ================= */}
      <div className="mt-8">
        <h2 className={`text-xl font-semibold ${isDark ? "text-white" : ""}`}>
          Created OA Tests ({tests.length})
        </h2>

        {tests.map((t) => (
          <div
            key={t._id}
            className={`p-4 border rounded-xl mt-3 ${
              isDark ? "text-white bg-[#151823]" : ""
            }`}
          >
            <h3 className="font-bold">{t.title}</h3>
            <p>Type: {t.type}</p>
            <p>Duration: {t.duration} min</p>
            <p>Coding Questions: {t.selectedProblems?.length}</p>
          </div>
        ))}
      </div>
    </>
  );
}