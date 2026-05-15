import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import ScoreCard from '../components/ScoreCard';
import DashboardCard from '../components/DashboardCard';
import {
  Target, Zap, Clock, Building2, CheckCircle, AlertCircle, BarChart3, Loader2,
  Code2, Timer, Database, Activity, ChevronDown, ChevronUp, XCircle, FileText
} from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const OAReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQ, setExpandedQ] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const response = await fetch(`${API_BASE}/api/oa/${id}/report`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.success) {
          setData(result.submission);
        } else {
          setError(result.message || 'Failed to fetch report');
        }
      } catch (err) {
        setError('Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, navigate]);

  if (loading) return (
    <MainLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-orange-500 animate-spin" size={48} />
        <p className="text-slate-500 font-bold animate-pulse">Generating Performance Report...</p>
      </div>
    </MainLayout>
  );

  if (error || !data) return (
    <MainLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <AlertCircle size={64} className="text-red-500" />
        <h3 className="text-2xl font-black text-[#0B1B3B]">Report Not Available</h3>
        <p className="text-slate-500 font-medium max-w-md">{error}</p>
        <button onClick={() => navigate('/results')} className="px-8 py-3 bg-[#0B1B3B] text-white rounded-xl font-bold">Back to Results</button>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-10 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black text-[#0B1B3B] tracking-tight">{data.oaTest?.title}</h1>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-500 font-bold text-sm">
                <Building2 size={16} className="text-orange-500" /> {data.oaTest?.company}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{data.oaTest?.difficulty} Assessment</span>
            </div>
          </div>
          <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Percentage Score</p>
                <p className="text-2xl font-black text-orange-600">{data.percentage}%</p>
             </div>
             <div className="w-px h-10 bg-slate-100" />
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Final Status</p>
                <p className="text-xs font-black text-green-600 uppercase tracking-widest">Completed</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <ScoreCard title="Score" value={`${data.score} / ${data.totalPossibleScore}`} subtitle="Points Earned" icon={Target} color="navy" />
          <ScoreCard title="Accuracy" value={`${data.correctAnswers} Correct`} subtitle={`${data.incorrectAnswers} Incorrect`} icon={Zap} color="orange" />
          <ScoreCard title="Questions" value={data.totalQuestions} subtitle={`${data.attemptedQuestions} Attempted`} icon={Activity} color="blue" />
          <ScoreCard title="Time Spent" value="42m" subtitle={new Date(data.submittedAt).toLocaleDateString()} icon={Clock} color="green" />
        </div>

        <DashboardCard title="Question Breakdown" icon={BarChart3}>
          <div className="space-y-6">
            {data.answers.map((ans, idx) => {
              const isExpanded = expandedQ === idx;
              const isCoding = ans.language !== undefined;

              return (
                <div key={idx} className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden transition-all">
                  <button 
                    onClick={() => setExpandedQ(isExpanded ? null : idx)}
                    className="w-full flex items-center justify-between p-6 hover:bg-slate-100/50 transition-all text-left"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                        ans.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#0B1B3B] mb-1">Question {idx + 1} ({isCoding ? 'Coding' : 'MCQ'})</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {ans.isCorrect ? 'Correct' : 'Incorrect'} • {ans.pointsEarned} Points
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       {isCoding && (
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                           ans.verdict === 'Accepted' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                         }`}>{ans.verdict || 'WA'}</span>
                       )}
                       {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-8 space-y-6 border-t border-slate-200/50 pt-6">
                       {isCoding ? (
                         <>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-white p-4 rounded-2xl border border-slate-100">
                                 <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Execution Time</p>
                                 <p className="text-xs font-black text-[#0B1B3B]">{ans.executionTime || 'N/A'}</p>
                              </div>
                              <div className="bg-white p-4 rounded-2xl border border-slate-100">
                                 <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Memory Used</p>
                                 <p className="text-xs font-black text-[#0B1B3B]">{ans.memoryUsed || 'N/A'}</p>
                              </div>
                              <div className="bg-white p-4 rounded-2xl border border-slate-100">
                                 <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Pass Rate</p>
                                 <p className="text-xs font-black text-[#0B1B3B]">{ans.passedTests || 0} / {ans.totalTests || 0}</p>
                              </div>
                              <div className="bg-white p-4 rounded-2xl border border-slate-100">
                                 <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Complexity</p>
                                 <p className="text-xs font-black text-[#0B1B3B] uppercase">{ans.complexityEstimate || 'O(n)'}</p>
                              </div>
                           </div>

                           <div className="space-y-2">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Code2 size={12} /> Your Solution ({ans.language})
                              </p>
                              <div className="bg-[#1e1e1e] rounded-2xl p-6 font-mono text-xs text-slate-300 overflow-x-auto">
                                 <pre>{ans.answer}</pre>
                              </div>
                           </div>

                           {ans.detailedResults && ans.detailedResults.length > 0 && (
                             <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                  <Activity size={12} /> Test Case Details
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                   {ans.detailedResults.map((res, trIdx) => (
                                     <div key={trIdx} className={`p-4 rounded-xl border flex items-center justify-between ${res.passed ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                        <div className="flex items-center gap-3">
                                           {res.passed ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                                           <span className={`text-[10px] font-black uppercase ${res.passed ? 'text-green-700' : 'text-red-700'}`}>
                                              Test Case {trIdx + 1} {res.isHidden ? '(Hidden)' : ''}
                                           </span>
                                        </div>
                                        <span className="text-[8px] font-black uppercase text-slate-400">{res.status}</span>
                                     </div>
                                   ))}
                                </div>
                             </div>
                           )}
                         </>
                       ) : (
                         <div className="space-y-4">
                            <div className="flex items-center gap-2">
                               <FileText size={16} className="text-slate-400" />
                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">MCQ Answer Details</p>
                            </div>
                            <div className="p-6 bg-white rounded-2xl border border-slate-100">
                               <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest">Your Answer</p>
                               <p className={`text-sm font-black ${ans.isCorrect ? 'text-green-600' : 'text-red-600'}`}>{ans.answer || 'No answer provided'}</p>
                            </div>
                         </div>
                       )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </DashboardCard>
      </div>
    </MainLayout>
  );
};

export default OAReport;
