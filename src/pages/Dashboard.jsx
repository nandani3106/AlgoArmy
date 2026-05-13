import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award, BookOpen, Calendar, Clock,
  ChevronRight, Users, TrendingUp, Zap, Trophy,
  MessageSquare, Layout
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import StatsCard from '../components/StatsCard';
import GradientButton from '../components/GradientButton';
import MainLayout from '../components/MainLayout';

// Mock Data
const STATS_DATA = [
  { icon: Award, value: '124', label: 'Problems Solved', trend: '+12' },
  { icon: Calendar, value: '03', label: 'Upcoming Contests' },
  { icon: BookOpen, value: '02', label: 'OA Invitations' },
  { icon: MessageSquare, value: '01', label: 'Interview Invitations' },
];

const CONTESTS_DATA = [
  { id: 1, name: 'Weekly Challenge #12', difficulty: 'Medium', date: 'May 15, 2026', time: '10:00 PM', duration: '2h', participants: '1.2k+' },
  { id: 2, name: 'Dynamic Programming Battle', difficulty: 'Hard', date: 'May 18, 2026', time: '09:00 PM', duration: '1.5h', participants: '800+' },
  { id: 3, name: 'Graph Master Contest', difficulty: 'Extreme', date: 'May 20, 2026', time: '08:00 PM', duration: '3h', participants: '500+' },
];

const OA_DATA = [
  { id: 1, company: 'Amazon', title: 'SDE Online Assessment', deadline: '2 days left', duration: '90 mins' },
  { id: 2, company: 'Microsoft', title: 'Coding Assessment', deadline: '5 days left', duration: '120 mins' },
];

const INTERVIEW_DATA = [
  { id: 1, role: 'Frontend Developer', company: 'Google', date: 'May 16, 2026', time: '02:00 PM', duration: '45 mins' },
];

const RESULTS_DATA = [
  { id: 1, name: 'Bi-Weekly Contest #30', type: 'Contest', score: '380/400', rank: '42nd', status: 'Completed' },
  { id: 2, name: 'Uber Backend OA', type: 'OA', score: '100%', rank: '-', status: 'Shortlisted' },
  { id: 3, name: 'Meta Mock Interview', type: 'Interview', score: 'A-', rank: '-', status: 'Feedback Sent' },
];

const LEADERBOARD_DATA = [
  { rank: 1, name: 'Alex Rivera', score: '2450' },
  { rank: 2, name: 'Sarah Chen', score: '2380' },
  { rank: 3, name: 'Jordan Lee', score: '2310' },
  { rank: 4, name: 'Nandani 👋', score: '2295' },
  { rank: 5, name: 'Mike Ross', score: '2240' },
];

const ACTIVITY_DATA = [
  { title: 'Contest completed', desc: 'Weekly Challenge #11', time: '2 hours ago' },
  { title: 'OA submitted', desc: 'Stripe Engineering Assessment', time: 'Yesterday' },
  { title: 'Interview finished', desc: 'Netflix Technical Mock', time: '2 days ago' },
];

