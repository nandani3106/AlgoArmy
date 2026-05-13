import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart3, Target, Zap, Clock, ChevronLeft, 
  Download, PieChart, TrendingUp, Award, Building2, CheckCircle 
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import ScoreCard from '../components/ScoreCard';
import DashboardCard from '../components/DashboardCard';
import { MOCK_OA } from '../data/oaData';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const OAReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [downloading, setDownloading] = React.useState(false);
  const [downloaded, setDownloaded] = React.useState(false);
  const reportRef = React.useRef(null);
  
  const oa = MOCK_OA.find(item => item.id === id) || MOCK_OA[0];

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      // Scroll to top for full capture
      window.scrollTo(0, 0);
      
      const element = reportRef.current;
      if (!element) throw new Error("Report element not found");

      const canvas = await html2canvas(element, {
        scale: 1.5, // Slightly lower scale for better compatibility
        useCORS: true,
        logging: true,
        allowTaint: true,
        backgroundColor: '#fafaf9',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.8); // Use JPEG for better performance
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      const height = pdfWidth / ratio;
      
      // Handle multi-page if necessary (simple version)
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, height);
      
      pdf.save(`${oa.company}_Assessment_Report.pdf`);
      
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (err) {
      console.error('PDF Error:', err);
      alert('Report generation failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

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
              <div className="w-4 h-4 border-2 border-[#0B1B3B] border-t-transparent rounded-full animate-spin" />
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
            title="Overall Score" 
            value="840/1000" 
            subtitle="Top 5% of candidates" 
            icon={Target} 
            color="navy"
          />
          <ScoreCard 
            title="Accuracy" 
            value="92%" 
            subtitle="14/15 Correct" 
            icon={Zap} 
            color="orange"
          />
          <ScoreCard 
            title="Percentile" 
            value="98.4" 
            subtitle="Higher than 1,240 users" 
            icon={Award} 
            color="blue"
          />
          <ScoreCard 
            title="Time Taken" 
            value="84:12" 
            subtitle="Target: 90:00 mins" 
            icon={Clock} 
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sectional Breakdown */}
          <div className="lg:col-span-8 space-y-8">
            <DashboardCard title="Sectional Analysis" icon={PieChart}>
              <div className="space-y-6">
                {[
                  { name: 'CS Fundamentals', score: 95, time: '12:40', status: 'Excellent' },
                  { name: 'Coding Proficiency', score: 82, time: '45:10', status: 'Strong' },
                  { name: 'Behavioral Metrics', score: 88, time: '26:22', status: 'Optimal' }
                ].map((section, idx) => (
                  <div key={idx} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 group hover:border-orange-500/30 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <h4 className="font-black text-[#0B1B3B] uppercase tracking-tighter">{section.name}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time: {section.time}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          section.status === 'Excellent' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                          {section.status}
                        </span>
                        <span className="text-xl font-black text-[#0B1B3B]">{section.score}%</span>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-white rounded-full overflow-hidden border border-slate-100">
                      <div 
                        className="h-full bg-[#0B1B3B] transition-all duration-1000 ease-out" 
                        style={{ width: `${section.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>

            <DashboardCard title="Strengths & Improvements" icon={TrendingUp}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-green-600 uppercase tracking-widest px-4 py-2 bg-green-50 rounded-xl w-fit">Top Strengths</h4>
                  <ul className="space-y-3">
                    {['Data Structures', 'Logical Reasoning', 'Time Efficiency'].map((s, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest px-4 py-2 bg-orange-50 rounded-xl w-fit">Improvement Areas</h4>
                  <ul className="space-y-3">
                    {['Edge Case Handling', 'Code Documentation', 'System Scale Logic'].map((s, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        {s}
                      </li>
                    ))}
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
                  Your performance in this assessment aligns perfectly with <span className="text-white font-bold">{oa.company}'s</span> engineering standards.
                </p>
                <div className="w-full p-6 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Recruiter Status</p>
                  <p className="text-sm font-bold text-green-400">Profile Recommended for Interview</p>
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
