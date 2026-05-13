import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, Users, Trophy, ChevronLeft, 
  BookOpen, Shield, AlertCircle, Zap, Star
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import GradientButton from '../components/GradientButton';
import DashboardCard from '../components/DashboardCard';


const ContestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock Detailed Data
  const contest = {
    id,
    name: 'Weekly Challenge #12',
    difficulty: 'Medium',
    status: 'Upcoming',
    date: 'May 15, 2026',
    time: '10:00 PM',
    duration: '120 mins',
    participants: '1,240',
    prize: '$500',
    description: 'The Weekly Challenge is a competitive programming contest designed to test your algorithmic and problem-solving skills. This edition focuses on Dynamic Programming, Graph Theory, and Advanced Data Structures.',
    rules: [
      'The contest duration is exactly 120 minutes.',
      'There are 4 problems (A, B, C, D) with varying difficulty levels.',
      'Penalty is based on the time of submission and the number of wrong attempts.',
      'Plagiarism will lead to immediate disqualification.',
      'Supported languages: C++, Java, Python, and JavaScript.'
    ],
    problems: [
      { id: 'A', title: 'The Great Expedition', difficulty: 'Easy', points: 100 },
      { id: 'B', title: 'Magic Potion Optimization', difficulty: 'Medium', points: 250 },
      { id: 'C', title: 'Network Flow Equilibrium', difficulty: 'Hard', points: 500 },
      { id: 'D', title: 'Quantum Encryption Key', difficulty: 'Extreme', points: 1000 },
    ],
    prizes: [
      { rank: '1st', reward: '$250 + AA Gold Badge' },
      { rank: '2nd', reward: '$150 + AA Silver Badge' },
      { rank: '3rd', reward: '$100 + AA Bronze Badge' },
      { rank: 'Top 10', reward: '500 AA Coins' },
    ]
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/contests')}
          className="flex items-center gap-2 text-slate-500 hover:text-[#0B1B3B] font-bold transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Contests
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-8 space-y-8">
            <div 
              className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-orange-900/5 border border-orange-100/50"
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100">
                  {contest.status}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-[0.2em]">
                  {contest.difficulty}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-[#0B1B3B] mb-6 leading-tight">
                {contest.name}
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed mb-10">
                {contest.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</p>
                  <p className="font-bold text-[#0B1B3B]">{contest.date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time</p>
                  <p className="font-bold text-[#0B1B3B]">{contest.time}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</p>
                  <p className="font-bold text-[#0B1B3B]">{contest.duration}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Prize Pool</p>
                  <p className="font-black text-orange-600">{contest.prize}</p>
                </div>
              </div>
            </div>

            {/* Rules Section */}
            <DashboardCard title="Contest Rules" icon={Shield}>
              <ul className="space-y-4">
                {contest.rules.map((rule, idx) => (
                  <li key={idx} className="flex gap-4 items-start text-slate-600 font-medium leading-relaxed">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
              <div className="mt-8 p-4 bg-orange-50 rounded-2xl flex gap-4 items-center border border-orange-100">
                <AlertCircle className="text-orange-600 shrink-0" size={24} />
                <p className="text-xs text-orange-800 font-bold leading-relaxed">
                  Make sure your internet connection is stable. Once started, the timer will not stop under any circumstances.
                </p>
              </div>
            </DashboardCard>

            {/* Problem Preview */}
            <section className="space-y-6">
              <h2 className="text-2xl font-black text-[#0B1B3B]">Problem Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contest.problems.map((problem) => (
                  <div key={problem.id} className="bg-white p-6 rounded-3xl border border-orange-100/50 hover:border-orange-500/30 transition-all group flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-[#0B1B3B] text-xl group-hover:bg-[#0B1B3B] group-hover:text-white transition-all">
                        {problem.id}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0B1B3B]">{problem.title}</h4>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">{problem.difficulty} • {problem.points} pts</p>
                      </div>
                    </div>
                    <Star size={20} className="text-slate-100 group-hover:text-amber-400 transition-all" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-8">
            <DashboardCard className="!p-8 bg-[#0B1B3B] text-white">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
                  <Zap size={40} className="text-white" fill="currentColor" />
                </div>
                <h3 className="text-2xl font-black mb-2">Ready to Start?</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Join {contest.participants} other candidates. The timer will start as soon as you enter the workspace.
                </p>
                <div className="w-full space-y-3">
                  <GradientButton 
                    className="w-full !py-4 shadow-xl shadow-orange-500/20" 
                    onClick={() => navigate(`/workspace/${id}/1`)}
                  >
                    Start Contest Now
                  </GradientButton>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-4">
                    120 Minutes • 4 Problems
                  </p>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Prize Distribution" icon={Trophy}>
              <div className="space-y-4">
                {contest.prizes.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">{p.rank}</span>
                    <span className="text-sm font-black text-[#0B1B3B]">{p.reward}</span>
                  </div>
                ))}
              </div>
            </DashboardCard>

            <DashboardCard title="Contest Host" icon={Shield}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B1B3B] to-[#1e3a8a] flex items-center justify-center text-white">
                  <span className="font-black">AA</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#0B1B3B]">AlgoArmy Official</h4>
                  <p className="text-xs text-slate-500 font-bold">Verified Host</p>
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContestDetails;