const Dashboard = () => {
  const navigate = useNavigate();

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
                  <p className="text-orange-600 font-bold text-sm mb-2">Welcome back, Nandani 👋</p>
                  <h1 className="text-4xl md:text-5xl font-black text-[#0B1B3B] mb-4 leading-tight">
                    Ready to Conquer Your <br />
                    <span className="gradient-text-warm">Next Challenge?</span>
                  </h1>
                  <p className="text-slate-500 text-base mb-8 max-w-lg leading-relaxed">
                    Join coding contests, complete assessments, and ace AI interviews with confidence.
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
              {/* Decorative blurs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-50 rounded-full blur-2xl -mb-24 -mr-12 opacity-50"></div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {STATS_DATA.map((stat, idx) => (
                <StatsCard key={idx} {...stat} />
              ))}
            </div>

            {/* Upcoming Contests */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#0B1B3B]">Upcoming Contests</h2>
                <button onClick={() => navigate('/contests')} className="text-sm font-bold text-orange-600 hover:underline flex items-center gap-1">
                  View All <ChevronRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {CONTESTS_DATA.map((contest) => (
                  <DashboardCard key={contest.id} className="h-full flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          contest.difficulty === 'Extreme' ? 'bg-red-50 text-red-600' :
                          contest.difficulty === 'Hard' ? 'bg-orange-50 text-orange-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {contest.difficulty}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                          <Users size={14} /> {contest.participants}
                        </div>
                      </div>
                      <h3 className="font-bold text-[#0B1B3B] text-lg mb-3">{contest.name}</h3>
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar size={14} /> {contest.date}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock size={14} /> {contest.time} ({contest.duration})
                        </div>
                      </div>
                    </div>
                    <GradientButton variant="outline" className="!py-2.5 text-sm" onClick={() => navigate(`/contests/${contest.id}`)}>
                      View Details
                    </GradientButton>
                  </DashboardCard>
                ))}
              </div>
            </section>

            {/* OA & Interview Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Online Assessments */}
              <section className="space-y-5">
                <h2 className="text-2xl font-black text-[#0B1B3B]">Online Assessments</h2>
                <div className="space-y-4">
                  {OA_DATA.map((oa) => (
                    <DashboardCard key={oa.id} className="!p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center font-black text-sm text-[#0B1B3B] border border-slate-100">
                            {oa.company[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#0B1B3B]">{oa.title}</h4>
                            <p className="text-xs text-slate-500">{oa.company} • {oa.duration}</p>
                          </div>
                        </div>
                        <button onClick={() => navigate('/oa')} className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-100 transition-all shrink-0">
                          <Zap size={18} fill="currentColor" />
                        </button>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              </section>

              {/* AI Interviews */}
              <section className="space-y-5">
                <h2 className="text-2xl font-black text-[#0B1B3B]">AI Interviews</h2>
                <div className="space-y-4">
                  {INTERVIEW_DATA.map((interview) => (
                    <DashboardCard key={interview.id} className="!p-5 border-l-4 border-l-orange-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                            <Users size={20} />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#0B1B3B]">{interview.role}</h4>
                            <p className="text-xs text-slate-500">{interview.company} • {interview.date}</p>
                          </div>
                        </div>
                        <button onClick={() => navigate('/interviews')} className="px-5 py-2.5 rounded-xl bg-[#0B1B3B] text-white text-xs font-bold hover:bg-[#050d1d] transition-all shrink-0">
                          Join
                        </button>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              </section>
            </div>

            {/* Recent Results */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#0B1B3B]">Recent Results</h2>
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
                        <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Rank</th>
                        <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                        <th className="px-6 py-3.5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-100/30">
                      {RESULTS_DATA.map((result) => (
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
                          <td className="px-6 py-4 text-sm text-slate-500 font-medium">{result.rank}</td>
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
                    </tbody>
                  </table>
                </div>
              </DashboardCard>
            </section>
          </div>

          {/* ===== RIGHT COLUMN (Sidebar Widgets) ===== */}
          <div className="xl:col-span-4 space-y-8">

            {/* Top Performers */}
            <DashboardCard title="Top Performers" icon={Trophy}>
              <div className="space-y-3">
                {LEADERBOARD_DATA.map((user) => (
                  <div key={user.rank} className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                    user.name.includes('Nandani') ? 'bg-orange-50 border border-orange-100' : 'hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                        user.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                        user.rank === 2 ? 'bg-slate-100 text-slate-600' :
                        user.rank === 3 ? 'bg-orange-100 text-orange-700' : 'text-slate-400'
                      }`}>
                        {user.rank}
                      </div>
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100">
                        <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random&size=32`} alt={user.name} />
                      </div>
                      <span className={`text-sm font-bold ${user.name.includes('Nandani') ? 'text-orange-600' : 'text-[#0B1B3B]'}`}>
                        {user.name}
                      </span>
                    </div>
                    <span className="text-sm font-black text-[#0B1B3B]">{user.score}</span>
                  </div>
                ))}
                <button
                  onClick={() => navigate('/leaderboard')}
                  className="w-full mt-4 py-3 rounded-2xl border border-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  View Full Leaderboard
                </button>
              </div>
            </DashboardCard>

            {/* Recent Activity */}
            <DashboardCard title="Recent Activity" icon={TrendingUp}>
              <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-orange-50">
                {ACTIVITY_DATA.map((activity, idx) => (
                  <div key={idx} className="relative flex gap-4 pl-10">
                    <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white border-4 border-orange-50 flex items-center justify-center z-10">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#0B1B3B]">{activity.title}</h4>
                      <p className="text-xs text-slate-500 mb-1">{activity.desc}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>

            {/* Support CTA */}
            <div className="bg-[#0B1B3B] rounded-3xl p-8 text-center text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <Layout size={28} className="text-orange-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Need Assistance?</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">Our support team is here to help you 24/7.</p>
                <button className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold text-sm transition-all shadow-lg shadow-orange-900/40">
                  Contact Support
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
