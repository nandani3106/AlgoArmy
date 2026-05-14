import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Search, Filter, Star, Zap, Target, 
  Flame, Award, ChevronRight, User, Loader2, AlertCircle 
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import DashboardCard from '../components/DashboardCard';

const API_BASE = 'http://localhost:5000';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [categoryFilter, setCategoryFilter] = useState('Overall');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        setCurrentUser(storedUser);

        const response = await fetch(`${API_BASE}/api/results/leaderboard`);
        const data = await response.json();

        if (data.success) {
          setUsers(data.data);
        } else {
          setError(data.message || 'Failed to fetch leaderboard');
        }
      } catch (err) {
        setError('Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const filteredData = users.filter(u => 
    u.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const topThree = users.slice(0, 3);
  const myRankInfo = users.find(u => u.fullName === currentUser?.fullName);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="text-orange-500 animate-spin" size={48} />
          <p className="text-slate-500 font-bold">Retrieving Global Rankings...</p>
        </div>
      </MainLayout>
    );
  }

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
            <h3 className="text-4xl font-black mb-1">#{myRankInfo?.rank || '--'}</h3>
            <p className="text-white/80 text-xs font-bold uppercase tracking-tighter">
              {myRankInfo?.rank <= 10 ? 'Elite Tier' : myRankInfo?.rank <= 50 ? 'Master Tier' : 'Expert Tier'}
            </p>
          </div>
          <div className="md:col-span-3 bg-white rounded-[2.5rem] p-8 border border-orange-100 shadow-xl shadow-orange-900/5 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Score</p>
              <h4 className="text-2xl font-black text-[#0B1B3B]">{myRankInfo?.totalScore || 0}</h4>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Contest Score</p>
              <h4 className="text-2xl font-black text-[#0B1B3B]">{myRankInfo?.contestScore || 0}</h4>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">OA Score</p>
              <h4 className="text-2xl font-black text-[#0B1B3B]">{myRankInfo?.oaScore || 0}</h4>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Interview</p>
              <div className="flex items-center gap-2">
                <Target size={20} className="text-orange-500" />
                <h4 className="text-2xl font-black text-[#0B1B3B]">{myRankInfo?.interviewScore || 0}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-orange-900/5 border border-orange-100/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
             <h2 className="text-xl font-black text-[#0B1B3B] px-4">Rankings</h2>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search candidate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-orange-500/30 transition-all font-medium"
            />
          </div>
        </div>

        {/* Podium Section */}
        {topThree.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto px-4 pt-12">
            {/* Rank 2 */}
            <div className="order-2 md:order-1 flex flex-col items-center">
              <div className="relative group mb-6">
                <div className="w-24 h-24 rounded-[2rem] bg-white p-1 shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=${topThree[1].fullName}&background=64748b&color=fff`} alt="" />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-black text-sm shadow-lg">2</div>
              </div>
              <h4 className="text-lg font-black text-[#0B1B3B] mb-1">{topThree[1].fullName}</h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{topThree[1].totalScore} pts</p>
            </div>

            {/* Rank 1 */}
            <div className="order-1 md:order-2 flex flex-col items-center">
              <div className="relative group mb-8">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                  <Trophy size={48} fill="currentColor" />
                </div>
                <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1.5 shadow-2xl shadow-orange-200 border-4 border-amber-400 overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=${topThree[0].fullName}&background=f59e0b&color=fff`} alt="" />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl bg-amber-400 text-white flex items-center justify-center font-black text-lg shadow-xl">1</div>
              </div>
              <h4 className="text-2xl font-black text-[#0B1B3B] mb-1">{topThree[0].fullName}</h4>
              <p className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-4">{topThree[0].totalScore} pts</p>
              <span className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100">Top Performer</span>
            </div>

            {/* Rank 3 */}
            <div className="order-3 md:order-3 flex flex-col items-center">
              <div className="relative group mb-6">
                <div className="w-24 h-24 rounded-[2rem] bg-white p-1 shadow-2xl shadow-orange-100 border border-slate-100 overflow-hidden">
                  <img src={`https://ui-avatars.com/api/?name=${topThree[2].fullName}&background=d97706&color=fff`} alt="" />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-black text-sm shadow-lg">3</div>
              </div>
              <h4 className="text-lg font-black text-[#0B1B3B] mb-1">{topThree[2].fullName}</h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{topThree[2].totalScore} pts</p>
            </div>
          </div>
        )}

        {/* Table Section */}
        <DashboardCard className="overflow-hidden !p-0 mt-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-orange-100/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Rank</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Candidate</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Score</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Contest</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">OA</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Interview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100/20">
                {filteredData.map((user) => (
                  <tr 
                    key={user.rank}
                    className={`transition-colors ${user.fullName === currentUser?.fullName ? 'bg-orange-50/50' : 'hover:bg-slate-50'}`}
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
                          <img src={`https://ui-avatars.com/api/?name=${user.fullName}&background=random`} alt="" />
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${user.fullName === currentUser?.fullName ? 'text-orange-600' : 'text-[#0B1B3B]'}`}>{user.fullName}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rank #{user.rank}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-sm text-[#0B1B3B]">{user.totalScore?.toLocaleString()}</td>
                    <td className="px-8 py-6 font-bold text-sm text-slate-500">{user.contestScore}</td>
                    <td className="px-8 py-6 font-bold text-sm text-slate-500">{user.oaScore}</td>
                    <td className="px-8 py-6 font-bold text-sm text-slate-500">{user.interviewScore}</td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-8 py-10 text-center text-slate-400 font-medium italic">No candidates found matching your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      </div>
    </MainLayout>
  );
};

export default Leaderboard;
