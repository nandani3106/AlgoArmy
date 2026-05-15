import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Trophy, ChevronLeft, Shield, AlertCircle, Zap, Star, Loader2 } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import GradientButton from '../components/GradientButton';
import DashboardCard from '../components/DashboardCard';

const API_BASE = 'http://localhost:5000';

const ContestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [regMsg, setRegMsg] = useState('');
  const [regErr, setRegErr] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          fetch(`${API_BASE}/api/contests/${id}`),
          fetch(`${API_BASE}/api/contests/${id}/problems`),
        ]);
        const cData = await cRes.json();
        const pData = await pRes.json();
        if (cData.success) setContest(cData.contest);
        if (pData.success) setProblems(pData.problems);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleRegister = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    setRegistering(true); setRegMsg(''); setRegErr('');
    try {
      const res = await fetch(`${API_BASE}/api/contests/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); return; }
      const data = await res.json();
      if (data.success) { 
        setRegMsg(data.message); 
        const firstProblemId = problems[0]?._id || '1';
        setTimeout(() => navigate(`/workspace/${id}/${firstProblemId}`), 1000); 
      }
      else setRegErr(data.message || 'Registration failed');
    } catch (e) { setRegErr('Server not reachable.'); }
    finally { setRegistering(false); }
  };

  if (loading) return <MainLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={40} className="animate-spin text-orange-500" /></div></MainLayout>;
  if (!contest) return <MainLayout><div className="flex items-center justify-center min-h-[60vh]"><p className="text-slate-500 font-bold">Contest not found.</p></div></MainLayout>;

  const startDate = new Date(contest.startTime);
  const rulesArr = contest.rules ? contest.rules.split('\n').filter(r => r.trim()) : ['No specific rules.'];

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        <button onClick={() => navigate('/contests')} className="flex items-center gap-2 text-slate-500 hover:text-[#0B1B3B] font-bold transition-colors group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Contests
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-orange-900/5 border border-orange-100/50">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100">{contest.status}</span>
                <span className="px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-[0.2em]">{contest.difficulty}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-[#0B1B3B] mb-6 leading-tight">{contest.title}</h1>
              <p className="text-slate-500 text-lg leading-relaxed mb-10">{contest.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="space-y-1"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</p><p className="font-bold text-[#0B1B3B]">{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p></div>
                <div className="space-y-1"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time</p><p className="font-bold text-[#0B1B3B]">{startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p></div>
                <div className="space-y-1"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</p><p className="font-bold text-[#0B1B3B]">{contest.durationMinutes} mins</p></div>
                <div className="space-y-1"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Participants</p><p className="font-black text-orange-600">{contest.participantsCount}</p></div>
              </div>
            </div>
            <DashboardCard title="Contest Rules" icon={Shield}>
              <ul className="space-y-4">
                {rulesArr.map((rule, i) => (<li key={i} className="flex gap-4 items-start text-slate-600 font-medium leading-relaxed"><div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />{rule}</li>))}
              </ul>
              <div className="mt-8 p-4 bg-orange-50 rounded-2xl flex gap-4 items-center border border-orange-100">
                <AlertCircle className="text-orange-600 shrink-0" size={24} />
                <p className="text-xs text-orange-800 font-bold leading-relaxed">Make sure your internet connection is stable. Once started, the timer will not stop.</p>
              </div>
            </DashboardCard>
            <section className="space-y-6">
              <h2 className="text-2xl font-black text-[#0B1B3B]">Problem Overview</h2>
              {problems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {problems.map((p, idx) => (
                    <div key={p._id} className="bg-white p-6 rounded-3xl border border-orange-100/50 hover:border-orange-500/30 transition-all group flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-[#0B1B3B] text-xl group-hover:bg-[#0B1B3B] group-hover:text-white transition-all">{String.fromCharCode(65 + idx)}</div>
                        <div><h4 className="font-bold text-[#0B1B3B]">{p.title}</h4><p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">{p.difficulty} • {p.points} pts</p></div>
                      </div>
                      <Star size={20} className="text-slate-100 group-hover:text-amber-400 transition-all" />
                    </div>
                  ))}
                </div>
              ) : <p className="text-slate-400 font-medium">Problems will be revealed when the contest starts.</p>}
            </section>
          </div>
          <div className="lg:col-span-4 space-y-8">
            <DashboardCard className="!p-8 bg-[#0B1B3B] text-white">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20"><Zap size={40} className="text-white" fill="currentColor" /></div>
                <h3 className="text-2xl font-black mb-2">Ready to Start?</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">Join {contest.participantsCount} candidates. Timer starts when you enter.</p>
                {regMsg && <div className="w-full mb-4 p-3 rounded-xl bg-green-500/20 text-green-400 text-xs font-bold">{regMsg}</div>}
                {regErr && <div className="w-full mb-4 p-3 rounded-xl bg-red-500/20 text-red-400 text-xs font-bold">{regErr}</div>}
                <div className="w-full space-y-3">
                  <GradientButton className="w-full !py-4 shadow-xl shadow-orange-500/20" onClick={handleRegister} disabled={registering}>
                    {registering ? 'Registering...' : 'Start Contest Now'}
                  </GradientButton>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-4">{contest.durationMinutes} Minutes • {problems.length} Problems</p>
                </div>
              </div>
            </DashboardCard>
            {contest.prizes && <DashboardCard title="Prizes" icon={Trophy}><div className="p-4 rounded-2xl bg-slate-50 border border-slate-100"><p className="text-sm text-slate-600 font-medium whitespace-pre-line">{contest.prizes}</p></div></DashboardCard>}
            <DashboardCard title="Contest Host" icon={Shield}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0B1B3B] to-[#1e3a8a] flex items-center justify-center text-white"><span className="font-black">AA</span></div>
                <div><h4 className="font-bold text-[#0B1B3B]">AlgoArmy Official</h4><p className="text-xs text-slate-500 font-bold">Verified Host</p></div>
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContestDetails;
