import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, BookOpen, Calendar, Clock,
  ChevronRight, Users, TrendingUp, Zap, Trophy,
  MessageSquare, Layout, Loader2, AlertCircle
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import StatsCard from '../components/StatsCard';
import GradientButton from '../components/GradientButton';
import MainLayout from '../components/MainLayout';

const API_BASE = 'http://localhost:5000';

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(storedUser);

        if (!token) {
          navigate('/login');
          return;
        }

        const [summaryRes, trendRes] = await Promise.all([
          fetch(`${API_BASE}/api/results/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE}/api/results/performance-trend`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const summaryData = await summaryRes.json();
        const trendData = await trendRes.json();

        if (summaryData.success && trendData.success) {
          setSummary(summaryData);
          setTrend(trendData.data);
        } else {
          if (summaryRes.status === 401 || summaryRes.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          } else {
            setError(summaryData.message || 'Failed to fetch dashboard data');
          }
        }
      } catch (err) {
        setError('Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="text-orange-500 animate-spin" size={48} />
          <p className="text-slate-500 font-bold animate-pulse">Synchronizing Dashboard...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
          <AlertCircle size={64} className="text-red-500" />
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-[#0B1B3B]">Dashboard Error</h3>
            <p className="text-slate-500 font-medium max-w-md">{error}</p>
          </div>
          <button onClick={() => window.location.reload()} className="px-8 py-3 bg-[#0B1B3B] text-white rounded-xl font-bold">Retry</button>
        </div>
      </MainLayout>
    );
  }

  const { summary: stats, recentResults } = summary;

  const STATS_CARDS = [
    { icon: Award, value: stats.totalContestScore, label: 'Contest Points', trend: `+${stats.contestsParticipated} Tests` },
    { icon: Calendar, value: stats.oaTestsTaken, label: 'OAs Completed' },
    { icon: BookOpen, value: `${stats.averageOAScore}%`, label: 'Avg OA Score' },
    { icon: MessageSquare, value: stats.interviewsTaken, label: 'AI Interviews' },
  ];

  // Combine recent results for the table
  const allRecentResults = [
    ...(recentResults.contests || []).map(r => ({ ...r, type: 'Contest', name: r.contest?.title, id: r._id, score: `${r.score} pts`, status: r.status })),
    ...(recentResults.oa || []).map(r => ({ ...r, type: 'OA', name: r.oaTest?.title, id: r._id, score: `${r.score} pts`, status: 'Submitted' })),
    ...(recentResults.interviews || []).map(r => ({ ...r, type: 'Interview', name: 'AI Technical Interview', id: r._id, score: `${r.overallScore}%`, status: 'Evaluated' }))
  ].sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt)).slice(0, 5);

  return (
    <MainLayout>
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* ===== LEFT COLUMN (Main Content) ===== */}
          <div className="xl:col-span-8 space-y-8">

            {/* Hero Banner */}
            <div className="relative overflow-hidden bg-white rounded-3xl p-8 md:p-10 border border-orange-100/50 shadow-xl shadow-orange-900/5">
              <div className="flex flex-col xl:flex-row items-center justify-between gap-8">
                <div className="relative z-10 flex-1">
                  <p className="text-orange-600 font-bold text-sm mb-2">Welcome back, {user?.fullName || 'Candidate'} 👋</p>
                  <h1 className="text-4xl md:text-5xl font-black text-[#0B1B3B] mb-4 leading-tight">
                    Your Performance Index: <br />
                    <span className="gradient-text-warm">{stats.overallPerformanceScore}% Elite</span>
                  </h1>
                  <p className="text-slate-500 text-base mb-8 max-w-lg leading-relaxed">
                    You've participated in {stats.contestsParticipated} contests and {stats.oaTestsTaken} assessments. Keep pushing your limits!
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <GradientButton className="!w-auto px-8" onClick={() => navigate('/contests')}>
                      Join Contest <Zap size={18} fill="currentColor" />
                    </GradientButton>
                    <GradientButton variant="outline" className="!w-auto px-8" onClick={() => navigate('/leaderboard')}>
                      View Leaderboard <Trophy size={18} />
                    </GradientButton>
                  </div>
                </div>
                <div className="hidden xl:flex items-center justify-center shrink-0">
                  <div className="w-36 h-36 bg-gradient-to-br from-orange-100 to-amber-100 rounded-3xl rotate-12 flex items-center justify-center shadow-lg border border-white animate-float">
                    <Layout size={56} className="text-orange-500 opacity-50" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {STATS_CARDS.map((stat, idx) => (
                <StatsCard key={idx} {...stat} />
              ))}
            </div>

            {/* Performance Visualization (Placeholder for Charts using trend data) */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#0B1B3B]">Performance Insights</h2>
                <span className="text-xs font-bold text-slate-400">CHRONOLOGICAL TREND</span>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border border-orange-100/50 shadow-xl shadow-orange-900/5 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contest Growth</p>
                  <div className="flex items-end gap-1 h-20">
                    {(trend.contests || []).slice(-10).map((t, i) => (
                      <div key={i} className="flex-1 bg-orange-500 rounded-t-sm" style={{ height: `${Math.min(100, (t.score / 100) * 100)}%` }} />
                    ))}
                    {(!trend.contests || trend.contests.length === 0) && <p className="text-xs text-slate-300 italic">No data yet</p>}
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">OA Accuracy</p>
                  <div className="flex items-end gap-1 h-20">
                    {(trend.oa || []).slice(-10).map((t, i) => (
                      <div key={i} className="flex-1 bg-blue-500 rounded-t-sm" style={{ height: `${t.score}%` }} />
                    ))}
                    {(!trend.oa || trend.oa.length === 0) && <p className="text-xs text-slate-300 italic">No data yet</p>}
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Interview Rating</p>
                  <div className="flex items-end gap-1 h-20">
                    {(trend.interviews || []).slice(-10).map((t, i) => (
                      <div key={i} className="flex-1 bg-green-500 rounded-t-sm" style={{ height: `${t.score}%` }} />
                    ))}
                    {(!trend.interviews || trend.interviews.length === 0) && <p className="text-xs text-slate-300 italic">No data yet</p>}
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Results */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#0B1B3B]">Recent Activity</h2>
                <button onClick={() => navigate('/results')} className="text-sm font-bold text-orange-600 hover:underline flex items-center gap-1">
                  View All <ChevronRight size={16} />
                </button>
              </div>
              <DashboardCard className="overflow-hidden !p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-orange-100/50">
                        <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                        <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                        <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Score</th>
                        <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                        <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                        <th className="px-6 py-3.5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-100/30">
                      {allRecentResults.map((result) => (
                        <tr key={result.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4 font-bold text-sm text-[#0B1B3B]">{result.name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                              result.type === 'Contest' ? 'bg-amber-50 text-amber-600' :
                              result.type === 'OA' ? 'bg-blue-50 text-blue-600' :
                              'bg-orange-50 text-orange-600'
                            }`}>{result.type}</span>
                          </td>
                          <td className="px-6 py-4 text-sm font-black text-orange-600">{result.score}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                            {new Date(result.submittedAt || result.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-lg bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest">
                              {result.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => navigate('/results')} className="text-slate-300 hover:text-orange-600 transition-colors group-hover:translate-x-1 transform duration-200">
                              <ChevronRight size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {allRecentResults.length === 0 && (
                        <tr>
                          <td colSpan="6" className="px-6 py-10 text-center text-slate-400 font-medium italic">No recent activity found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </DashboardCard>
            </section>
          </div>

          {/* ===== RIGHT COLUMN (Sidebar Widgets) ===== */}
          <div className="xl:col-span-4 space-y-8">
            {/* CTA Widget */}
            <div className="bg-[#0B1B3B] rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp size={28} className="text-orange-400" />
                </div>
                <h3 className="text-2xl font-black mb-3">Improve Your Rank</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">Your current standing is strong, but there's room to reach the Top 1%.</p>
                <GradientButton className="w-full !py-4" onClick={() => navigate('/contests')}>
                  Practice More
                </GradientButton>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </div>

            {/* Support CTA */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-orange-100/50 shadow-xl shadow-orange-900/5 text-center">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Users size={28} className="text-orange-500" />
              </div>
              <h3 className="text-lg font-black text-[#0B1B3B] mb-2">Connect with Peers</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">Join our Discord community to discuss problems and strategies.</p>
              <button className="w-full py-3 rounded-xl border border-slate-200 text-[#0B1B3B] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                Join Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
