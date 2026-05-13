import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Trophy, Search, Filter, ChevronLeft,
  ChevronRight, Users, Star, Timer
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import DashboardCard from '../components/DashboardCard';
import { motion } from 'framer-motion';

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Alex Rivera', solved: 4, score: 1850, penalty: '1h 05m', status: 'Accepted' },
  { rank: 2, name: 'Sarah Chen', solved: 4, score: 1720, penalty: '1h 12m', status: 'Accepted' },
  { rank: 3, name: 'Jordan Lee', solved: 4, score: 1680, penalty: '1h 25m', status: 'Accepted' },
  { rank: 4, name: 'Kevin Durant', solved: 3, score: 1250, penalty: '0h 55m', status: 'Accepted' },
  { rank: 42, name: 'Nandani 👋', solved: 3, score: 850, penalty: '1h 15m', status: 'Accepted' },
  { rank: 5, name: 'Mike Ross', solved: 3, score: 1210, penalty: '1h 02m', status: 'Accepted' },
  { rank: 6, name: 'Rachel Zane', solved: 3, score: 1180, penalty: '1h 10m', status: 'Accepted' },
  { rank: 7, name: 'Harvey Specter', solved: 3, score: 1150, penalty: '1h 18m', status: 'Accepted' },
  { rank: 8, name: 'Donna Paulsen', solved: 2, score: 750, penalty: '0h 45m', status: 'Accepted' },
];

const ContestLeaderboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredData = MOCK_LEADERBOARD
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.rank - b.rank);

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        {/* Back Button & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <button
              onClick={() => navigate(`/contests/${id}`)}
              className="flex items-center gap-2 text-slate-500 hover:text-[#0B1B3B] font-bold transition-colors group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              Back to Contest
            </button>
            <h1 className="text-3xl md:text-5xl font-black text-[#0B1B3B] tracking-tight">
              Contest <span className="gradient-text-warm">Leaderboard</span>
            </h1>
            <p className="text-slate-500 font-bold flex items-center gap-2">
              <Users size={18} className="text-orange-500" /> 1,240 Participants competing in Weekly Challenge #12
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search candidates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white border border-orange-100 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-orange-500/40 shadow-sm w-full sm:w-64 transition-all"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-orange-100 rounded-2xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">
              <Filter size={18} /> Filters
            </button>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-[#0B1B3B] to-[#1e3a8a] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-navy-900/20">
            <div className="relative z-10">
              <Trophy size={40} className="text-orange-400 mb-6" />
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Your Ranking</p>
              <h3 className="text-4xl font-black mb-2">#42</h3>
              <p className="text-slate-400 text-xs font-bold">Top 4% of participants</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-orange-100 shadow-xl shadow-orange-900/5">
            <Star size={40} className="text-amber-500 mb-6" />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Current Leader</p>
            <h3 className="text-4xl font-black text-[#0B1B3B] mb-2">Alex R.</h3>
            <p className="text-slate-400 text-xs font-bold">1850 Points • 4/4 Solved</p>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-orange-100 shadow-xl shadow-orange-900/5">
            <Timer size={40} className="text-purple-500 mb-6" />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Avg. Difficulty</p>
            <h3 className="text-4xl font-black text-[#0B1B3B] mb-2">Medium</h3>
            <p className="text-slate-400 text-xs font-bold">Based on submission trends</p>
          </div>
        </div>

        {/* Ranking Table */}
        <DashboardCard className="overflow-hidden !p-0 shadow-2xl shadow-orange-900/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-orange-100/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Rank</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Candidate</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Problems Solved</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Score</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Penalty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100/20">
                {filteredData.map((user, idx) => (
                  <motion.tr
                    key={user.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`group transition-colors ${user.name.includes('Nandani') ? 'bg-orange-50/50' : 'hover:bg-slate-50'
                      }`}
                  >
                    <td className="px-8 py-6">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${user.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                          user.rank === 2 ? 'bg-slate-100 text-slate-600' :
                            user.rank === 3 ? 'bg-orange-100 text-orange-700' : 'text-slate-400'
                        }`}>
                        {user.rank}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200">
                          <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} />
                        </div>
                        <span className={`font-bold ${user.name.includes('Nandani') ? 'text-orange-600' : 'text-[#0B1B3B]'}`}>
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="font-black text-[#0B1B3B]">{user.solved}</span>
                      <span className="text-slate-400 font-bold"> / 4</span>
                    </td>
                    <td className="px-8 py-6 font-black text-orange-600">
                      {user.score}
                    </td>
                    <td className="px-8 py-6 text-right font-mono text-xs font-bold text-slate-500">
                      {user.penalty}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
          <button 
            onClick={() => navigate('/results')}
            className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <ChevronLeft size={16} />
            Back to Results
          </button>
          <button 
            onClick={() => navigate('/contests')}
            className="px-8 py-4 rounded-2xl bg-[#0B1B3B] text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-navy-900/20"
          >
            Back to Contests
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContestLeaderboard;
