import { useState, useEffect } from "react";
import { getUsers, getUserActivity, getLeaderboard } from "../../api/userApi";
import { useTheme } from "../../context/ThemeContext";
import {
  Award,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Code2,
  Download,
  ExternalLink,
  FileText,
  Flame,
  GraduationCap,
  Link2,
  Loader2,
  Lock,
  MapPin,
  Sparkles,
  Star,
  Target,
  Trophy,
  Unlock,
  User,
  X,
  AlertTriangle,
  Check,
  ShieldAlert,
  Brain,
  Shield,
  Eye,
  ChevronRight
} from "lucide-react";

export default function Users() {
  const { isDark } = useTheme();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activity, setActivity] = useState({ contests: [], oaTests: [], interviews: [] });
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [activeReport, setActiveReport] = useState(null); // { type: 'contest'|'oa'|'interview', data: ... }

  const [activeTab, setActiveTab] = useState("directory"); // directory | leaderboard
  const [leaderboard, setLeaderboardData] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardSearch, setLeaderboardSearch] = useState("");

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await getLeaderboard();
      if (res.data.success) {
        setLeaderboardData(res.data.leaderboard || []);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    if (activeTab === "leaderboard") {
      fetchLeaderboard();
    }
  }, [activeTab]);

  // Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setActivity({ contests: [], oaTests: [], interviews: [] });
    setLoadingActivity(true);
    try {
      const res = await getUserActivity(user._id);
      if (res.data.success) {
        setActivity({
          contests: res.data.contests || [],
          oaTests: res.data.oaTests || [],
          interviews: res.data.interviews || []
        });
      }
    } catch (error) {
      console.error("Error fetching user activity:", error);
    } finally {
      setLoadingActivity(false);
    }
  };

  // Group contest submissions by contest title
  const getGroupedContests = () => {
    const grouped = {};
    activity.contests.forEach((sub) => {
      const contestId = sub.contest?._id || "unknown";
      if (!grouped[contestId]) {
        grouped[contestId] = {
          _id: contestId,
          title: sub.contest?.title || "Coding Contest",
          date: sub.submittedAt,
          submissions: []
        };
      }
      grouped[contestId].submissions.push(sub);
    });
    return Object.values(grouped);
  };

  const groupedContests = getGroupedContests();

  // Color helper for verdicts
  const getVerdictColor = (v) => {
    if (!v) return "text-slate-400 bg-slate-100 dark:bg-slate-800";
    const val = v.toLowerCase();
    if (val === "accepted" || val === "correct") return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (val.includes("wrong") || val.includes("incorrect")) return "text-red-500 bg-red-500/10 border-red-500/20";
    if (val.includes("compilation") || val.includes("compiler")) return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    return "text-amber-500 bg-amber-500/10 border-amber-500/20";
  };

  const cardCls = `rounded-2xl border p-6 transition-all ${
    isDark ? "bg-[#151823] border-[#1e293b]" : "bg-white border-slate-200 shadow-sm"
  }`;

  return (
    <div className="pb-12">
      {selectedUser ? (
        <div>
          {/* Back Button */}
          <button
            onClick={() => {
              setSelectedUser(null);
              setActiveReport(null);
            }}
            className={`mb-6 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${
              isDark
                ? "border-[#2d3348] text-slate-300 bg-[#151823] hover:bg-[#1a1d2b]"
                : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50 shadow-sm"
            }`}
          >
            ← Back to Users
          </button>

          {/* User Hero Banner */}
          <div className={`relative overflow-hidden rounded-3xl p-8 mb-8 text-white shadow-lg ${
            isDark ? "bg-[#0B1B3B]" : "bg-slate-900"
          }`}>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 shrink-0">
                <User size={36} />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">{selectedUser.fullName || selectedUser.name}</h1>
                <p className="text-orange-400 font-bold text-xs uppercase tracking-widest mt-1">{selectedUser.role}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><FileText size={13} /> {selectedUser.email}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={13} /> Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {loadingActivity ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={32} className="animate-spin text-orange-500" />
              <p className="text-xs text-slate-400 font-semibold">Loading user activity data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contest Section */}
              <div className={cardCls}>
                <div className="flex items-center gap-2 mb-4 border-b pb-3 border-slate-100 dark:border-slate-800">
                  <Trophy className="text-amber-500" size={20} />
                  <h3 className={`font-bold ${isDark ? "text-white" : "text-slate-800"}`}>Contests ({groupedContests.length})</h3>
                </div>
                {groupedContests.length > 0 ? (
                  <div className="space-y-3">
                    {groupedContests.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => setActiveReport({ type: "contest", data: c })}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                          isDark
                            ? "bg-[#1c1f30] border-[#2d3348] hover:border-orange-500/40 text-slate-200"
                            : "bg-slate-50 border-slate-100 hover:border-orange-300 text-slate-700"
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-sm font-semibold truncate">{c.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(c.date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-orange-500 flex items-center gap-1 shrink-0">
                          {c.submissions.length} Submissions <ChevronRight size={14} />
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">No contest activity found.</p>
                )}
              </div>

              {/* OA Tests Section */}
              <div className={cardCls}>
                <div className="flex items-center gap-2 mb-4 border-b pb-3 border-slate-100 dark:border-slate-800">
                  <FileText className="text-blue-500" size={20} />
                  <h3 className={`font-bold ${isDark ? "text-white" : "text-slate-800"}`}>OA Tests ({activity.oaTests.length})</h3>
                </div>
                {activity.oaTests.length > 0 ? (
                  <div className="space-y-3">
                    {activity.oaTests.map((oa) => {
                      const passed = oa.percentage >= (oa.oaTest?.passingScore || 50);
                      return (
                        <div
                          key={oa._id}
                          onClick={() => setActiveReport({ type: "oa", data: oa })}
                          className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                            isDark
                              ? "bg-[#1c1f30] border-[#2d3348] hover:border-orange-500/40 text-slate-200"
                              : "bg-slate-50 border-slate-100 hover:border-orange-300 text-slate-700"
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <p className="text-sm font-semibold truncate">{oa.oaTest?.title || "Online Assessment"}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                passed ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                              }`}>
                                {passed ? "Passed" : "Failed"}
                              </span>
                              <span className="text-[10px] text-slate-400">Score: {oa.score}</span>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-orange-500 flex items-center gap-1 shrink-0">
                            {oa.percentage}% <ChevronRight size={14} />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">No OA activity found.</p>
                )}
              </div>

              {/* AI Interviews Section */}
              <div className={cardCls}>
                <div className="flex items-center gap-2 mb-4 border-b pb-3 border-slate-100 dark:border-slate-800">
                  <Brain className="text-purple-500" size={20} />
                  <h3 className={`font-bold ${isDark ? "text-white" : "text-slate-800"}`}>AI Interviews ({activity.interviews.length})</h3>
                </div>
                {activity.interviews.length > 0 ? (
                  <div className="space-y-3">
                    {activity.interviews.map((iv) => (
                      <div
                        key={iv._id}
                        onClick={() => setActiveReport({ type: "interview", data: iv })}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                          isDark
                            ? "bg-[#1c1f30] border-[#2d3348] hover:border-orange-500/40 text-slate-200"
                            : "bg-slate-50 border-slate-100 hover:border-orange-300 text-slate-700"
                        }`}
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-sm font-semibold truncate">{iv.role || "Technical Role"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {iv.violationCount > 0 ? (
                              <span className="text-[9px] font-bold bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5">
                                <AlertTriangle size={8} /> {iv.violationCount} Violations
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded uppercase">
                                Clean Session
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-orange-500 flex items-center gap-1 shrink-0">
                          {iv.overallScore || iv.overall || 0}% <ChevronRight size={14} />
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">No interviews found.</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Users List / Leaderboard */
        <div>
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className={`text-3xl font-black ${isDark ? "text-white" : "text-slate-800"}`}>
                {activeTab === "directory" ? "User Directory" : "Global Leaderboard"}
              </h1>
              <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">
                {activeTab === "directory" ? "Manage and evaluate registered candidate profiles" : "Track top performers across contests, OAs, and interviews"}
              </p>
            </div>
            
            <div className={`flex p-1.5 rounded-xl border shrink-0 w-fit ${
              isDark ? "bg-[#1c1f30] border-[#2d3348]" : "bg-slate-100 border-slate-200"
            }`}>
              <button
                onClick={() => setActiveTab("directory")}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === "directory"
                    ? "bg-orange-500 text-white shadow-md"
                    : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Directory
              </button>
              <button
                onClick={() => setActiveTab("leaderboard")}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === "leaderboard"
                    ? "bg-orange-500 text-white shadow-md"
                    : isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-800"
                }`}
              >
                Leaderboard
              </button>
            </div>
          </div>

          {activeTab === "directory" ? (
            /* User Directory view */
            <div className={`rounded-2xl border overflow-hidden ${
              isDark ? "bg-[#151823] border-[#1e293b]" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
                      isDark ? "border-[#1e293b] text-slate-400 bg-[#1c1f30]" : "border-slate-150 text-slate-500 bg-slate-50"
                    }`}>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-400">No users found.</td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr
                          key={user._id}
                          onClick={() => handleSelectUser(user)}
                          className={`cursor-pointer transition-all hover:bg-slate-500/5`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-sm">
                                {(user.fullName || user.name || "?").charAt(0).toUpperCase()}
                              </div>
                              <span className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-800"}`}>
                                {user.fullName || user.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                              user.role === "admin"
                                ? "bg-purple-500/10 text-purple-500"
                                : "bg-orange-500/10 text-orange-500"
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Leaderboard view */
            <div className="space-y-4">
              {/* Leaderboard Search */}
              <div className="max-w-md">
                <input
                  type="text"
                  placeholder="Search leaderboard by name or email..."
                  value={leaderboardSearch}
                  onChange={(e) => setLeaderboardSearch(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border outline-none text-xs transition-all ${
                    isDark
                      ? "bg-[#1a1d2b] border-[#2d3348] text-slate-200 placeholder:text-slate-500 focus:border-orange-500/60"
                      : "bg-white border-slate-300 text-slate-800 focus:border-orange-400 shadow-sm"
                  }`}
                />
              </div>

              {loadingLeaderboard ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 size={32} className="animate-spin text-orange-500" />
                  <p className="text-xs text-slate-400 font-semibold">Loading global leaderboard...</p>
                </div>
              ) : (
                <div className={`rounded-2xl border overflow-hidden ${
                  isDark ? "bg-[#151823] border-[#1e293b]" : "bg-white border-slate-200 shadow-sm"
                }`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`border-b text-xs font-bold uppercase tracking-wider ${
                          isDark ? "border-[#1e293b] text-slate-400 bg-[#1c1f30]" : "border-slate-150 text-slate-500 bg-slate-50"
                        }`}>
                          <th className="px-6 py-4 w-20 text-center">Rank</th>
                          <th className="px-6 py-4">User</th>
                          <th className="px-6 py-4 text-center">Contests Score</th>
                          <th className="px-6 py-4 text-center">OA Score</th>
                          <th className="px-6 py-4 text-center">AI Interview</th>
                          <th className="px-6 py-4 text-center">Total Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {leaderboard
                          .filter(u => 
                            (u.fullName || u.name || "").toLowerCase().includes(leaderboardSearch.toLowerCase()) ||
                            (u.email || "").toLowerCase().includes(leaderboardSearch.toLowerCase())
                          )
                          .map((u, index) => {
                            const rank = index + 1;
                            const isTop3 = rank <= 3;
                            const trophyColors = [
                              "text-amber-400 bg-amber-400/10 border-amber-400/20",  // 1st Gold
                              "text-slate-300 bg-slate-300/10 border-slate-300/20",  // 2nd Silver
                              "text-amber-700 bg-amber-700/10 border-amber-700/20"   // 3rd Bronze
                            ];
                            return (
                              <tr
                                key={u._id}
                                className={`transition-all hover:bg-slate-500/5`}
                              >
                                <td className="px-6 py-4 text-center font-bold">
                                  {isTop3 ? (
                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border text-xs font-black shadow-sm ${trophyColors[rank - 1]}`}>
                                      ★ {rank}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-xs font-bold">{rank}</span>
                                  )}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-sm">
                                      {(u.fullName || u.name || "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <span className={`font-semibold text-sm block ${isDark ? "text-white" : "text-slate-800"}`}>
                                        {u.fullName || u.name}
                                      </span>
                                      <span className="text-[10px] text-slate-400">{u.email}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded">
                                    {u.contestScore || 0}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded">
                                    {u.oaScore || 0}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="text-xs font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20 px-2 py-0.5 rounded">
                                    {u.interviewScore || 0}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-xl shadow-sm">
                                    {u.totalScore || 0}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        {leaderboard.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400">No leaderboard entries found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* REPORT MODAL POPUP */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`relative w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col my-8 max-h-[85vh] ${
            isDark ? "bg-[#151823] border-[#1e293b]" : "bg-white border-slate-200"
          }`}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#0B1B3B]/10 dark:bg-white/5 shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Candidate Evaluation Report</span>
                <h2 className={`text-lg font-black ${isDark ? "text-white" : "text-slate-800"}`}>
                  {activeReport.type === "contest" && `Contest: ${activeReport.data.title}`}
                  {activeReport.type === "oa" && `Online Assessment: ${activeReport.data.oaTest?.title}`}
                  {activeReport.type === "interview" && `AI Interview: ${activeReport.data.role}`}
                </h2>
              </div>
              <button
                onClick={() => setActiveReport(null)}
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all bg-transparent"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* CONTEST REPORT */}
              {activeReport.type === "contest" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-500/5 rounded-2xl p-4 border border-slate-150 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400">Total Submissions</p>
                      <p className="text-xl font-bold text-orange-500 mt-1">{activeReport.data.submissions.length}</p>
                    </div>
                    <div className="bg-slate-500/5 rounded-2xl p-4 border border-slate-150 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400">Accepted Solutions</p>
                      <p className="text-xl font-bold text-emerald-500 mt-1">
                        {activeReport.data.submissions.filter(s => s.verdict === "Accepted").length}
                      </p>
                    </div>
                    <div className="bg-slate-500/5 rounded-2xl p-4 border border-slate-150 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400">Max Score Earned</p>
                      <p className="text-xl font-bold text-blue-500 mt-1">
                        {Math.max(...activeReport.data.submissions.map(s => s.score || 0), 0)} pts
                      </p>
                    </div>
                    <div className="bg-slate-500/5 rounded-2xl p-4 border border-slate-150 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400">Evaluation Date</p>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-300 mt-2">
                        {new Date(activeReport.data.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Submissions Details</h3>
                    <div className="space-y-4">
                      {activeReport.data.submissions.map((sub, sIdx) => (
                        <details
                          key={sub._id || sIdx}
                          className={`rounded-2xl border p-4 group transition-all [&_summary::-webkit-details-marker]:hidden ${
                            isDark ? "bg-[#1c1f30] border-[#2d3348]" : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <summary className="flex items-center justify-between cursor-pointer list-none select-none">
                            <div className="flex items-center gap-3">
                              <Code2 size={16} className="text-orange-500" />
                              <div>
                                <span className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                                  {sub.problem?.title || "Coding Problem"}
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  {sub.language} — {sub.executionTime || "0 ms"} — {sub.memoryUsed || "0 MB"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 border rounded uppercase ${getVerdictColor(sub.verdict)}`}>
                                {sub.verdict}
                              </span>
                              <span className="text-xs font-bold text-slate-500">
                                {sub.passedTestCases} / {sub.totalTestCases} cases
                              </span>
                              <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                            </div>
                          </summary>

                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                            {sub.compilerOutput && (
                              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                                <p className="text-xs font-bold text-red-500 mb-1">Compiler Output:</p>
                                <pre className="text-xs font-mono text-red-400 overflow-x-auto whitespace-pre-wrap">{sub.compilerOutput}</pre>
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-slate-400 mb-1.5 uppercase">Submitted Source Code:</p>
                              <pre className="text-xs font-mono p-4 rounded-xl overflow-x-auto bg-[#0a0c16] text-[#b8c0e0] border border-[#2d3348]">
                                <code>{sub.code}</code>
                              </pre>
                            </div>
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* OA REPORT */}
              {activeReport.type === "oa" && (
                <div className="space-y-6">
                  {/* Scores and Proctoring stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-500/5 rounded-2xl p-4 border border-slate-150 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400">Overall Percentage</p>
                      <p className="text-xl font-bold text-orange-500 mt-1">{activeReport.data.percentage}%</p>
                    </div>
                    <div className="bg-slate-500/5 rounded-2xl p-4 border border-slate-150 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400">Total Score</p>
                      <p className="text-xl font-bold text-blue-500 mt-1">
                        {activeReport.data.score} / {activeReport.data.totalPossibleScore || activeReport.data.totalQuestions || 0}
                      </p>
                    </div>
                    <div className="bg-slate-500/5 rounded-2xl p-4 border border-slate-150 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400">Questions (Correct/Total)</p>
                      <p className="text-xl font-bold text-emerald-500 mt-1">
                        {activeReport.data.correctAnswers} / {activeReport.data.totalQuestions}
                      </p>
                    </div>
                    <div className="bg-slate-500/5 rounded-2xl p-4 border border-slate-150 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400">Submission Date</p>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-300 mt-2">
                        {new Date(activeReport.data.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Proctoring Settings & Violations summary */}
                  <div className={`p-4 rounded-2xl border ${
                    isDark ? "bg-[#1c1f30]/40 border-[#2d3348]" : "bg-slate-50 border-slate-200"
                  }`}>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Shield size={14} className="text-blue-500" /> Assessment Proctoring Status
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
                      {Object.entries(activeReport.data.oaTest?.proctoring || {}).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-500/5 border border-slate-100/5 dark:border-slate-800">
                          {val ? <CheckCircle size={12} className="text-emerald-500" /> : <X size={12} className="text-slate-400" />}
                          <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* MCQ Answers Report */}
                  {activeReport.data.oaTest?.mcqs?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">MCQ Question Responses</h3>
                      <div className="space-y-4">
                        {activeReport.data.oaTest.mcqs.map((mcq, idx) => {
                          const candidateAnswer = activeReport.data.answers.find(a => a.questionId === `mcq-${idx}`)?.answer || "Unattempted";
                          const isCorrect = activeReport.data.answers.find(a => a.questionId === `mcq-${idx}`)?.isCorrect || false;
                          return (
                            <div
                              key={idx}
                              className={`p-4 rounded-2xl border ${
                                isCorrect
                                  ? "bg-emerald-500/5 border-emerald-500/20"
                                  : candidateAnswer === "Unattempted"
                                  ? "bg-slate-500/5 border-slate-200 dark:border-[#2d3348]"
                                  : "bg-red-500/5 border-red-500/20"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-4">
                                <span className={`text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                  isCorrect ? "bg-emerald-500/10 text-emerald-500" : candidateAnswer === "Unattempted" ? "bg-slate-200 dark:bg-slate-800 text-slate-500" : "bg-red-500/10 text-red-500"
                                }`}>
                                  Q{idx + 1} — {isCorrect ? "Correct" : candidateAnswer === "Unattempted" ? "Skipped" : "Incorrect"}
                                </span>
                                <span className="text-xs font-bold text-slate-500">Marks: {mcq.marks || 1}</span>
                              </div>
                              <p className={`text-sm font-semibold mt-2 ${isDark ? "text-white" : "text-slate-800"}`}>{mcq.question}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                                {mcq.options.map((opt, oIdx) => {
                                  const optionLabel = String.fromCharCode(65 + oIdx); // A, B, C, D...
                                  const isSelected = candidateAnswer === optionLabel || candidateAnswer === opt;
                                  const isOptionCorrect = mcq.correctOption === optionLabel || mcq.correctOption === opt;
                                  return (
                                    <div
                                      key={oIdx}
                                      className={`p-2 rounded-xl text-xs font-medium border flex items-center justify-between ${
                                        isSelected && isOptionCorrect
                                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                                          : isSelected
                                          ? "bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400"
                                          : isOptionCorrect
                                          ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                          : isDark ? "bg-[#1a1d2b] border-[#2d3348] text-slate-400" : "bg-white border-slate-200 text-slate-600"
                                      }`}
                                    >
                                      <span>{optionLabel}. {opt}</span>
                                      {isSelected && <span className="text-[10px] font-black uppercase">Selected</span>}
                                      {!isSelected && isOptionCorrect && <span className="text-[10px] font-black uppercase text-emerald-500">Correct Choice</span>}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Coding Questions Report */}
                  {activeReport.data.oaTest?.selectedCodingQuestions?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Coding Question Submissions</h3>
                      <div className="space-y-4">
                        {activeReport.data.oaTest.selectedCodingQuestions.map((q, idx) => {
                          const candidateSubmission = activeReport.data.answers.find(a => a.questionId === q._id?.toString() || a.questionId === q.title) || null;
                          return (
                            <div
                              key={idx}
                              className={`p-4 rounded-2xl border ${
                                candidateSubmission?.isCorrect
                                  ? "bg-emerald-500/5 border-emerald-500/20"
                                  : !candidateSubmission
                                  ? "bg-slate-500/5 border-slate-200 dark:border-[#2d3348]"
                                  : "bg-red-500/5 border-red-500/20"
                              }`}
                            >
                              <div className="flex justify-between items-center flex-wrap gap-2">
                                <span className={`text-xs font-black uppercase px-2 py-0.5 rounded ${
                                  candidateSubmission?.isCorrect ? "bg-emerald-500/10 text-emerald-500" : !candidateSubmission ? "bg-slate-200 dark:bg-slate-800 text-slate-500" : "bg-red-500/10 text-red-500"
                                }`}>
                                  Coding Q{idx + 1} — {candidateSubmission?.verdict || "Unattempted"}
                                </span>
                                <span className="text-xs font-bold text-slate-500 uppercase">{q.difficulty}</span>
                              </div>
                              <p className={`text-sm font-bold mt-2 ${isDark ? "text-white" : "text-slate-800"}`}>{q.title}</p>
                              {candidateSubmission && (
                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                                  <div className="flex gap-4 text-slate-400 font-bold">
                                    <span>Language: {candidateSubmission.language}</span>
                                    <span>Score: {candidateSubmission.pointsEarned} pts</span>
                                    <span>Passed: {candidateSubmission.passedTests} / {candidateSubmission.totalTests} cases</span>
                                  </div>
                                  {candidateSubmission.compilerOutput && (
                                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                                      <p className="text-xs font-bold text-red-500 mb-1">Compiler Output:</p>
                                      <pre className="text-xs font-mono text-red-400 overflow-x-auto whitespace-pre-wrap">{candidateSubmission.compilerOutput}</pre>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Candidate Code:</p>
                                    <pre className="text-xs font-mono p-4 rounded-xl overflow-x-auto bg-[#0a0c16] text-[#b8c0e0] border border-[#2d3348]">
                                      <code>{candidateSubmission.answer}</code>
                                    </pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* AI INTERVIEW REPORT */}
              {activeReport.type === "interview" && (
                <div className="space-y-6">
                  {/* Scores dashboard */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-slate-500/5 rounded-2xl p-4 border border-slate-150 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400">Overall Score</p>
                      <p className="text-2xl font-black text-orange-500 mt-1">
                        {activeReport.data.overallScore || activeReport.data.overall || 0}%
                      </p>
                    </div>
                    <div className="bg-slate-500/5 rounded-2xl p-4 border border-slate-150 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400">Technical Score</p>
                      <p className="text-xl font-bold text-blue-500 mt-1">
                        {activeReport.data.technicalScore || activeReport.data.technical || 0}%
                      </p>
                    </div>
                    <div className="bg-slate-500/5 rounded-2xl p-4 border border-slate-150 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400">Communication</p>
                      <p className="text-xl font-bold text-purple-500 mt-1">
                        {activeReport.data.communicationScore || activeReport.data.communication || 0}%
                      </p>
                    </div>
                    <div className="bg-slate-500/5 rounded-2xl p-4 border border-slate-150 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400">Confidence Score</p>
                      <p className="text-xl font-bold text-amber-500 mt-1">
                        {activeReport.data.confidence || 0}%
                      </p>
                    </div>
                    <div className="bg-slate-500/5 rounded-2xl p-4 border border-slate-150 dark:border-slate-800 text-center">
                      <p className="text-[10px] font-black uppercase text-slate-400">Integrity Score</p>
                      <p className={`text-xl font-bold mt-1 ${
                        (activeReport.data.integrityScore || 100) >= 70 ? "text-emerald-500" : "text-red-500"
                      }`}>
                        {activeReport.data.integrityScore || 100}%
                      </p>
                    </div>
                  </div>

                  {/* Proctoring violations */}
                  <div className={`p-4 rounded-2xl border ${
                    isDark ? "bg-[#1c1f30]/40 border-[#2d3348]" : "bg-slate-50 border-slate-200"
                  }`}>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-red-500" /> Proctoring Log ({activeReport.data.violationCount || 0} violations)
                    </h3>
                    {activeReport.data.violations?.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                        {activeReport.data.violations.map((v, vIdx) => (
                          <div key={vIdx} className="flex justify-between items-center gap-3 p-2 rounded bg-red-500/5 border border-red-500/10 text-xs">
                            <span className="font-bold text-red-500">{v.eventType}</span>
                            <span className="text-slate-400 truncate flex-1 text-right">{v.description}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(v.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Clean session. No proctoring violations recorded.</p>
                    )}
                  </div>

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4">
                      <h4 className="text-xs font-black uppercase text-emerald-500 mb-2 flex items-center gap-1">
                        <Check size={12} /> Key Strengths
                      </h4>
                      <ul className="list-disc list-inside text-xs text-slate-400 space-y-1.5 font-medium">
                        {activeReport.data.strengths?.length > 0 ? (
                          activeReport.data.strengths.map((str, sIdx) => <li key={sIdx}>{str}</li>)
                        ) : (
                          <li>Strong domain understanding</li>
                        )}
                      </ul>
                    </div>

                    <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4">
                      <h4 className="text-xs font-black uppercase text-red-500 mb-2 flex items-center gap-1">
                        <AlertTriangle size={12} /> Areas of Improvement
                      </h4>
                      <ul className="list-disc list-inside text-xs text-slate-400 space-y-1.5 font-medium">
                        {activeReport.data.improvements?.length > 0 ? (
                          activeReport.data.improvements.map((imp, iIdx) => <li key={iIdx}>{imp}</li>)
                        ) : (
                          <li>Elaborate answers in details</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Transcript & Feedback */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Interview Transcript</h3>
                    <div className="space-y-4">
                      {activeReport.data.questions?.map((q, idx) => {
                        const answer = activeReport.data.answers?.[idx] || "";
                        const itemFeedback = activeReport.data.feedback?.[idx] || null;
                        return (
                          <details
                            key={idx}
                            className={`rounded-2xl border p-4 group transition-all [&_summary::-webkit-details-marker]:hidden ${
                              isDark ? "bg-[#1c1f30] border-[#2d3348]" : "bg-slate-50 border-slate-200"
                            }`}
                          >
                            <summary className="flex items-center justify-between cursor-pointer list-none select-none">
                              <div className="flex-1 pr-3">
                                <p className="text-xs font-bold text-slate-400 uppercase">Question {idx + 1}</p>
                                <p className={`text-sm font-semibold mt-1 truncate ${isDark ? "text-white" : "text-slate-800"}`}>{q}</p>
                              </div>
                              <span className="text-xs text-slate-400 group-open:rotate-180 transition-transform shrink-0">▼</span>
                            </summary>

                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                              <div>
                                <p className="font-bold text-orange-500 uppercase text-[10px]">Candidate Transcript Response:</p>
                                <p className="text-slate-300 font-medium leading-relaxed bg-[#0a0c16]/30 p-3 rounded-xl border border-slate-500/5 mt-1">
                                  {answer || <span className="italic text-slate-500">No voice answer captured</span>}
                                </p>
                              </div>
                              {itemFeedback && (
                                <div className="p-3 rounded-xl border bg-blue-500/5 border-blue-500/10">
                                  <p className="font-bold text-blue-400 uppercase text-[10px]">AI Evaluation & Scoring:</p>
                                  <div className="grid grid-cols-2 gap-2 my-2 font-bold text-slate-400">
                                    <span>Technical Accuracy: {itemFeedback.technical || 0}/10</span>
                                    <span>Communication clarity: {itemFeedback.communication || 0}/10</span>
                                  </div>
                                  <p className="text-slate-400 mt-1 leading-relaxed">{itemFeedback.feedback || itemFeedback.explanation}</p>
                                </div>
                              )}
                            </div>
                          </details>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-[#0B1B3B]/10 dark:bg-white/5 shrink-0 flex justify-end">
              <button
                onClick={() => setActiveReport(null)}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/10"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}