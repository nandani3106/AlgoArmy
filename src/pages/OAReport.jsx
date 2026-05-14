import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart3, Target, Zap, Clock, ChevronLeft, 
  Download, PieChart, TrendingUp, Award, Building2, CheckCircle, Loader2, AlertCircle
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import ScoreCard from '../components/ScoreCard';
import DashboardCard from '../components/DashboardCard';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_BASE = 'http://localhost:5000';

const OAReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const reportRef = useRef(null);
  
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_BASE}/api/oa/${id}/report`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          setReport(data.data);
        } else {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          } else {
            setError(data.message || 'Failed to load report');
          }
        }
      } catch (err) {
        setError('Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, navigate]);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      window.scrollTo(0, 0);
      const element = reportRef.current;
      if (!element) throw new Error("Report element not found");

      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#f8fafc',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      const height = pdfWidth / ratio;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, height);
      pdf.save(`OA_Report_${report?.oaTest?.company || 'Assessment'}.pdf`);
      
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('PDF Error:', err);
      alert('Report generation failed.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="text-orange-500 animate-spin" size={48} />
          <p className="text-slate-500 font-bold animate-pulse">Analyzing Performance Data...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !report) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center border border-red-100">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-[#0B1B3B]">Report not found</h3>
            <p className="text-slate-500 font-medium max-w-md">{error || 'You haven\'t submitted this assessment yet.'}</p>
          </div>
          <button 
            onClick={() => navigate('/oa')}
            className="px-8 py-3 bg-[#0B1B3B] text-white rounded-xl font-bold hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/10"
          >
            Back to Assessments
          </button>
        </div>
      </MainLayout>
    );
  }

  // Calculate some derived metrics
  const totalQuestions = report.oaTest?.totalQuestions || report.answers.length;
  const correctAnswers = report.answers.filter(a => a.isCorrect).length;
  const accuracy = Math.round((correctAnswers / (totalQuestions || 1)) * 100);

  return (
    <MainLayout>
      <div className="space-y-10 pb-12" ref={reportRef}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-slate-500 hover:text-[#0B1B3B] font-bold transition-colors group"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl md:text-4xl font-black text-[#0B1B3B] tracking-tight flex items-center gap-4">
              Performance Analysis
              <span className="px-4 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest border border-orange-100">
                Official Report
              </span>
            </h1>
          </div>
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-900/5 border ${
              downloaded 
                ? 'bg-green-500 border-green-600 text-white' 
                : 'bg-white border-slate-200 text-[#0B1B3B] hover:bg-slate-50'
            }`}
          >
            {downloading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : downloaded ? (
              <CheckCircle size={18} />
            ) : (
              <Download size={18} />
            )}
            {downloading ? 'Generating PDF...' : downloaded ? 'Report Saved!' : 'Download Report'}
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <ScoreCard 
            title="Total Score" 
            value={`${report.score} pts`}
            subtitle="Based on correctness" 
            icon={Target} 
            color="navy"
          />
          <ScoreCard 
            title="Accuracy" 
            value={`${accuracy}%`}
            subtitle={`${correctAnswers}/${totalQuestions} Correct`} 
            icon={Zap} 
            color="orange"
          />
          <ScoreCard 
            title="Difficulty" 
            value={report.oaTest?.difficulty || 'Medium'} 
            subtitle="Level of Assessment" 
            icon={Award} 
            color="blue"
          />
          <ScoreCard 
            title="Status" 
            value="Submitted"
            subtitle={new Date(report.submittedAt).toLocaleDateString()} 
            icon={Clock} 
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sectional Breakdown */}
          <div className="lg:col-span-8 space-y-8">
            <DashboardCard title="Results Breakdown" icon={PieChart}>
              <div className="space-y-6">
                <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <h4 className="font-black text-[#0B1B3B] uppercase tracking-tighter">MCQ Performance</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency: Optimal</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-50 text-green-600 border border-green-100">
                        {accuracy >= 80 ? 'Excellent' : accuracy >= 60 ? 'Good' : 'Needs Work'}
                      </span>
                      <span className="text-xl font-black text-[#0B1B3B]">{accuracy}%</span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-white rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className="h-full bg-[#0B1B3B] transition-all duration-1000 ease-out" 
                      style={{ width: `${accuracy}%` }}
                    />
                  </div>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Strengths & Improvements" icon={TrendingUp}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-green-600 uppercase tracking-widest px-4 py-2 bg-green-50 rounded-xl w-fit">Identified Strengths</h4>
                  <ul className="space-y-3">
                    {accuracy > 70 ? (
                      ['Concept Fundamentals', 'Technical Accuracy', 'Time Efficiency'].map((s, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          {s}
                        </li>
                      ))
                    ) : (
                      ['Attempt Persistence', 'Rule Adherence'].map((s, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          {s}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest px-4 py-2 bg-orange-50 rounded-xl w-fit">Improvement Areas</h4>
                  <ul className="space-y-3">
                    {accuracy < 100 ? (
                      ['Advanced Logic Application', 'Mistake Analysis', 'Speed Optimization'].map((s, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <div className="w-2 h-2 rounded-full bg-orange-500" />
                          {s}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm font-bold text-slate-500">No major improvement areas identified. Perfect score!</li>
                    )}
                  </ul>
                </div>
              </div>
            </DashboardCard>
          </div>

          {/* Recruiter Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <DashboardCard className="!p-8 bg-[#0B1B3B] text-white">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6 border border-white/10">
                  <Building2 size={40} className="text-orange-400" />
                </div>
                <h3 className="text-2xl font-black mb-2">Company Insight</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Your performance in this assessment has been recorded for <span className="text-white font-bold">{report.oaTest?.company || 'Recruiter'}</span>.
                </p>
                <div className="w-full p-6 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Evaluation Status</p>
                  <p className={`text-sm font-bold ${accuracy >= 80 ? 'text-green-400' : 'text-orange-400'}`}>
                    {accuracy >= 80 ? 'High Recommendation' : 'Evaluation in Progress'}
                  </p>
                </div>
              </div>
            </DashboardCard>

            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/20">
              <h4 className="text-lg font-black mb-4">Share Accomplishment</h4>
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                Add this assessment result to your LinkedIn profile to attract more recruiters.
              </p>
              <button className="w-full py-4 rounded-xl bg-white text-orange-600 font-black text-xs uppercase tracking-widest hover:bg-orange-50 transition-all">
                Add to LinkedIn
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OAReport;
