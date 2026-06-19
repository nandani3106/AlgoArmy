import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, X, Calendar, Clock, Award } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { getProblems } from "../../api/problemApi";
import { createContest, getContests, updateContest, deleteContest } from "../../api/contestApi";
import { toast } from "sonner";

export default function Contests() {
  const { isDark } = useTheme();

  const [contests, setContests] = useState([]);
  const [allProblems, setAllProblems] = useState([]);
  const [isEditing, setIsEditing] = useState(null);

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

  const initialForm = {
    title: "",
    description: "",
    difficulty: "Medium",
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
    rules: "",
    prizes: "",
  };

  const [form, setForm] = useState(initialForm);

  // ================= LOAD DATA =================
  useEffect(() => {
    loadProblems();
    loadContests();
  }, []);

  const loadProblems = async () => {
    try {
      const res = await getProblems();
      setAllProblems(res.data.data || res.data); // Support both formats
    } catch (err) {
      toast.error("Error fetching problems");
    }
  };

  const loadContests = async () => {
    try {
      const res = await getContests();
      setContests(res.data.data || res.data); // Support both formats
    } catch (err) {
      toast.error("Error fetching contests");
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

  // ================= CRUD ACTIONS =================
  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.startDate || !form.endDate || !form.duration) {
      toast.error("All mandatory fields are required");
      return;
    }

    const payload = {
      ...form,
      startTime: form.startDate,
      endTime: form.endDate,
      durationMinutes: Number(form.duration),
    };

    try {
      if (isEditing) {
        await updateContest(isEditing, payload);
        toast.success("Contest updated!");
      } else {
        await createContest(payload);
        toast.success("Contest created!");
      }
      setForm(initialForm);
      setIsEditing(null);
      loadContests();
    } catch (err) {
      toast.error("Failed to save contest");
    }
  };

  const handleEdit = (contest) => {
    setIsEditing(contest._id);
    setForm({
      ...contest,
      startDate: contest.startTime ? new Date(contest.startTime).toISOString().slice(0, 16) : "",
      endDate: contest.endTime ? new Date(contest.endTime).toISOString().slice(0, 16) : "",
      duration: contest.durationMinutes,
      selectedProblems: contest.selectedProblems?.map(p => p._id || p) || [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this contest?")) return;
    try {
      await deleteContest(id);
      toast.success("Contest deleted");
      loadContests();
    } catch (err) {
      toast.error("Failed to delete contest");
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
          Contest Management
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
          {isEditing ? "Edit Contest" : "Create New Contest"}
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
            <input placeholder="Contest Title" value={form.title} onChange={(e) => handleChange("title", e.target.value)} className={inputClass} />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Contest Type</label>
            <select value={form.type} onChange={(e) => handleChange("type", e.target.value)} className={inputClass}>
              <option>Public</option>
              <option>Private</option>
              <option>Invite Only</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Difficulty Level</label>
            <select value={form.difficulty} onChange={(e) => handleChange("difficulty", e.target.value)} className={inputClass}>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
              <option>Extreme</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Duration (min)</label>
            <input type="number" placeholder="Duration" value={form.duration} onChange={(e) => handleChange("duration", e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
          <textarea rows={3} placeholder="Contest description..." value={form.description} onChange={(e) => handleChange("description", e.target.value)} className={inputClass} />
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

        <div className="grid md:grid-cols-2 gap-4 mt-8">
           <div>
              <h3 className={`font-bold mb-1 ${isDark ? "text-white" : ""}`}>Select Problems</h3>
              
              {/* Search & Filter */}
              <div className="flex flex-col gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={problemSearch}
                  onChange={(e) => setProblemSearch(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-none transition-all ${
                    isDark
                      ? "bg-[#1a1d2b] border-[#2d3348] text-slate-200 placeholder:text-slate-500 focus:border-orange-500/60"
                      : "bg-white border-slate-300 text-slate-800 focus:border-orange-400"
                  }`}
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={problemCategory}
                    onChange={(e) => setProblemCategory(e.target.value)}
                    className={`w-full px-2 py-1.5 rounded-lg border text-xs outline-none transition-all ${
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
                    className={`w-full px-2 py-1.5 rounded-lg border text-xs outline-none transition-all ${
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
              </div>

              <div className={`border rounded-xl p-4 max-h-60 overflow-y-auto ${isDark ? "border-[#2d3348]" : "border-slate-200"}`}>
                {filteredProblems.map((problem) => (
                  <label key={problem._id} className={`flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50/10 cursor-pointer ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    <input type="checkbox" checked={form.selectedProblems.includes(problem._id)} onChange={() => toggleProblem(problem._id)} className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500" />
                    <div>
                       <p className="text-sm font-medium">{problem.title}</p>
                       <p className="text-[10px] text-slate-500 uppercase font-bold">{problem.difficulty}</p>
                    </div>
                  </label>
                ))}
                {filteredProblems.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">No matching problems</p>
                )}
              </div>
           </div>

           <div>
              <h3 className={`font-bold mb-4 ${isDark ? "text-white" : ""}`}>Contest Rules & Rewards</h3>
              <div className="space-y-4">
                 <textarea placeholder="Rules..." value={form.rules} onChange={(e) => handleChange("rules", e.target.value)} className={`w-full ${inputClass}`} />
                 <textarea placeholder="Prizes..." value={form.prizes} onChange={(e) => handleChange("prizes", e.target.value)} className={`w-full ${inputClass}`} />
              </div>
           </div>
        </div>

        <h3 className={`text-lg font-semibold mt-8 mb-4 ${isDark ? "text-white" : ""}`}>
          Configuration
        </h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { id: "liveLeaderboard", label: "Live Leaderboard" },
            { id: "freezeLeaderboard", label: "Freeze Leaderboard" },
            { id: "wrongPenalty", label: "Wrong Penalty" },
            { id: "partialScoring", label: "Partial Scoring" }
          ].map(rule => (
            <label key={rule.id} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${form[rule.id] ? "bg-orange-500/10 border-orange-500/30 text-orange-500" : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-transparent text-slate-500"}`}>
              <input type="checkbox" checked={form[rule.id]} onChange={() => handleChange(rule.id, !form[rule.id])} className="hidden" />
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${form[rule.id] ? "border-orange-500 bg-orange-500" : "border-slate-300"}`}>
                 {form[rule.id] && <Plus size={12} className="text-white" />}
              </div>
              <span className="text-xs font-bold uppercase tracking-tight">{rule.label}</span>
            </label>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col gap-2">
             <label className="text-xs font-bold text-slate-500 uppercase">Max Submissions / Problem</label>
             <input type="number" value={form.maxSubmissions} onChange={(e) => handleChange("maxSubmissions", e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-2">
             <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
             <select value={form.status} onChange={(e) => handleChange("status", e.target.value)} className={inputClass}>
                <option>Draft</option>
                <option>Published</option>
                <option>Live</option>
             </select>
          </div>
        </div>

        <button onClick={handleSubmit} className="mt-12 bg-[#0B1B3B] text-white w-full py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-navy-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
          {isEditing ? <Edit2 size={18} /> : <Plus size={18} />}
          {isEditing ? "Update Contest" : "Create Contest"}
        </button>
      </div>

      {/* ================= LIST ================= */}
      <div className="mt-16">
        <h2 className={`text-2xl font-black mb-6 ${isDark ? "text-white" : "text-[#0B1B3B]"}`}>
          Existing Contests ({contests.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contests.map((c) => (
            <div key={c._id} className={`p-8 border rounded-[2rem] shadow-xl shadow-orange-900/5 transition-all flex flex-col ${isDark ? "bg-[#151823] border-[#2d3348] text-white" : "bg-white border-slate-100"}`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-xl font-black mb-1">{c.title}</h3>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">{c.type}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{c.difficulty}</span>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <button onClick={() => handleEdit(c)} className="p-3 bg-slate-50 dark:bg-slate-800 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"><Edit2 size={16} /></button>
                   <button onClick={() => handleDelete(c._id)} className="p-3 bg-slate-50 dark:bg-slate-800 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                 <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Calendar size={14} />
                    <span>{new Date(c.startTime).toLocaleDateString()} - {new Date(c.endTime).toLocaleDateString()}</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Clock size={14} />
                    <span>{c.durationMinutes} Minutes</span>
                 </div>
                 <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Award size={14} />
                    <span>{c.selectedProblems?.length || 0} Problems</span>
                 </div>
              </div>

              <div className="pt-6 border-t border-slate-50 dark:border-[#2d3348] flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                 <span className={`px-3 py-1 rounded-full ${c.status === 'Live' ? 'bg-green-500/10 text-green-500' : 'bg-slate-500/10 text-slate-400'}`}>{c.status || 'Draft'}</span>
                 <span>{c.participantsCount || 0} Joined</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}