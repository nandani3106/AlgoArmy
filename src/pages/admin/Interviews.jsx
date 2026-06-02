import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import {
  getInterviewResults,
  updateInterviewStatus,
} from "../../api/interviewApi";
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare, 
  Zap 
} from "lucide-react";

export default function Interviews() {
  const { isDark } = useTheme();

  const [interviews, setInterviews] = useState([]);
  const [expandedInterviewId, setExpandedInterviewId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedInterviewId(prev => prev === id ? null : id);
  };

  // ================= LOAD INTERVIEWS =================
  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      const res = await getInterviewResults();
      setInterviews(res.data);
    } catch (err) {
      console.log("Error loading interviews:", err);
    }
  };

  // ================= UPDATE STATUS =================
  const handleStatusChange = async (
    id,
    status
  ) => {
    try {
      const res =
        await updateInterviewStatus(
          id,
          status
        );

      setInterviews((prev) =>
        prev.map((item) =>
          item._id === id
            ? res.data
            : item
        )
      );

      alert(
        `Marked as ${status}`
      );
    } catch (err) {
      console.log(err);
      alert(
        "Failed to update status"
      );
    }
  };

  return (
    <>
      <h1
        className={`text-3xl font-bold mb-8 ${
          isDark
            ? "text-white"
            : ""
        }`}
      >
        AI Interview Analysis
      </h1>

      <div className="space-y-6">
        {interviews.length ===
        0 ? (
          <p
            className={
              isDark
                ? "text-slate-400"
                : "text-slate-500"
            }
          >
            No interview
            results found
          </p>
        ) : (
          interviews.map(
            (user, index) => (
              <motion.div
                key={
                  user._id
                }
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`rounded-2xl p-6 shadow-sm border ${
                  isDark
                    ? "bg-[#151823] border-[#1e293b]"
                    : "bg-white border-slate-200"
                }`}
              >
                {/* TOP */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2
                      className={`text-xl font-semibold ${
                        isDark
                          ? "text-white"
                          : ""
                      }`}
                    >
                      {
                        user.name
                      }
                    </h2>

                    <p
                      className={
                        isDark
                          ? "text-slate-400"
                          : "text-slate-500"
                      }
                    >
                      {
                        user.role
                      }
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      user.status ===
                      "Rejected"
                        ? "bg-red-500/20 text-red-400"
                        : user.status ===
                          "Shortlisted"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-orange-500/15 text-orange-400"
                    }`}
                  >
                    {
                      user.status
                    }
                  </span>
                </div>

                {/* SCORES */}
                <div className="grid md:grid-cols-5 gap-4 mb-6">
                  <ScoreCard
                    label="Confidence"
                    value={
                      user.confidence !== undefined && user.confidence !== null
                        ? user.confidence
                        : (user.communicationScore ? Math.round(user.communicationScore / 10) : "N/A")
                    }
                    isDark={
                      isDark
                    }
                  />

                  <ScoreCard
                    label="Communication"
                    value={
                      user.communicationScore !== undefined && user.communicationScore !== null
                        ? `${user.communicationScore}%`
                        : (user.communication !== undefined && user.communication !== null ? `${user.communication}/10` : "N/A")
                    }
                    isDark={
                      isDark
                    }
                  />

                  <ScoreCard
                    label="Technical"
                    value={
                      user.technicalScore !== undefined && user.technicalScore !== null
                        ? `${user.technicalScore}%`
                        : (user.technical !== undefined && user.technical !== null ? `${user.technical}/10` : "N/A")
                    }
                    isDark={
                      isDark
                    }
                  />

                  <ScoreCard
                    label="Problem Solving"
                    value={
                      user.problemSolving !== undefined && user.problemSolving !== null
                        ? user.problemSolving
                        : (user.technicalScore ? Math.round(user.technicalScore / 10) : "N/A")
                    }
                    isDark={
                      isDark
                    }
                  />

                  <ScoreCard
                    label="Overall"
                    value={
                      user.overallScore !== undefined && user.overallScore !== null
                        ? `${user.overallScore}%`
                        : (user.overall !== undefined && user.overall !== null ? `${user.overall}/10` : "N/A")
                    }
                    isDark={
                      isDark
                    }
                  />
                </div>

                {/* SUMMARY */}
                <div
                  className={`rounded-xl p-4 ${
                    isDark
                      ? "bg-[#1a1d2b]"
                      : "bg-slate-50"
                  }`}
                >
                  <h3
                    className={`font-semibold mb-2 ${
                      isDark
                        ? "text-white"
                        : ""
                    }`}
                  >
                    AI Analysis
                  </h3>

                  <p
                    className={
                      isDark
                        ? "text-slate-400"
                        : "text-slate-600"
                    }
                  >
                    {
                      user.summary || "No overview summary generated."
                    }
                  </p>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap gap-3 mt-5">
                  <button
                    onClick={() =>
                      handleStatusChange(
                        user._id,
                        "Shortlisted"
                      )
                    }
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                      isDark
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                    }`}
                  >
                    Shortlist
                  </button>

                  <button
                    onClick={() =>
                      handleStatusChange(
                        user._id,
                        "Rejected"
                      )
                    }
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                      isDark
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white"
                        : "bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                    }`}
                  >
                    Reject
                  </button>

                  <button
                    onClick={() =>
                      handleStatusChange(
                        user._id,
                        "Review Later"
                      )
                    }
                    className={`px-4 py-2 rounded-xl border text-sm font-semibold transition ${
                      isDark
                        ? "border-[#2d3348] text-slate-300 hover:bg-[#1a1d2b]"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Review Later
                  </button>

                  <button
                    onClick={() => toggleExpand(user._id)}
                    className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-semibold transition ml-auto ${
                      isDark
                        ? "border-[#2d3348] text-slate-300 hover:bg-[#1a1d2b]"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {expandedInterviewId === user._id ? (
                      <>
                        Hide Details <ChevronUp size={14} />
                      </>
                    ) : (
                      <>
                        View Details <ChevronDown size={14} />
                      </>
                    )}
                  </button>
                </div>

                {/* COLLAPSIBLE DETAILS */}
                {expandedInterviewId === user._id && (
                  <div className={`mt-6 pt-6 border-t ${
                    isDark ? "border-[#2d3348]" : "border-slate-100"
                  } space-y-6`}>
                    
                    {/* STRENGTHS & IMPROVEMENTS */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* STRENGTHS */}
                      <div className={`p-4 rounded-xl ${
                        isDark ? "bg-[#1a1d2b]" : "bg-green-50/10"
                      } border ${isDark ? "border-green-500/10" : "border-green-100"}`}>
                        <h4 className="text-sm font-bold text-green-500 mb-3 flex items-center gap-2">
                          <CheckCircle size={16} /> Key Strengths
                        </h4>
                        {user.strengths && user.strengths.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1.5">
                            {user.strengths.map((str, idx) => (
                              <li key={idx} className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                {str}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No specific strengths identified.</p>
                        )}
                      </div>

                      {/* IMPROVEMENTS */}
                      <div className={`p-4 rounded-xl ${
                        isDark ? "bg-[#1a1d2b]" : "bg-orange-50/10"
                      } border ${isDark ? "border-orange-500/10" : "border-orange-100"}`}>
                        <h4 className="text-sm font-bold text-orange-500 mb-3 flex items-center gap-2">
                          <AlertCircle size={16} /> Areas to Improve
                        </h4>
                        {user.improvements && user.improvements.length > 0 ? (
                          <ul className="list-disc list-inside space-y-1.5">
                            {user.improvements.map((imp, idx) => (
                              <li key={idx} className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                {imp}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-slate-400 italic">No specific improvement areas listed.</p>
                        )}
                      </div>
                    </div>

                    {/* Q&A TRANSCRIPT */}
                    <div className="space-y-4">
                      <h4 className={`text-sm font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-[#0D1B4C]"}`}>
                        <MessageSquare size={16} /> Interview Q&A Transcript
                      </h4>
                      {user.questions && user.questions.length > 0 ? (
                        <div className="space-y-4">
                          {user.questions.map((q, idx) => {
                            const questionText = q?.question || q;
                            const answerText = user.answers?.[idx] || "No response recorded.";
                            const feedbackItem = user.feedback?.[idx];

                            return (
                              <div key={idx} className={`p-4 rounded-xl border ${
                                isDark ? "bg-[#161925] border-[#252a3d]" : "bg-slate-50 border-slate-100"
                              }`}>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                  Question {idx + 1}
                                </p>
                                <p className={`text-sm font-bold mb-3 ${isDark ? "text-white" : "text-slate-800"}`}>
                                  "{questionText}"
                                </p>
                                <div className={`flex gap-3 p-3 rounded-lg border ${
                                  isDark ? "bg-[#1b1f2f] border-[#252a3d]" : "bg-white border-slate-100"
                                } mb-3`}>
                                  <MessageSquare size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                  <p className={`text-xs leading-relaxed italic ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                    Candidate Response: "{answerText}"
                                  </p>
                                </div>
                                {feedbackItem && (
                                  <div className={`p-3 rounded-lg border ${
                                    isDark ? "bg-orange-950/20 border-orange-500/10" : "bg-orange-50/20 border-orange-100"
                                  }`}>
                                    <div className="flex items-center gap-2 mb-1">
                                      <Zap size={14} className="text-orange-500" />
                                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">
                                        AI Score: {feedbackItem.score || feedbackItem.rating || 0} / 10
                                      </span>
                                    </div>
                                    <p className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                      {feedbackItem.feedback}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No Q&A transcript data found.</p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )
          )
        )}
      </div>
    </>
  );
}

// ================= SCORE CARD =================
function ScoreCard({
  label,
  value,
  isDark,
}) {
  return (
    <div
      className={`p-4 rounded-xl text-center ${
        isDark
          ? "bg-[#1a1d2b]"
          : "bg-slate-50"
      }`}
    >
      <p
        className={`text-sm ${
          isDark
            ? "text-slate-400"
            : "text-slate-500"
        }`}
      >
        {label}
      </p>

      <h3
        className={`text-2xl font-bold mt-1 ${
          isDark
            ? "text-white"
            : ""
        }`}
      >
        {value}
      </h3>
    </div>
  );
}