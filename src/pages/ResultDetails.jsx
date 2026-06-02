import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import ScoreCard from '../components/ScoreCard';
import DashboardCard from '../components/DashboardCard';
import BrandLogo from '../components/BrandLogo';
import {
  Trophy, Award, Target, Clock, Zap, ChevronLeft,
  Download, PieChart, TrendingUp, Building2, Video,
  MessageSquare, CheckCircle, AlertCircle, BarChart3, Share2, Loader2,
  Code2, Timer, Database, Activity, ChevronDown, ChevronUp, XCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const API_BASE = 'http://localhost:5000';

const ResultDetails = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [expandedSub, setExpandedSub] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchResultData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };
        let endpoint = '';

        if (type === 'contest') endpoint = `${API_BASE}/api/contests/${id}/results`;
        else if (type === 'oa') endpoint = `${API_BASE}/api/results/oa`;
        else if (type === 'interview') endpoint = `${API_BASE}/api/results/interviews`;

        const response = await fetch(endpoint, { headers });
        const resultData = await response.json();

        if (resultData.success) {
          if (type === 'contest') {
             // For contest, it returns a list of submissions for this user
             setData(resultData.submissions);
          } else {
            const item = resultData.data.find((r) => {
              const resultId = type === 'oa' ? (r.oaTest?._id || r.oaTest || r._id || r.id) : (r._id || r.id);
              return resultId === id;
            });
            setData(item);
          }
        } else {
          setError(resultData.message || 'Failed to fetch details');
        }
      } catch (err) {
        setError('Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchResultData();
  }, [type, id, navigate]);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      window.scrollTo(0, 0);
      const element = reportRef.current;
      const canvas = await html2canvas(element, { scale: 1.5, useCORS: true, backgroundColor: '#f8fafc' });
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const height = pdfWidth / (imgProps.width / imgProps.height);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, height);
      pdf.save(`AlgoArmy_${type}_Report.pdf`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="text-orange-500 animate-spin" size={48} />
          <p className="text-slate-500 font-bold animate-pulse">Loading Detailed Report...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !data) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
          <AlertCircle size={64} className="text-red-500" />
          <h3 className="text-2xl font-black text-[#0B1B3B]">Result Details Not Found</h3>
          <p className="text-slate-500 font-medium max-w-md">{error}</p>
          <button onClick={() => navigate('/results')} className="px-8 py-3 bg-[#0B1B3B] text-white rounded-xl font-bold">Back to Results</button>
        </div>
      </MainLayout>
    );
  }

  // 🏆 Contest Layout
  const renderContestReport = () => {
    const submissions = Array.isArray(data) ? data : [];
    
    // Group by problem ID and sum the maximum score per problem to avoid duplicate correct scores
    const problemScores = {};
    submissions.forEach(s => {
      if (s.problem) {
        const pId = s.problem._id || s.problem;
        problemScores[pId] = Math.max(problemScores[pId] || 0, s.score || 0);
      }
    });
    const totalScore = Object.values(problemScores).reduce((sum, val) => sum + val, 0);
    const contestTitle = submissions[0]?.contest?.title || submissions[0]?.problem?.contest?.title || "Contest Performance";

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <ScoreCard title="Total Score" value={`${totalScore} pts`} subtitle="Aggregated" icon={Target} color="navy" />
          <ScoreCard title="Submissions" value={submissions.length} subtitle="Attempts Made" icon={Activity} color="orange" />
          <ScoreCard title="Status" value="Evaluated" subtitle="All Graded" icon={CheckCircle} color="blue" />
          <ScoreCard title="Verification" value="Passed" subtitle="Integrity Check" icon={Zap} color="green" />
        </div>

        <DashboardCard title="Problem-wise Breakdown" icon={BarChart3}>
          <div className="space-y-6">
            {submissions.map((sub, idx) => {
              const isExpanded = expandedSub === idx;
              const subVerdict = sub.verdict || sub.status || 'Submitted';
              return (
                <div key={idx} className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden transition-all">
                  <button 
                    onClick={() => setExpandedSub(isExpanded ? null : idx)}
                    className="w-full flex items-center justify-between p-6 hover:bg-slate-100/50 transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${
                        subVerdict === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {String.fromCharCode(65 + (sub.problem?.order || idx))}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-[#0B1B3B]">{sub.problem?.title || "Problem"}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          {sub.score || 0} / {sub.problem?.points || 0} Points • {sub.language}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                         subVerdict === 'Accepted' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
                       }`}>{subVerdict}</span>
                       {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-8 space-y-6 border-t border-slate-200/50 pt-6">
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-white p-4 rounded-2xl border border-slate-100">
                             <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Execution Time</p>
                             <p className="text-xs font-black text-[#0B1B3B]">{sub.executionTime || 'N/A'}</p>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-slate-100">
                             <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Memory Used</p>
                             <p className="text-xs font-black text-[#0B1B3B]">{sub.memoryUsed || 'N/A'}</p>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-slate-100">
                             <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Pass Rate</p>
                             <p className="text-xs font-black text-[#0B1B3B]">{sub.passedTests || 0} / {sub.totalTests || 0}</p>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-slate-100">
                             <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Complexity</p>
                             <p className="text-xs font-black text-[#0B1B3B] uppercase">{sub.timeComplexity || 'O(n)'}</p>
                          </div>
                       </div>

                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Code2 size={12} /> Submitted Code
                          </p>
                          <div className="bg-[#1e1e1e] rounded-2xl p-6 font-mono text-xs text-slate-300 overflow-x-auto custom-scrollbar">
                             <pre>{sub.code}</pre>
                          </div>
                       </div>

                       {sub.detailedResults && sub.detailedResults.length > 0 && (
                         <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                              <Activity size={12} /> Test Case Details
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                               {sub.detailedResults.map((res, trIdx) => (
                                 <div key={trIdx} className={`p-4 rounded-xl border flex items-center justify-between ${res.passed ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                    <div className="flex items-center gap-3">
                                       {res.passed ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                                       <span className={`text-[10px] font-black uppercase ${res.passed ? 'text-green-700' : 'text-red-700'}`}>Test Case {trIdx + 1}</span>
                                    </div>
                                 </div>
                               ))}
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
    );
  };

  // 📝 OA Layout (Legacy or direct access)
  const renderOAReport = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <ScoreCard title="Overall Score" value={`${data?.score || 0} pts`} subtitle="Evaluated" icon={Target} color="navy" />
        <ScoreCard title="Company" value={data?.company || 'N/A'} subtitle="Official Assessment" icon={Building2} color="orange" />
        <ScoreCard title="Accuracy" value={`${data?.percentage || 0}%`} subtitle="High Precision" icon={Zap} color="blue" />
        <ScoreCard title="Submitted" value={data?.submittedAt ? new Date(data.submittedAt).toLocaleDateString() : 'N/A'} subtitle="System Logged" icon={Clock} color="green" />
      </div>
      <DashboardCard title="Performance Summary" icon={PieChart}>
          <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-center">
             <p className="text-slate-500 font-bold">Please use the dedicated OA Report page for detailed analysis.</p>
             <button onClick={() => navigate(`/oa/${id}/report`)} className="mt-4 px-6 py-2 bg-[#0B1B3B] text-white rounded-xl text-xs font-black uppercase tracking-widest">Open Detailed Report</button>
          </div>
      </DashboardCard>
    </div>
  );

  // 🎤 Interview Layout
  const renderInterviewReport = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <ScoreCard title="Technical" value={`${data.technicalScore || 0}%`} subtitle="Foundations" icon={Target} color="navy" />
        <ScoreCard title="Communication" value={`${data.communicationScore || 0}%`} subtitle="Clarity" icon={MessageSquare} color="orange" />
        <ScoreCard title="Overall Rating" value={`${data.overallScore || 0}%`} subtitle="AI Analysis" icon={Award} color="green" />
        <ScoreCard title="Date" value={new Date(data.createdAt).toLocaleDateString()} subtitle="Evaluated" icon={Clock} color="blue" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <DashboardCard title="Strengths & Insights" icon={TrendingUp}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-3xl">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-4">Core Strengths</h5>
                <ul className="space-y-2">
                  {(data.strengths || ['Good technical knowledge', 'Clear articulation']).map((s, i) => (
                    <li key={i} className="text-sm font-bold text-green-800 dark:text-green-200 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-3xl">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-4">Improvement Areas</h5>
                <ul className="space-y-2">
                  {(data.improvements || ['Practice edge cases', 'Reduce fillers']).map((s, i) => (
                    <li key={i} className="text-sm font-bold text-orange-800 dark:text-orange-200 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-600" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="Evaluation Feedback" icon={MessageSquare}>
            <div className="space-y-6">
              {(data.questions || []).map((q, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Question {idx + 1}</p>
                  <p className="text-sm font-bold text-[#0B1B3B] mb-4">"{q?.question || q}"</p>
                  <div className="flex gap-3 p-4 bg-white rounded-2xl border border-slate-100 mb-4">
                     <MessageSquare size={16} className="text-blue-500 shrink-0" />
                     <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                        Your Answer: "{data.answers[idx] || "N/A"}"
                     </p>
                  </div>
                  
                  {data.feedback && data.feedback[idx] ? (
                    <div className="flex flex-col gap-2 p-4 bg-orange-50/30 rounded-2xl border border-orange-100/50">
                       <div className="flex gap-3 items-center">
                          <Zap size={16} className="text-orange-500 shrink-0" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">Question Score: {data.feedback[idx].score || data.feedback[idx].rating || 0} / 10</span>
                       </div>
                       <p className="text-xs text-slate-700 font-bold leading-relaxed pl-7">
                          {data.feedback[idx].feedback}
                       </p>
                    </div>
                  ) : (
                    <div className="flex gap-3 p-4 bg-orange-50/30 rounded-2xl border border-orange-100/50">
                       <Zap size={16} className="text-orange-500 shrink-0" />
                       <p className="text-xs text-slate-600 font-bold leading-relaxed">
                          AI feedback integrated into overall scores and strengths.
                       </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );

  const getReportTitle = () => {
    if (type === 'contest') return Array.isArray(data) && data.length > 0 ? (data[0]?.contest?.title || data[0]?.problem?.contest?.title || "Contest Report") : "Contest Report";
    if (type === 'oa') return data?.testTitle || "OA Report";
    if (type === 'interview') return 'AI Technical Interview Result';
    return 'Performance Report';
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-10 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <button onClick={() => navigate('/results')} className="flex items-center gap-2 text-slate-500 hover:text-[#0B1B3B] font-bold transition-colors group">
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to All Results
            </button>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl md:text-4xl font-black text-[#0B1B3B] tracking-tight">{getReportTitle()}</h1>
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${type === 'contest' ? 'bg-amber-50 text-amber-600 border-amber-100' : type === 'oa' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                {type}
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-[#0B1B3B] transition-all shadow-sm">
              <Share2 size={20} />
            </button>
            <button onClick={handleDownload} disabled={downloading} className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#0B1B3B] text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-navy-900/20">
              <Download size={18} />
              {downloading ? 'Generating...' : 'Download Report'}
            </button>
          </div>
        </div>

        <div ref={reportRef} className="space-y-10 bg-white p-8 md:p-12 rounded-[2rem] border border-slate-100/80 shadow-sm">
          {/* PDF Report Header with Logo */}
          <div className="flex items-center justify-between pb-8 border-b border-slate-100">
            <BrandLogo size="md" showText={true} clickable={false} />
            <div className="text-right">
              <p className="text-[10px] font-black text-[#0B1B3B] uppercase tracking-[0.2em] mb-1">Official Candidate Report</p>
              <p className="text-xs font-bold text-slate-400">Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          {type === 'contest' && renderContestReport()}
          {type === 'oa' && renderOAReport()}
          {type === 'interview' && renderInterviewReport()}
        </div>

        <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-100">
          <button onClick={() => navigate('/results')} className="px-8 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">Back to Results</button>
        </div>
      </div>
    </MainLayout>
  );
};

export default ResultDetails;
