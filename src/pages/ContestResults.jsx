import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Award, Clock, Target, CheckCircle2, BarChart3, ChevronRight, LayoutDashboard, Share2, Loader2 } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import DashboardCard from '../components/DashboardCard';
import GradientButton from '../components/GradientButton';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:5000';

const ContestResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const fetchResults = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/contests/${id}/results`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); return; }
        const data = await res.json();
        if (data.success) setSubmissions(data.submissions);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchResults();
  }, [id, navigate]);

  const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
  const accepted = submissions.filter(s => s.status === 'Accepted').length;
  const accuracy = submissions.length > 0 ? Math.round((accepted / submissions.length) * 100) + '%' : '0%';

  const stats = [
    { label: 'Total Score', value: totalScore, icon: Award, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Submissions', value: submissions.length, icon: Target, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Accuracy', value: accuracy, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Accepted', value: accepted, icon: CheckCircle2, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  if (loading) return <MainLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={40} className="animate-spin text-orange-500" /></div></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-orange-600 font-black uppercase tracking-[0.2em] text-[10px] mb-2">Contest Finished</p>
            <h1 className="text-3xl md:text-5xl font-black text-[#0B1B3B] tracking-tight">
              Performance <span className="gradient-text-warm">Summary</span>
            </h1>
          </div>
          <div className="flex gap-3">
            <button className="p-4 rounded-2xl bg-white border border-orange-100 text-slate-500 hover:text-[#0B1B3B] transition-all shadow-sm"><Share2 size={20} /></button>
            <GradientButton className="!w-auto px-8" onClick={() => navigate(`/leaderboard/contest/${id}`)}>
              View Leaderboard <Trophy size={18} />
            </GradientButton>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[2rem] p-6 shadow-xl shadow-orange-900/5 border border-orange-100/50">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}><stat.icon size={24} /></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-[#0B1B3B]">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <DashboardCard title="Submission Analysis" icon={BarChart3}>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-orange-100/50">
                      <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Problem</th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Language</th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Result</th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Score</th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100/30">
                    {submissions.length > 0 ? submissions.map((s, i) => (
                      <tr key={i} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-6 font-bold text-[#0B1B3B]">{s.problem?.title || 'Unknown'}</td>
                        <td className="px-4 py-6 text-sm text-slate-500 font-medium">{s.language}</td>
                        <td className="px-4 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.status === 'Accepted' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{s.status}</span>
                        </td>
                        <td className="px-4 py-6 font-black text-[#0B1B3B]">{s.score}</td>
                        <td className="px-4 py-6 text-sm text-slate-500 font-medium">{new Date(s.submittedAt).toLocaleString()}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400 font-medium">No submissions yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </DashboardCard>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <DashboardCard title="Performance Insights" icon={Target}>
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                  <p className="text-xs text-orange-800 font-bold leading-relaxed">
                    {accepted > 0 ? `Great job! You solved ${accepted} problem(s) successfully.` : 'Keep practicing to improve your performance!'}
                  </p>
                </div>
                <GradientButton variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard size={18} /> Back to Dashboard
                </GradientButton>
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContestResults;
