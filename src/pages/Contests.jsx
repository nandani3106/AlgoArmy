import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Zap, Trophy, ChevronRight, Loader2 } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import ContestCard from '../components/ContestCard';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:5000';

const Contests = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/contests`);
        const data = await res.json();

        if (data.success) {
          // Map backend data to ContestCard shape
          const mapped = data.contests.map((c) => {
            const start = new Date(c.startTime);
            return {
              id: c._id,
              name: c.title,
              difficulty: c.difficulty,
              date: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              time: start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              duration: c.durationMinutes >= 60
                ? `${Math.floor(c.durationMinutes / 60)}h${c.durationMinutes % 60 ? ` ${c.durationMinutes % 60}m` : ''}`
                : `${c.durationMinutes}m`,
              participants: c.participantsCount >= 1000
                ? `${(c.participantsCount / 1000).toFixed(1)}k+`
                : `${c.participantsCount}`,
              status: c.status.charAt(0).toUpperCase() + c.status.slice(1),
              prize: c.prizes || '',
            };
          });
          setContests(mapped);
        } else {
          setError('Failed to load contests.');
        }
      } catch (err) {
        setError('Server not reachable.');
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  const filteredContests = contests.filter(c => {
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

        {/* Loading / Error */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-orange-500" />
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 font-bold">{error}</p>
          </div>
        )}

        {/* Contest Grid */}
        {!loading && !error && (
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
        )}
      </div>
    </MainLayout>
  );
};

export default Contests;
