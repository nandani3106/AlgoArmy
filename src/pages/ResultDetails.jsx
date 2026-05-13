import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import ScoreCard from '../components/ScoreCard';
import DashboardCard from '../components/DashboardCard';
import { 
  Trophy, Award, Target, Clock, Zap, ChevronLeft, 
  Download, PieChart, TrendingUp, Building2, Video, 
  MessageSquare, CheckCircle, AlertCircle, BarChart3, Share2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ResultDetails = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [downloading, setDownloading] = React.useState(false);
  const reportRef = React.useRef(null);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      window.scrollTo(0, 0);
      const element = reportRef.current;
      const canvas = await html2canvas(element, { scale: 1.5, useCORS: true, backgroundColor: '#fafaf9' });
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const height = pdfWidth / (imgProps.width / imgProps.height);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, height);
      pdf.save(`AlgoArmy_${type}_Report_${id}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  // 🏆 Contest Layout
  const renderContestReport = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <ScoreCard title="Total Score" value="380/400" subtitle="Excellent" icon={Target} color="navy" />
        <ScoreCard title="Final Rank" value="#42" subtitle="Top 3%" icon={Trophy} color="orange" />
        <ScoreCard title="Problems Solved" value="3/4" subtitle="75% Completion" icon={Award} color="blue" />
        <ScoreCard title="Accuracy" value="95%" subtitle="Strong logic" icon={Zap} color="green" />
      </div>
      <DashboardCard title="Problem-wise Analysis" icon={BarChart3}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-orange-100">
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Problem</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Runtime</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Memory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-50">
              {[
                { id: 'A', title: 'Array Optimization', status: 'Accepted', time: '12ms', mem: '4.2MB' },
                { id: 'B', title: 'Graph Traversal', status: 'Accepted', time: '45ms', mem: '12.8MB' },
                { id: 'C', title: 'Dynamic Programming', status: 'Accepted', time: '120ms', mem: '24.1MB' },
                { id: 'D', title: 'Hard Logic', status: 'Wrong Answer', time: '-', mem: '-' }
              ].map((p, i) => (
                <tr key={i}>
                  <td className="px-4 py-6 font-bold text-[#0B1B3B]">{p.id}. {p.title}</td>
                  <td className="px-4 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'Accepted' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-6 text-sm text-slate-500">{p.time}</td>
                  <td className="px-4 py-6 text-sm text-slate-500">{p.mem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );

  // 📝 OA Layout
  const renderOAReport = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <ScoreCard title="Overall Score" value="92%" subtitle="A+ Grade" icon={Target} color="navy" />
        <ScoreCard title="Accuracy" value="98%" subtitle="High Precision" icon={Zap} color="orange" />
        <ScoreCard title="Percentile" value="95.4" subtitle="Better than 2k users" icon={Award} color="blue" />
        <ScoreCard title="Time Taken" value="42:15" subtitle="Target: 60:00" icon={Clock} color="green" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DashboardCard title="Section Breakdown" icon={PieChart}>
          <div className="space-y-4">
            {[{ n: 'MCQ', s: 100 }, { n: 'Coding', s: 85 }, { n: 'SQL', s: 92 }].map((s, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                  <span>{s.n}</span><span>{s.s}%</span>
                </div>
                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div className="h-full bg-[#0B1B3B]" style={{ width: `${s.s}%` }} />
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard title="Detailed Feedback" icon={TrendingUp}>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl text-xs text-green-800 font-bold">
              Strong Areas: Data Structures, Logical Reasoning
            </div>
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl text-xs text-orange-800 font-bold">
              Improvement Areas: Edge Case Handling, Optimization
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );

  // 🎤 Interview Layout
  const renderInterviewReport = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <ScoreCard title="Technical" value="8.5/10" subtitle="Strong foundations" icon={Target} color="navy" />
        <ScoreCard title="Communication" value="9.2/10" subtitle="Very Clear" icon={MessageSquare} color="orange" />
        <ScoreCard title="Confidence" value="8.8/10" subtitle="Steady flow" icon={Video} color="blue" />
        <ScoreCard title="Overall Rating" value="A+" subtitle="Recommended" icon={Award} color="green" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <DashboardCard title="Question-wise Feedback" icon={MessageSquare}>
            <div className="space-y-6">
              {[
                { q: 'Explain React Virtual DOM', f: 'Accurate and well-explained with examples.' },
                { q: 'Closure in JS', f: 'Understood the concept, but could be more concise.' }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                  <p className="text-sm font-bold text-[#0B1B3B] mb-2">Q: {item.q}</p>
                  <p className="text-xs text-slate-500 font-medium italic">Feedback: {item.f}</p>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
        <div className="lg:col-span-4 space-y-8">
          <DashboardCard title="Key Insights" icon={TrendingUp}>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl">
                <CheckCircle className="text-green-600" size={18} />
                <span className="text-xs font-bold text-green-800">Clear explanations</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                <AlertCircle className="text-orange-600" size={18} />
                <span className="text-xs font-bold text-orange-800">Reduce filler words</span>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );

  const getReportTitle = () => {
    switch (type) {
      case 'contest': return 'Weekly Challenge #12';
      case 'oa': return 'Amazon SDE Assessment';
      case 'interview': return 'Google Frontend Interview';
      default: return 'Performance Report';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-10 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6" ref={null}>
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
          {type === 'contest' && (
            <>
              <button className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-[#0B1B3B] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">View Leaderboard</button>
              <button className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-[#0B1B3B] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Review Solutions</button>
            </>
          )}
          {type === 'interview' && (
            <button 
              onClick={() => navigate(`/interviews`)}
              className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-[#0B1B3B] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Retake Interview
            </button>
          )}
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
