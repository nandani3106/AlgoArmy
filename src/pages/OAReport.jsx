import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart3, Target, Zap, Clock, ChevronLeft,
  Download, PieChart, Award, Building2, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import ScoreCard from '../components/ScoreCard';
import DashboardCard from '../components/DashboardCard';

const API_BASE = 'http://localhost:5000';

const OAReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || id === 'undefined') {
      setError('Invalid Assessment ID');
      setLoading(false);
      return;
    }
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE}/api/oa/${id}/report`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setReport(data.submission);
        } else {
          setError(data.message || `Error: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Network connection failed. Please ensure the server is running.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    } else {
      setError("Invalid Assessment ID");
      setLoading(false);
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="animate-spin text-orange-500" size={48} />
          <p className="text-slate-500 font-bold text-lg animate-pulse">Loading report...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
          <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
            <AlertCircle size={48} className="text-red-500 mb-4 mx-auto" />
            <h3 className="text-xl font-black text-red-700 mb-2">Report Error</h3>
            <p className="text-red-600 font-medium max-w-md">{error}</p>
          </div>
          <button
            onClick={() => navigate('/oa')}
            className="px-8 py-3 bg-[#0B1B3B] text-white rounded-xl font-bold hover:bg-navy-800 transition-all"
          >
            Back to Assessments
          </button>
        </div>
      </MainLayout>
    );
  }

  if (!report) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 mb-6">
            <Award size={48} className="text-orange-400 mb-4 mx-auto" />
            <h3 className="text-xl font-black text-[#0B1B3B] mb-2">No report available.</h3>
            <p className="text-slate-500 font-medium max-w-sm">
              We couldn't find a submission for this assessment. Please complete the test first.
            </p>
          </div>
          <button
            onClick={() => navigate('/oa')}
            className="px-8 py-3 bg-[#0B1B3B] text-white rounded-xl font-bold transition-all"
          >
            Go to Assessments
          </button>
        </div>
      </MainLayout>
    );
  }

  // Defensive calculations
  const percentage = report?.percentage ?? 0;
  const score = report?.score ?? 0;
  const totalPossible = report?.totalPossibleScore ?? 0;
  const attempted = report?.attemptedQuestions ?? 0;
  const total = report?.totalQuestions ?? 0;
  const correct = report?.correctAnswers ?? 0;
  const incorrect = report?.incorrectAnswers ?? 0;

  return (
    <MainLayout>
      <div className="space-y-10 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-slate-500 hover:text-[#0B1B3B] font-bold transition-colors group"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl md:text-4xl font-black text-[#0B1B3B] tracking-tight">
              {report?.oaTest?.title || 'Performance Report'}
            </h1>
            <div className="flex items-center gap-4 text-slate-500 font-bold">
              <span className="flex items-center gap-1.5"><Building2 size={16} /> {report?.oaTest?.company || 'AlgoArmy'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
              <span className="uppercase tracking-widest text-[10px]">{report?.oaTest?.difficulty || 'Medium'}</span>
            </div>
          </div>
          <button className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white border border-slate-200 text-[#0B1B3B] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">
            <Download size={18} />
            Download PDF
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <ScoreCard
            title="Total Score"
            value={`${score} / ${totalPossible}`}
            subtitle="Points Secured"
            icon={Target}
            color="navy"
          />
          <ScoreCard
            title="Accuracy"
            value={`${percentage}%`}
            subtitle={`${correct} Correct Answers`}
            icon={Zap}
            color="orange"
          />
          <ScoreCard
            title="Questions"
            value={`${attempted} / ${total}`}
            subtitle="Attempt Rate"
            icon={BarChart3}
            color="blue"
          />
          <ScoreCard
            title="Submission"
            value={report?.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : 'N/A'}
            subtitle="Finalized Status"
            icon={Clock}
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Analytics Area */}
          <div className="lg:col-span-8 space-y-8">
            <DashboardCard title="Performance Insights" icon={PieChart}>
              <div className="space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest mb-1">Correct</p>
                    <p className="text-2xl font-black text-green-700">{correct}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Incorrect</p>
                    <p className="text-2xl font-black text-red-700">{incorrect}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Skipped</p>
                    <p className="text-2xl font-black text-slate-700">{total - attempted}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-[#0B1B3B]">Overall Grade</h4>
                    <span className="text-2xl font-black text-orange-600">{percentage}%</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-1">
                    <div
                      className="h-full bg-[#0B1B3B] rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="p-6 bg-[#0B1B3B] rounded-3xl text-white">
                  <p className="text-xs font-bold leading-relaxed opacity-90">
                    {percentage >= 85 ? "Excellent work! You've demonstrated a high level of mastery in the required skills. Your performance is in the top tier." :
                      percentage >= 70 ? "Great job! You have a solid understanding of the concepts. A bit more focus on edge cases could further improve your results." :
                        percentage >= 50 ? "Good attempt. You have the fundamentals down, but there's significant room for growth in complex problem solving." :
                          "Keep practicing. Reviewing the core concepts and attempting more mock tests will help you improve your score."}
                  </p>
                </div>
              </div>
            </DashboardCard>

            {/* Answers Table */}
            <DashboardCard title="Question Analysis" icon={BarChart3}>
              <div className="space-y-4">
                {(report?.answers || []).map((ans, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${ans?.isCorrect ? 'bg-green-100 text-green-700' : ans?.answer ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-500'
                        }`}>
                        {idx + 1}
                      </div>
                      <p className="text-sm font-bold text-[#0B1B3B]">Question {idx + 1}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-black text-slate-400">{ans?.pointsEarned || 0} Pts</span>
                      {ans?.isCorrect ? (
                        <CheckCircle size={18} className="text-green-500" />
                      ) : (
                        <AlertCircle size={18} className={ans?.answer ? "text-red-500" : "text-slate-300"} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-orange-500/20">
              <Trophy size={32} className="mb-6" />
              <h3 className="text-2xl font-black mb-3 italic tracking-tight">Verified Result</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-6 font-medium">
                This assessment has been proctored and verified by AlgoArmy's integrity engine.
              </p>
              <div className="py-3 px-4 bg-white/10 rounded-xl border border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest">ID Verification</span>
                <span className="text-[10px] font-black uppercase bg-white text-orange-600 px-2 py-0.5 rounded">Passed</span>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-orange-100 shadow-xl shadow-orange-900/5">
              <h4 className="font-black text-[#0B1B3B] mb-4">Next Steps</h4>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/oa')}
                  className="w-full py-4 bg-[#0B1B3B] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-navy-800 transition-all"
                >
                  Try More Tests
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full py-4 bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Return Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OAReport;

const Trophy = ({ size, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);
