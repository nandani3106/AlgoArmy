import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, Award, Clock, Target, CheckCircle2, 
  BarChart3, ChevronRight, LayoutDashboard, Share2
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import DashboardCard from '../components/DashboardCard';
import GradientButton from '../components/GradientButton';
import { motion } from 'framer-motion';

const ContestResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const results = {
    contestName: 'Weekly Challenge #12',
    score: 850,
    maxScore: 1000,
    rank: 42,
    totalParticipants: 1240,
    accuracy: '85%',
    timeTaken: '1h 15m',
    problems: [
      { id: 'A', title: 'The Great Expedition', status: 'Accepted', points: 100, time: '12m' },
      { id: 'B', title: 'Magic Potion Optimization', status: 'Accepted', points: 250, time: '28m' },
      { id: 'C', title: 'Network Flow Equilibrium', status: 'Accepted', points: 500, time: '35m' },
      { id: 'D', title: 'Quantum Encryption Key', status: 'Not Attempted', points: 0, time: '-' },
    ]
  };

  const stats = [
    { label: 'Final Rank', value: `#${results.rank}`, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Total Score', value: results.score, icon: Award, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Accuracy', value: results.accuracy, icon: Target, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Time Taken', value: results.timeTaken, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-orange-600 font-black uppercase tracking-[0.2em] text-[10px] mb-2">Contest Finished</p>
            <h1 className="text-3xl md:text-5xl font-black text-[#0B1B3B] tracking-tight">
              Performance <span className="gradient-text-warm">Summary</span>
            </h1>
          </div>
          <div className="flex gap-3">
            <button className="p-4 rounded-2xl bg-white border border-orange-100 text-slate-500 hover:text-[#0B1B3B] transition-all shadow-sm">
              <Share2 size={20} />
            </button>
            <GradientButton className="!w-auto px-8" onClick={() => navigate(`/leaderboard/contest/${id}`)}>
              View Leaderboard <Trophy size={18} />
            </GradientButton>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[2rem] p-6 shadow-xl shadow-orange-900/5 border border-orange-100/50"
            >
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon size={24} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-[#0B1B3B]">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Analysis Table */}
          <div className="lg:col-span-8">
            <DashboardCard title="Problem-wise Analysis" icon={BarChart3}>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-orange-100/50">
                      <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Problem</th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Result</th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Score</th>
                      <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Time Taken</th>
                      <th className="px-4 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-100/30">
                    {results.problems.map((p) => (
                      <tr key={p.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-slate-400 group-hover:bg-[#0B1B3B] group-hover:text-white transition-all">
                              {p.id}
                            </div>
                            <span className="font-bold text-[#0B1B3B]">{p.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            p.status === 'Accepted' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-6 font-black text-[#0B1B3B]">{p.points}</td>
                        <td className="px-4 py-6 text-sm text-slate-500 font-medium">{p.time}</td>
                        <td className="px-4 py-6 text-right">
                          <button className="text-slate-300 hover:text-orange-600 transition-colors">
                            <ChevronRight size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardCard>
          </div>

          {/* Next Steps / CTA */}
          <div className="lg:col-span-4 space-y-6">
            <DashboardCard title="Performance Insights" icon={Target}>
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                  <p className="text-xs text-orange-800 font-bold leading-relaxed">
                    You performed better than 96% of the participants! Focus on Extreme problems to reach the Top 10.
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#0B1B3B]">Skill Progress</h4>
                  <div className="space-y-3">
                    {['Dynamic Programming', 'Graph Theory', 'Algorithms'].map((skill) => (
                      <div key={skill} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-500 uppercase tracking-widest">{skill}</span>
                          <span className="text-[#0B1B3B]">+12%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
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
