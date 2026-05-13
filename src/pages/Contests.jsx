import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Zap, Trophy, ChevronRight } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import ContestCard from '../components/ContestCard';
import { motion } from 'framer-motion';

const MOCK_CONTESTS = [
  { id: 1, name: 'Weekly Challenge #12', difficulty: 'Medium', date: 'May 15, 2026', time: '10:00 PM', duration: '2h', participants: '1.2k+', status: 'Upcoming', prize: '$500' },
  { id: 2, name: 'Dynamic Programming Battle', difficulty: 'Hard', date: 'May 18, 2026', time: '09:00 PM', duration: '1.5h', participants: '800+', status: 'Upcoming', prize: '$1000' },
  { id: 3, name: 'Graph Master Contest', difficulty: 'Extreme', date: 'May 20, 2026', time: '08:00 PM', duration: '3h', participants: '500+', status: 'Upcoming', prize: '$2000' },
  { id: 4, name: 'Beginner Blitz', difficulty: 'Easy', date: 'May 12, 2026', time: '06:00 PM', duration: '1h', participants: '3k+', status: 'Live', prize: 'Swags' },
  { id: 5, name: 'Algorithm Sprint #5', difficulty: 'Medium', date: 'May 10, 2026', time: '04:00 PM', duration: '2h', participants: '2.5k+', status: 'Completed' },
  { id: 6, name: 'Binary Search Bonanza', difficulty: 'Easy', date: 'May 08, 2026', time: '05:00 PM', duration: '1.5h', participants: '1.8k+', status: 'Completed' },
];

const Contests = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredContests = MOCK_CONTESTS.filter(c => {
    const matchesFilter = filter === 'All' || c.status === filter;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <MainLayout>
      <div className="space-y-10 pb-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-[#0B1B3B] rounded-[3rem] p-12 md:p-16 text-white shadow-2xl shadow-navy-900/40">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-black uppercase tracking-widest mb-6">
              <Zap size={14} fill="currentColor" /> Live Contests Available
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              Compete. Rank. <br />
              <span className="text-orange-500">Conquer.</span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Join coding contests, solve real-world problems, and climb the global leaderboard to earn exclusive prizes and recognition.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 font-black transition-all shadow-lg shadow-orange-900/20 flex items-center gap-2">
                Join Live Contest <ChevronRight size={18} />
              </button>
              <button className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 font-black transition-all flex items-center gap-2">
                <Trophy size={18} /> Leaderboard
              </button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600 rounded-full blur-[120px] opacity-20 -mr-40 -mt-40"></div>
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-600 rounded-full blur-[100px] opacity-10 -mr-20 -mb-20"></div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search contests..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-orange-100 rounded-[1.5rem] py-4 pl-12 pr-4 text-[#0B1B3B] font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/40 shadow-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            {['All', 'Upcoming', 'Live', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`
                  px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all whitespace-nowrap
                  ${filter === tab 
                    ? 'bg-[#0B1B3B] text-white shadow-lg' 
                    : 'bg-white border border-orange-100 text-slate-500 hover:border-orange-200'}
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Contest Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredContests.length > 0 ? (
            filteredContests.map((contest, idx) => (
              <motion.div
                key={contest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <ContestCard 
                  contest={contest} 
                  onDetails={() => navigate(`/contests/${contest.id}`)}
                  onRegister={() => navigate(`/contests/${contest.id}`)}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-orange-300" />
              </div>
              <h3 className="text-xl font-bold text-[#0B1B3B]">No contests found</h3>
              <p className="text-slate-500">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Contests;
