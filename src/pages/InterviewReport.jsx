import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart3, Target, Zap, Clock, ChevronLeft, 
  Download, PieChart, TrendingUp, Award, Building2,
  Video, MessageSquare, CheckCircle, AlertCircle
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import ScoreCard from '../components/ScoreCard';
import DashboardCard from '../components/DashboardCard';
import { MOCK_INTERVIEWS } from '../data/interviewData';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const InterviewReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [downloading, setDownloading] = React.useState(false);
  const [downloaded, setDownloaded] = React.useState(false);
  const reportRef = React.useRef(null);
  
  const interview = MOCK_INTERVIEWS.find(item => item.id === id) || MOCK_INTERVIEWS[0];

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      // Scroll to top for full capture
      window.scrollTo(0, 0);
      
      const element = reportRef.current;
      if (!element) throw new Error("Report element not found");

      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        logging: true,
        allowTaint: true,
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
      pdf.save(`${interview.company}_Interview_Report.pdf`);
      
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
            {downloading ? (
              <div className="w-4 h-4 border-2 border-[#0B1B3B] border-t-transparent rounded-full animate-spin" />
            ) : downloaded ? (
              <CheckCircle size={18} />
            ) : (
              <Download size={18} />
            )}
            {downloading ? 'Generating PDF...' : downloaded ? 'Report Saved!' : 'Download Detailed Report'}
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <ScoreCard 
            title="Technical Score" 
            value="8.5/10" 
            subtitle="Strong foundations" 
            icon={Target} 
            color="navy"
          />
          <ScoreCard 
            title="Communication" 
            value="9.2/10" 
            subtitle="Clear & Precise" 
            icon={MessageSquare} 
            color="orange"
          />
          <ScoreCard 
            title="Confidence" 
            value="8.8/10" 
            subtitle="Steady delivery" 
            icon={Video} 
            color="blue"
          />
          <ScoreCard 
            title="Overall Rating" 
            value="A+" 
            subtitle="Recommended" 
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
                  {[
                    { title: 'Clear Explanations', desc: 'Used analogies well to explain React rendering.' },
                    { title: 'Strong Project Discussion', desc: 'Detailed ownership in Traveloop projects.' },
                    { title: 'Technical Accuracy', desc: '100% correct on JavaScript closure questions.' }
                  ].map((s, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-green-50/50 border border-green-100">
                      <CheckCircle className="text-green-500 shrink-0 mt-1" size={18} />
                      <div>
                        <p className="text-sm font-black text-[#0B1B3B] mb-0.5">{s.title}</p>
                        <p className="text-xs text-slate-500 font-medium">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardCard>

              <DashboardCard title="Areas to Improve" icon={AlertCircle}>
                <div className="space-y-4">
                  {[
                    { title: 'Reduce Filler Words', desc: 'Used "um" and "like" 12 times in 45 mins.' },
                    { title: 'System Design Depth', desc: 'Could expand more on load balancing.' },
                    { title: 'Structured Answers', desc: 'Use STAR method more consistently.' }
                  ].map((s, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
                      <AlertCircle className="text-orange-500 shrink-0 mt-1" size={18} />
                      <div>
                        <p className="text-sm font-black text-[#0B1B3B] mb-0.5">{s.title}</p>
                        <p className="text-xs text-slate-500 font-medium">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            </div>

            <DashboardCard title="Transcript Feedback Snippets" icon={MessageSquare}>
              <div className="space-y-6">
                {[
                  { q: "Tell me about yourself.", feedback: "Great start, very structured. You mentioned your key projects clearly." },
                  { q: "How does React rendering work?", feedback: "Accurate explanation of the Virtual DOM and reconciliation process." }
                ].map((item, idx) => (
                  <div key={idx} className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Question {idx + 1}</p>
                    <p className="text-sm font-bold text-[#0B1B3B] mb-4">"{item.q}"</p>
                    <div className="flex gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                      <Zap size={16} className="text-orange-500 shrink-0" />
                      <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                        AlgoAI Feedback: {item.feedback}
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
                  Your skills map shows you are ready for Senior Frontend roles.
                </p>
                <div className="w-full space-y-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Top Skill Match</p>
                    <p className="text-sm font-bold text-orange-400">React & Design Systems (98%)</p>
                  </div>
                  <button 
                    onClick={() => navigate('/interviews')}
                    className="w-full py-4 rounded-xl bg-orange-600 text-white font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-all"
                  >
                    Retake for Improvement
                  </button>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Suggested Resources" icon={Building2}>
              <div className="space-y-4">
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                  To reach an A++ rating, we recommend focusing on these topics:
                </p>
                {['System Design Interview Guide', 'Advanced Web Performance', 'Leadership Principles Case Studies'].map((r, i) => (
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
