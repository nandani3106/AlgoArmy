import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart3, Target, Zap, Clock, ChevronLeft, 
  Download, PieChart, TrendingUp, Award, Building2,
  Video, MessageSquare, CheckCircle, AlertCircle,
  Code2, Briefcase, Loader2
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import ScoreCard from '../components/ScoreCard';
import DashboardCard from '../components/DashboardCard';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_BASE = 'http://localhost:5000';

const InterviewReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/results/interview/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setReport(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

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
        backgroundColor: '#fafaf9',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      const height = pdfWidth / ratio;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, height);
      pdf.save(`Interview_Report_${id}.pdf`);
      
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('PDF Error:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <MainLayout>
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 size={40} className="animate-spin text-orange-500" />
        <p className="font-black uppercase tracking-widest text-xs">Loading evaluation...</p>
      </div>
    </MainLayout>
  );

  if (!report) return (
    <MainLayout>
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <AlertCircle size={40} className="text-red-500" />
        <p className="font-black uppercase tracking-widest text-xs text-red-500">Report not found</p>
        <button onClick={() => navigate('/dashboard')} className="text-sm font-bold text-[#0B1B3B] underline underline-offset-4">Return to Dashboard</button>
      </div>
    </MainLayout>
  );

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
              Interview Evaluation
              <span className="px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                AI Verified
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
            {downloading ? <Loader2 size={18} className="animate-spin" /> : downloaded ? <CheckCircle size={18} /> : <Download size={18} />}
            {downloading ? 'Generating PDF...' : downloaded ? 'Report Saved!' : 'Download Detailed Report'}
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <ScoreCard 
            title="Technical Score" 
            value={`${report.technicalScore || 0}%`} 
            subtitle="Knowledge accuracy" 
            icon={Target} 
            color="navy"
          />
          <ScoreCard 
            title="Communication" 
            value={`${report.communicationScore || 0}%`} 
            subtitle="Clarity & Precision" 
            icon={MessageSquare} 
            color="orange"
          />
          <ScoreCard 
            title="Overall Score" 
            value={`${report.overallScore || 0}%`} 
            subtitle="Cumulative result" 
            icon={TrendingUp} 
            color="blue"
          />
          <ScoreCard 
            title="Session Rank" 
            value={report.overallScore > 80 ? 'Elite' : report.overallScore > 60 ? 'Pro' : 'Beginner'} 
            subtitle="Performance level" 
            icon={Award} 
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Analysis */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <DashboardCard title="Key Strengths" icon={TrendingUp}>
                <div className="space-y-4">
                  {(report.strengths || []).map((s, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-green-50/50 border border-green-100">
                      <CheckCircle className="text-green-500 shrink-0 mt-1" size={18} />
                      <p className="text-sm font-bold text-[#0B1B3B] leading-relaxed">{s}</p>
                    </div>
                  ))}
                  {(!report.strengths || report.strengths.length === 0) && <p className="text-xs text-slate-400 italic">No specific strengths identified</p>}
                </div>
              </DashboardCard>

              <DashboardCard title="Areas to Improve" icon={AlertCircle}>
                <div className="space-y-4">
                  {(report.improvements || []).map((s, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
                      <AlertCircle className="text-orange-500 shrink-0 mt-1" size={18} />
                      <p className="text-sm font-bold text-[#0B1B3B] leading-relaxed">{s}</p>
                    </div>
                  ))}
                  {(!report.improvements || report.improvements.length === 0) && <p className="text-xs text-slate-400 italic">No improvement areas listed</p>}
                </div>
              </DashboardCard>
            </div>

            <DashboardCard title="Evaluation Feedback" icon={MessageSquare}>
              <div className="space-y-6">
                {(report.questions || []).map((q, idx) => (
                  <div key={idx} className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Question {idx + 1}</p>
                    <p className="text-sm font-bold text-[#0B1B3B] mb-4">"{q}"</p>
                    <div className="flex gap-3 p-4 bg-white rounded-2xl border border-slate-100 mb-4">
                       <MessageSquare size={16} className="text-blue-500 shrink-0" />
                       <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                          Your Answer: "{report.answers[idx] || "N/A"}"
                       </p>
                    </div>
                    {/* Placeholder for question-specific AI feedback if available */}
                    <div className="flex gap-3 p-4 bg-orange-50/30 rounded-2xl border border-orange-100/50">
                       <Zap size={16} className="text-orange-500 shrink-0" />
                       <p className="text-xs text-slate-600 font-bold leading-relaxed">
                          AI feedback integrated into overall scores and strengths.
                       </p>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <DashboardCard className="!p-10 bg-[#0B1B3B] text-white">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-6 border border-white/10">
                  <PieChart size={40} className="text-orange-400" />
                </div>
                <h3 className="text-2xl font-black mb-2">Competency Map</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                   Your performance matches a {report.overallScore > 75 ? 'Professional' : 'Junior'} level engineer.
                </p>
                <button 
                  onClick={() => navigate('/interviews')}
                  className="w-full py-4 rounded-xl bg-orange-600 text-white font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-all"
                >
                  Retake for Improvement
                </button>
              </div>
            </DashboardCard>

            <DashboardCard title="Candidate Profile" icon={Code2}>
               <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                     <Clock size={16} className="text-orange-500" />
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Session Date</p>
                        <p className="text-xs font-bold text-[#0B1B3B]">{new Date(report.createdAt).toLocaleDateString()}</p>
                     </div>
                  </div>
               </div>
            </DashboardCard>

            <DashboardCard title="Suggested Resources" icon={Building2}>
              <div className="space-y-4">
                {['Technical Deep Dive Guide', 'System Architecture Fundamentals', 'Behavioral Interview Masterclass'].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white transition-all cursor-pointer">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-xs font-bold text-[#0B1B3B]">{r}</span>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default InterviewReport;
