import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Search, Filter, Star, Zap, Target, 
  Flame, Award, ChevronRight, User 
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import DashboardCard from '../components/DashboardCard';

const GLOBAL_DATA = [
  { rank: 1, name: 'Alex Rivera', score: 12450, solved: 482, accuracy: '94%', streak: 12, level: 'Grandmaster' },
  { rank: 2, name: 'Sarah Chen', score: 11820, solved: 456, accuracy: '92%', streak: 8, level: 'Grandmaster' },
  { rank: 3, name: 'Jordan Lee', score: 11200, solved: 438, accuracy: '95%', streak: 15, level: 'Grandmaster' },
  { rank: 4, name: 'Mike Ross', score: 10850, solved: 412, accuracy: '89%', streak: 4, level: 'Master' },
  { rank: 5, name: 'Rachel Zane', score: 10420, solved: 398, accuracy: '91%', streak: 7, level: 'Master' },
  { rank: 6, name: 'Harvey Specter', score: 9980, solved: 385, accuracy: '88%', streak: 2, level: 'Master' },
  { rank: 24, name: 'Nandani 👋', score: 8540, solved: 312, accuracy: '90%', streak: 5, level: 'Expert' },
  { rank: 7, name: 'Donna Paulsen', score: 9650, solved: 372, accuracy: '93%', streak: 9, level: 'Expert' },
  { rank: 8, name: 'Louis Litt', score: 9210, solved: 356, accuracy: '87%', streak: 1, level: 'Expert' },
];

const Leaderboard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [categoryFilter, setCategoryFilter] = useState('Overall');

  const filteredData = GLOBAL_DATA
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.rank - b.rank);

  const topThree = GLOBAL_DATA.slice(0, 3);

  return (
    <MainLayout>
      <div className="space-y-12 pb-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[3rem] bg-[#0B1B3B] p-12 md:p-20 text-white shadow-2xl shadow-navy-900/20">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
              Global <span className="text-orange-400">Leaderboard</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">
              Track the top performers across the platform and climb the rankings. Your journey to engineering excellence starts here.
            </p>
          </div>
        </div>

        {/* Personal Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 bg-gradient-to-br from-orange-500 to-amber-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-orange-500/20">
            <Trophy size={32} className="mb-4" />
            <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Your Rank</p>
            <h3 className="text-4xl font-black mb-1">#24</h3>
            <p className="text-white/80 text-xs font-bold uppercase tracking-tighter">Expert Tier</p>
          </div>
          <div className="md:col-span-3 bg-white rounded-[2.5rem] p-8 border border-orange-100 shadow-xl shadow-orange-900/5 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Score</p>
              <h4 className="text-2xl font-black text-[#0B1B3B]">8,540</h4>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Solved</p>
              <h4 className="text-2xl font-black text-[#0B1B3B]">312</h4>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Accuracy</p>
              <h4 className="text-2xl font-black text-[#0B1B3B]">90%</h4>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Streak</p>
              <div className="flex items-center gap-2">
                <Flame size={20} className="text-orange-500" />
                <h4 className="text-2xl font-black text-[#0B1B3B]">5 Days</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-orange-900/5 border border-orange-100/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto custom-scrollbar pb-2 md:pb-0">
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {['All Time', 'This Month', 'This Week'].map(t => (
                <button 
                  key={t}
                  onClick={() => setTimeFilter(t)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeFilter === t ? 'bg-[#0B1B3B] text-white shadow-lg' : 'text-slate-400 hover:text-[#0B1B3B]'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
              {['Overall', 'Contests', 'OA', 'Interviews'].map(c => (
                <button 
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === c ? 'bg-[#0B1B3B] text-white shadow-lg' : 'text-slate-400 hover:text-[#0B1B3B]'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-orange-500/30 transition-all font-medium"
            />
          </div>
        </div>

        {/* Podium Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto px-4 pt-12">
          {/* Rank 2 */}
          <div className="order-2 md:order-1 flex flex-col items-center">
            <div className="relative group mb-6">
              <div className="w-24 h-24 rounded-[2rem] bg-white p-1 shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${topThree[1].name}&background=64748b&color=fff`} alt="" />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-black text-sm shadow-lg">2</div>
            </div>
            <h4 className="text-lg font-black text-[#0B1B3B] mb-1">{topThree[1].name}</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{topThree[1].score} pts</p>
          </div>

          {/* Rank 1 */}
          <div className="order-1 md:order-2 flex flex-col items-center">
            <div className="relative group mb-8">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                <Trophy size={48} fill="currentColor" />
              </div>
              <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1.5 shadow-2xl shadow-orange-200 border-4 border-amber-400 overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${topThree[0].name}&background=f59e0b&color=fff`} alt="" />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl bg-amber-400 text-white flex items-center justify-center font-black text-lg shadow-xl">1</div>
            </div>
            <h4 className="text-2xl font-black text-[#0B1B3B] mb-1">{topThree[0].name}</h4>
            <p className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-4">{topThree[0].score} pts</p>
            <span className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">Grandmaster</span>
          </div>

          {/* Rank 3 */}
          <div className="order-3 md:order-3 flex flex-col items-center">
            <div className="relative group mb-6">
              <div className="w-24 h-24 rounded-[2rem] bg-white p-1 shadow-2xl shadow-orange-100 border border-slate-100 overflow-hidden">
                <img src={`https://ui-avatars.com/api/?name=${topThree[2].name}&background=d97706&color=fff`} alt="" />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-black text-sm shadow-lg">3</div>
            </div>
            <h4 className="text-lg font-black text-[#0B1B3B] mb-1">{topThree[2].name}</h4>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{topThree[2].score} pts</p>
          </div>
        </div>

        {/* Table Section */}
        <DashboardCard className="overflow-hidden !p-0 mt-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-orange-100/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Rank</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Candidate</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Score</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Solved</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Accuracy</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100/20">
                {filteredData.map((user) => (
                  <tr 
                    key={user.rank}
                    className={`transition-colors ${user.name.includes('Nandani') ? 'bg-orange-50/50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-8 py-6">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                        user.rank === 1 ? 'bg-amber-100 text-amber-700' :
                        user.rank === 2 ? 'bg-slate-100 text-slate-600' :
                        user.rank === 3 ? 'bg-orange-100 text-orange-700' : 'text-slate-400'
                      }`}>
                        {user.rank}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl border border-slate-100 overflow-hidden">
                          <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="" />
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${user.name.includes('Nandani') ? 'text-orange-600' : 'text-[#0B1B3B]'}`}>{user.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{user.level}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-sm text-[#0B1B3B]">{user.score.toLocaleString()}</td>
                    <td className="px-8 py-6 font-bold text-sm text-slate-500">{user.solved}</td>
                    <td className="px-8 py-6 font-bold text-sm text-slate-500">{user.accuracy}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Flame size={14} className="text-orange-500" />
                        <span className="text-sm font-bold text-slate-600">{user.streak}d</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      </div>
    </MainLayout>
  );
};

export default Leaderboard;
