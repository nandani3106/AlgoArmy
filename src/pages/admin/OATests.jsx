import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

import { getProblems } from "../../api/problemApi";
import { getOATests, createOATest, updateOATest, deleteOATest } from "../../api/oaTestApi";
import { toast } from "sonner";

export default function OATests() {
  const { isDark } = useTheme();

  const [tests, setTests] = useState([]);
  const [allProblems, setAllProblems] = useState([]);
  const [isEditing, setIsEditing] = useState(null); // stores ID of test being edited

  const [problemSearch, setProblemSearch] = useState("");
  const [problemDifficulty, setProblemDifficulty] = useState("All");
  const [problemCategory, setProblemCategory] = useState("All");

  const allTags = ["All", ...new Set(allProblems.flatMap(p => {
    const pt = Array.isArray(p.tags) ? p.tags : p.tag ? [p.tag] : [];
    return pt.filter(Boolean);
  }))];

  const filteredProblems = allProblems.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(problemSearch.toLowerCase());
    
    const matchesDifficulty = problemDifficulty === "All" || p.difficulty === problemDifficulty;
    
    const pTags = Array.isArray(p.tags) ? p.tags : p.tag ? [p.tag] : [];
    const matchesTag = problemCategory === "All" || pTags.some(t => t.toLowerCase() === problemCategory.toLowerCase());
    
    return matchesSearch && matchesDifficulty && matchesTag;
  });

  const getLocalISOString = (date) => {
    const tzoffset = date.getTimezoneOffset() * 60000;
    return (new Date(date - tzoffset)).toISOString().slice(0, 16);
  };

  // ================= INITIAL STATE =================
  const initialForm = {
    title: "",
    duration: "",
    type: "Mixed",
    selectedCodingQuestions: [],
    mcqs: [], // Array of { question, options: ['', '', '', ''], correctOption: 'A', marks: 1 }
    startDate: getLocalISOString(new Date()),
    endDate: getLocalISOString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    camera: true,
    mic: true,
    eyeTracking: true,
    tabSwitch: true,
    copyPasteBlock: true,
    fullScreen: true,
    result: "Later",
    passingScore: 50,
    negativeMarking: false,
  };

  const [form, setForm] = useState(initialForm);

  // ================= LOAD DATA =================
  useEffect(() => {
    loadTests();
    loadProblems();
  }, []);

  const loadTests = async () => {
    try {
      const res = await getOATests();
      setTests(res.data.data || res.data); // Support both formats
    } catch (err) {
      toast.error("Error loading OA tests");
    }
  };

  const loadProblems = async () => {
    try {
      const res = await getProblems();
      setAllProblems(res.data.data || res.data); // Support both formats
    } catch (err) {
      toast.error("Error loading problems");
    }
  };

  // ================= HANDLE CHANGE =================
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ================= MCQ HELPERS =================
  const addMCQ = () => {
    setForm(prev => ({
      ...prev,
      mcqs: [...prev.mcqs, { question: "", options: ["", "", "", ""], correctOption: "A", marks: 1 }]
    }));
  };

  const removeMCQ = (index) => {
    setForm(prev => ({
      ...prev,
      mcqs: prev.mcqs.filter((_, i) => i !== index)
    }));
  };

  const updateMCQ = (index, field, value) => {
    setForm(prev => {
      const newMcqs = [...prev.mcqs];
      newMcqs[index] = { ...newMcqs[index], [field]: value };
      return { ...prev, mcqs: newMcqs };
    });
  };

  const updateMCQOption = (mcqIdx, optIdx, value) => {
    setForm(prev => {
      const newMcqs = [...prev.mcqs];
      const newOptions = [...newMcqs[mcqIdx].options];
      newOptions[optIdx] = value;
      newMcqs[mcqIdx] = { ...newMcqs[mcqIdx], options: newOptions };
      return { ...prev, mcqs: newMcqs };
    });
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

  // ================= CRUD ACTIONS =================
  const handleSubmit = async () => {
    if (!form.title || !form.duration) {
      toast.error("Title and Duration are required");
      return;
    }

    const payload = {
      ...form,
      durationMinutes: Number(form.duration),
      proctoring: {
        camera: form.camera,
        mic: form.mic,
        eyeTracking: form.eyeTracking,
        tabSwitch: form.tabSwitch,
        copyPasteBlock: form.copyPasteBlock,
        fullScreen: form.fullScreen,
      }
    };

    try {
      if (isEditing) {
        await updateOATest(isEditing, payload);
        toast.success("OA Test updated!");
      } else {
        await createOATest(payload);
        toast.success("OA Test created!");
      }
      setForm(initialForm);
      setIsEditing(null);
      loadTests();
    } catch (err) {
      toast.error("Failed to save OA test");
    }
  };

  const handleEdit = (test) => {
    setIsEditing(test._id);
    setForm({
      ...test,
      duration: test.durationMinutes,
      camera: test.proctoring?.camera ?? true,
      mic: test.proctoring?.mic ?? true,
      eyeTracking: test.proctoring?.eyeTracking ?? true,
      tabSwitch: test.proctoring?.tabSwitch ?? true,
      copyPasteBlock: test.proctoring?.copyPasteBlock ?? true,
      fullScreen: test.proctoring?.fullScreen ?? true,
      // Handle legacy or missing fields
      selectedCodingQuestions: test.selectedCodingQuestions?.map(p => p._id || p) || [],
      mcqs: test.mcqs || [],
      startDate: test.startDate ? new Date(test.startDate).toISOString().slice(0, 16) : "",
      endDate: test.endDate ? new Date(test.endDate).toISOString().slice(0, 16) : "",
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;
    try {
      await deleteOATest(id);
      toast.success("OA Test deleted");
      loadTests();
    } catch (err) {
      toast.error("Failed to delete test");
    }
  };

  const inputClass = `border rounded-xl px-4 py-3 ${
    isDark
      ? "bg-[#1a1d2b] border-[#2d3348] text-slate-200 placeholder:text-slate-500"
      : "bg-white border-slate-300"
  }`;

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : ""}`}>
          OA Test Management
        </h1>
        {isEditing && (
          <button 
            onClick={() => { setIsEditing(null); setForm(initialForm); }}
            className="flex items-center gap-2 text-red-500 font-bold hover:underline"
          >
            <X size={18} /> Cancel Editing
          </button>
        )}
      </div>

      {/* ================= FORM ================= */}
      <div className={`rounded-2xl p-8 shadow-sm border ${isDark ? "bg-[#151823] border-[#2d3348]" : "bg-white border-slate-200"}`}>
        <h2 className={`text-xl font-semibold mb-6 ${isDark ? "text-white" : ""}`}>
          {isEditing ? "Edit OA Test" : "Create New OA Test"}
        </h2>

        {/* BASIC */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">OA Title</label>
            <input placeholder="Title" value={form.title} onChange={(e) => handleChange("title", e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Duration (min)</label>
            <input placeholder="Duration" type="number" value={form.duration} onChange={(e) => handleChange("duration", e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Test Type</label>
            <select value={form.type} onChange={(e) => handleChange("type", e.target.value)} className={inputClass}>
              <option>MCQ</option>
              <option>Coding</option>
              <option>Mixed</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
             <label className="text-xs font-bold text-slate-500 uppercase">Passing Score (%)</label>
             <input type="number" value={form.passingScore} onChange={(e) => handleChange("passingScore", e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Start Date & Time</label>
            <input type="datetime-local" value={form.startDate} onChange={(e) => handleChange("startDate", e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">End Date & Time</label>
            <input type="datetime-local" value={form.endDate} onChange={(e) => handleChange("endDate", e.target.value)} className={inputClass} />
          </div>
        </div>

        {/* ================= CODING QUESTIONS ================= */}
        {(form.type === "Coding" || form.type === "Mixed") && (
          <div className="mt-8">
            <h3 className={`font-bold mb-1 ${isDark ? "text-white" : ""}`}>Select Coding Problems</h3>
            
            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-2 mb-3 max-w-2xl">
              <input
                type="text"
                placeholder="Search problems..."
                value={problemSearch}
                onChange={(e) => setProblemSearch(e.target.value)}
                className={`flex-1 px-3 py-1.5 rounded-lg border text-xs outline-none transition-all ${
                  isDark
                    ? "bg-[#1a1d2b] border-[#2d3348] text-slate-200 placeholder:text-slate-500 focus:border-orange-500/60"
                    : "bg-white border-slate-300 text-slate-800 focus:border-orange-400"
                }`}
              />
              <select
                value={problemCategory}
                onChange={(e) => setProblemCategory(e.target.value)}
                className={`px-2 py-1.5 rounded-lg border text-xs outline-none transition-all ${
                  isDark
                    ? "bg-[#1a1d2b] border-[#2d3348] text-slate-200"
                    : "bg-white border-slate-300 text-slate-800"
                }`}
              >
                <option value="All">All Categories</option>
                {allTags.filter(t => t !== "All").map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              <select
                value={problemDifficulty}
                onChange={(e) => setProblemDifficulty(e.target.value)}
                className={`px-2 py-1.5 rounded-lg border text-xs outline-none transition-all ${
                  isDark
                    ? "bg-[#1a1d2b] border-[#2d3348] text-slate-200"
                    : "bg-white border-slate-300 text-slate-800"
                }`}
              >
                <option value="All">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className={`border rounded-xl p-4 max-h-60 overflow-y-auto ${isDark ? "border-[#2d3348]" : "border-slate-200"}`}>
              {filteredProblems.map((p) => (
                <label key={p._id} className={`flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50/10 cursor-pointer ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  <input type="checkbox" checked={form.selectedCodingQuestions.includes(p._id)} onChange={() => toggleProblem(p._id)} className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500" />
                  <span className="text-sm font-medium">{p.title}</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded ml-auto uppercase font-bold">{p.difficulty}</span>
                </label>
              ))}
              {filteredProblems.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">No matching problems</p>
              )}
            </div>
          </div>
        )}

        {/* ================= MCQs ================= */}
        {(form.type === "MCQ" || form.type === "Mixed") && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-bold ${isDark ? "text-white" : ""}`}>MCQs ({form.mcqs.length})</h3>
              <button onClick={addMCQ} className="bg-orange-500/10 text-orange-500 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-orange-500 hover:text-white transition-all">
                <Plus size={14} /> Add MCQ
              </button>
            </div>

            <div className="space-y-6">
              {form.mcqs.map((mcq, idx) => (
                <div key={idx} className={`p-6 border rounded-2xl relative ${isDark ? "border-[#2d3348] bg-black/20" : "border-slate-200 bg-slate-50"}`}>
                  <button onClick={() => removeMCQ(idx)} className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                  <p className="text-xs font-bold text-orange-500 uppercase mb-4 tracking-widest">Question {idx + 1}</p>
                  
                  <textarea
                    placeholder="Question statement..."
                    value={mcq.question}
                    onChange={(e) => updateMCQ(idx, "question", e.target.value)}
                    className={`w-full mb-4 min-h-[80px] ${inputClass}`}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    {mcq.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Option {String.fromCharCode(65 + optIdx)}</label>
                        <input 
                          value={opt} 
                          onChange={(e) => updateMCQOption(idx, optIdx, e.target.value)} 
                          className={inputClass} 
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`} 
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Correct Option</label>
                      <select value={mcq.correctOption} onChange={(e) => updateMCQ(idx, "correctOption", e.target.value)} className={inputClass}>
                        <option>A</option>
                        <option>B</option>
                        <option>C</option>
                        <option>D</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Marks</label>
                      <input type="number" value={mcq.marks} onChange={(e) => updateMCQ(idx, "marks", Number(e.target.value))} className={inputClass} />
                    </div>
                  </div>
                </div>
              ))}
              {form.mcqs.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed rounded-2xl border-slate-200">
                   <p className="text-slate-400 text-sm font-medium">No MCQs added yet. Click 'Add MCQ' to start.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= SUBMIT ================= */}
        <button
          onClick={handleSubmit}
          className="mt-12 bg-orange-600 text-white w-full py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-orange-900/20 hover:bg-orange-700 transition-all flex items-center justify-center gap-3"
        >
          {isEditing ? <Edit2 size={18} /> : <Plus size={18} />}
          {isEditing ? "Update OA Test" : "Create OA Test"}
        </button>
      </div>

      {/* ================= LIST ================= */}
      <div className="mt-16">
        <h2 className={`text-2xl font-black mb-6 ${isDark ? "text-white" : "text-[#0B1B3B]"}`}>
          Created OA Tests ({tests.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tests.map((t) => (
            <div key={t._id} className={`p-8 border rounded-[2rem] shadow-xl shadow-orange-900/5 transition-all flex flex-col ${isDark ? "bg-[#151823] border-[#2d3348] text-white" : "bg-white border-slate-100"}`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-xl font-black mb-1">{t.title}</h3>
                   <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">{t.type} Assessment</span>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={() => handleEdit(t)} className="p-3 bg-slate-50 dark:bg-slate-800 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><Edit2 size={16} /></button>
                   <button onClick={() => handleDelete(t._id)} className="p-3 bg-slate-50 dark:bg-slate-800 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                <p className="text-sm font-medium text-slate-400">Duration: <span className="text-slate-200 font-bold">{t.durationMinutes} min</span></p>
                <p className="text-sm font-medium text-slate-400">Coding: <span className="text-slate-200 font-bold">{t.selectedCodingQuestions?.length || 0} Problems</span></p>
                <p className="text-sm font-medium text-slate-400">MCQs: <span className="text-slate-200 font-bold">{t.mcqs?.length || 0} Questions</span></p>
              </div>

              <div className="pt-6 border-t border-slate-50 dark:border-[#2d3348] flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                 <span>Status: <span className="text-green-500">{t.status || 'Active'}</span></span>
                 <span>Created: {new Date(t.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}