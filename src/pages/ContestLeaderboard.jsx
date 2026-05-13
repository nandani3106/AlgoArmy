import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Search, Filter, ChevronLeft, ChevronRight, Users, Star, Timer, Loader2 } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import DashboardCard from '../components/DashboardCard';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:5000';

const ContestLeaderboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contest, setContest] = useState(null);

  // Get current user from localStorage
  const storedUser = localStorage.getItem('user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const load = async () => {
      try {
        const [lbRes, cRes] = await Promise.all([
          fetch(`${API_BASE}/api/contests/${id}/leaderboard`),
          fetch(`${API_BASE}/api/contests/${id}`),
        ]);
        const lbData = await lbRes.json();
        const cData = await cRes.json();
        if (lbData.success) setLeaderboard(lbData.leaderboard);
        if (cData.success) setContest(cData.contest);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const filteredData = leaderboard.filter(u => u.fullName.toLowerCase().includes(search.toLowerCase()));

  // Find current user's rank
  const myEntry = leaderboard.find(e => currentUser && e.userId === currentUser._id);
  const topEntry = leaderboard[0];

  if (loading) return <MainLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={40} className="animate-spin text-orange-500" /></div></MainLayout>;

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <button onClick={() => navigate(`/contests/${id}`)} className="flex items-center gap-2 text-slate-500 hover:text-[#0B1B3B] font-bold transition-colors group">
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Contest
            </button>
            <h1 className="text-3xl md:text-5xl font-black text-[#0B1B3B] tracking-tight">
              Contest <span className="gradient-text-warm">Leaderboard</span>
            </h1>
            <p className="text-slate-500 font-bold flex items-center gap-2">
              <Users size={18} className="text-orange-500" />
              {contest ? `${contest.participantsCount} Participants in ${contest.title}` : 'Loading...'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={18} />
              <input type="text" placeholder="Search candidates..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="bg-white border border-orange-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-orange-500/40 shadow-sm w-full sm:w-64 transition-all" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-[#0B1B3B] to-[#1e3a8a] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-navy-900/20">
            <div className="relative z-10">
              <Trophy size={40} className="text-orange-400 mb-6" />
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Your Ranking</p>
              <h3 className="text-4xl font-black mb-2">{myEntry ? `#${myEntry.rank}` : 'N/A'}</h3>
              <p className="text-slate-400 text-xs font-bold">
                {myEntry && leaderboard.length > 0
                  ? `Top ${Math.round((myEntry.rank / leaderboard.length) * 100)}% of participants`
                  : 'Not ranked yet'}
              </p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          </div>
          <div className="bg-white rounded-[2.5rem] p-8 border border-orange-100 shadow-xl shadow-orange-900/5">
            <Star size={40} className="text-amber-500 mb-6" />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Current Leader</p>
            <h3 className="text-4xl font-black text-[#0B1B3B] mb-2">{topEntry ? topEntry.fullName.split(' ')[0] : 'N/A'}</h3>
            <p className="text-slate-400 text-xs font-bold">{topEntry ? `${topEntry.totalScore} Points • ${topEntry.totalSubmissions} Submissions` : ''}</p>
          </div>
          <div className="bg-white rounded-[2.5rem] p-8 border border-orange-100 shadow-xl shadow-orange-900/5">
            <Timer size={40} className="text-purple-500 mb-6" />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Ranked</p>
            <h3 className="text-4xl font-black text-[#0B1B3B] mb-2">{leaderboard.length}</h3>
            <p className="text-slate-400 text-xs font-bold">Candidates with submissions</p>
          </div>
        </div>

        {/* Table */}
        <DashboardCard className="overflow-hidden !p-0 shadow-2xl shadow-orange-900/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-orange-100/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Rank</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Candidate</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Submissions</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100/20">
                {filteredData.length > 0 ? filteredData.map((user, idx) => {
                  const isMe = currentUser && user.userId === currentUser._id;
                  return (
                    <motion.tr key={user.userId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                      className={`group transition-colors ${isMe ? 'bg-orange-50/50' : 'hover:bg-slate-50'}`}>
                      <td className="px-8 py-6">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                          user.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                          user.rank === 2 ? 'bg-slate-100 text-slate-600' :
                          user.rank === 3 ? 'bg-orange-100 text-orange-700' : 'text-slate-400'
                        }`}>{user.rank}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200">
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`} alt={user.fullName} />
                          </div>
                          <span className={`font-bold ${isMe ? 'text-orange-600' : 'text-[#0B1B3B]'}`}>
                            {user.fullName}{isMe ? ' (You)' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center font-black text-[#0B1B3B]">{user.totalSubmissions}</td>
                      <td className="px-8 py-6 font-black text-orange-600">{user.totalScore}</td>
                    </motion.tr>
                  );
                }) : (
                  <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium">No results found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
          <button onClick={() => navigate(`/results/contest/${id}`)} className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
            <ChevronLeft size={16} /> Back to Results
          </button>
          <button onClick={() => navigate('/contests')} className="px-8 py-4 rounded-2xl bg-[#0B1B3B] text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-navy-900/20">
            Back to Contests <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContestLeaderboard;
