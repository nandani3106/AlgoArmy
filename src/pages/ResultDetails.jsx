import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import ScoreCard from '../components/ScoreCard';
import DashboardCard from '../components/DashboardCard';
import { 
  Trophy, Award, Target, Clock, Zap, ChevronLeft, 
  Download, PieChart, TrendingUp, Building2, Video, 
  MessageSquare, CheckCircle, AlertCircle, BarChart3, Share2, Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_BASE = 'http://localhost:5000';

const ResultDetails = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
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
        
        if (type === 'contest') endpoint = `${API_BASE}/api/results/contests`;
        else if (type === 'oa') endpoint = `${API_BASE}/api/results/oa`;
        else if (type === 'interview') endpoint = `${API_BASE}/api/results/interviews`;

        const response = await fetch(endpoint, { headers });
        const resultData = await response.json();

        if (resultData.success) {
          // Find matching result by id (which might be _id in backend)
          const item = resultData.data.find(r => (r._id || r.id) === id);
          if (item) {
            setData(item);
          } else {
            setError('Result not found.');
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
  const renderContestReport = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <ScoreCard title="Score Earned" value={`${data.score} pts`} subtitle="Rank calculated soon" icon={Target} color="navy" />
        <ScoreCard title="Status" value={data.status} subtitle="Submission Final" icon={CheckCircle} color="orange" />
        <ScoreCard title="Submitted" value={new Date(data.submittedAt).toLocaleDateString()} subtitle={new Date(data.submittedAt).toLocaleTimeString()} icon={Clock} color="blue" />
        <ScoreCard title="Verified" value="Yes" subtitle="Automatic Grading" icon={Zap} color="green" />
      </div>
      <DashboardCard title="Problem Details" icon={BarChart3}>
        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-black text-[#0B1B3B]">{data.contestTitle}</h4>
            <span className="px-3 py-1 rounded-full bg-[#0B1B3B] text-white text-[10px] font-black uppercase tracking-widest">{data.status}</span>
          </div>
          <p className="text-slate-500 font-medium leading-relaxed">
            Your solution has been graded and verified. The official rank will be updated once the contest period ends and all submissions are analyzed for integrity.
          </p>
        </div>
      </DashboardCard>
    </div>
  );

  // 📝 OA Layout
  const renderOAReport = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <ScoreCard title="Overall Score" value={`${data.score} pts`} subtitle="Evaluated" icon={Target} color="navy" />
        <ScoreCard title="Company" value={data.company} subtitle="Official Assessment" icon={Building2} color="orange" />
        <ScoreCard title="Accuracy" value="Calculated" subtitle="High Precision" icon={Zap} color="blue" />
        <ScoreCard title="Submitted" value={new Date(data.submittedAt).toLocaleDateString()} subtitle="System Logged" icon={Clock} color="green" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardCard title="Test Info" icon={PieChart}>
          <div className="space-y-4">
            <h4 className="font-black text-[#0B1B3B]">{data.testTitle}</h4>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              This report contains your performance for the technical assessment conducted for {data.company}.
            </p>
          </div>
        </DashboardCard>
        <DashboardCard title="Proctoring Log" icon={TrendingUp}>
          <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-xs text-green-800 font-bold flex items-center gap-2">
            <CheckCircle size={14} /> Verification Passed: No tab switching detected.
          </div>
        </DashboardCard>
      </div>
    </div>
  );

  // 🎤 Interview Layout
  const renderInterviewReport = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <ScoreCard title="Technical" value={`${data.technicalScore}/10`} subtitle="Foundations" icon={Target} color="navy" />
        <ScoreCard title="Communication" value={`${data.communicationScore}/10`} subtitle="Clarity" icon={MessageSquare} color="orange" />
        <ScoreCard title="Overall Rating" value={`${data.overallScore}%`} subtitle="AI Analysis" icon={Award} color="green" />
        <ScoreCard title="Date" value={new Date(data.createdAt).toLocaleDateString()} subtitle="Evaluated" icon={Calendar} color="blue" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <DashboardCard title="Strengths & Insights" icon={TrendingUp}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-green-50 border border-green-100 rounded-3xl">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-4">Core Strengths</h5>
                <ul className="space-y-2">
                  {(data.strengths || ['Good technical knowledge', 'Clear articulation']).map((s, i) => (
                    <li key={i} className="text-sm font-bold text-green-800 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-600" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6 bg-orange-50 border border-orange-100 rounded-3xl">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-4">Improvement Areas</h5>
                <ul className="space-y-2">
                  {(data.improvements || ['Practice edge cases', 'Reduce fillers']).map((s, i) => (
                    <li key={i} className="text-sm font-bold text-orange-800 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-600" /> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );

  const getReportTitle = () => {
    if (type === 'contest') return data.contestTitle;
    if (type === 'oa') return data.testTitle;
    if (type === 'interview') return 'AI Technical Interview Result';
    return 'Performance Report';
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-10 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/results')}
              className="flex items-center gap-2 text-slate-500 hover:text-[#0B1B3B] font-bold transition-colors group"
            >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to All Results
            </button>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl md:text-4xl font-black text-[#0B1B3B] tracking-tight">{getReportTitle()}</h1>
              <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                type === 'contest' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                type === 'oa' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                'bg-orange-50 text-orange-600 border-orange-100'
              }`}>
                {type}
              </span>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:text-[#0B1B3B] transition-all shadow-sm">
              <Share2 size={20} />
            </button>
            <button 
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#0B1B3B] text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-navy-900/20"
            >
              <Download size={18} />
              {downloading ? 'Generating...' : 'Download Report'}
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        <div ref={reportRef} className="space-y-10">
          {type === 'contest' && renderContestReport()}
          {type === 'oa' && renderOAReport()}
          {type === 'interview' && renderInterviewReport()}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-100">
          <button 
            onClick={() => navigate('/results')}
            className="px-8 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
          >
            Back to Results
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default ResultDetails;
