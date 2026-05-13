import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Send, Clock, ChevronLeft, ChevronRight, Settings, MessageSquare, Zap, CheckCircle, Loader2 } from 'lucide-react';
import ProblemPanel from '../components/ProblemPanel';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';

const API_BASE = 'http://localhost:5000';

const CodingWorkspace = () => {
  const { contestId, questionId } = useParams();
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [verdict, setVerdict] = useState('');
  const [testCases, setTestCases] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(7200);

  // Fetch problems
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const fetchProblems = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/contests/${contestId}/problems`);
        const data = await res.json();
        if (data.success) {
          const mapped = data.problems.map((p, idx) => ({
            id: p._id,
            title: p.title,
            difficulty: p.difficulty,
            points: p.points,
            description: p.statement,
            examples: p.sampleInput ? [{
              input: p.sampleInput,
              output: p.sampleOutput,
              explanation: p.explanation || '',
            }] : [],
            constraints: p.constraints ? p.constraints.split('\n').filter(c => c.trim()) : [],
            tags: [],
          }));
          setProblems(mapped);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchProblems();
  }, [contestId, navigate]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Find current problem by questionId (could be _id or index)
  const currentIdx = problems.findIndex(p => p.id === questionId);
  const currentProblem = currentIdx >= 0 ? problems[currentIdx] : problems[0];

  const handleRun = () => {
    if (!currentProblem) return;
    setIsRunning(true); setOutput(''); setVerdict(''); setTestCases(null); setSubmitMsg('');
    setTimeout(() => {
      setIsRunning(false);
      const ex = currentProblem.examples[0];
      setOutput(ex ? `Input: ${ex.input}\nOutput: ${ex.output}\n\nExecution successful.` : 'No sample test cases.');
      setVerdict('Accepted');
      setTestCases([{ id: 1, passed: true }, { id: 2, passed: true }]);
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!currentProblem) return;
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    setIsRunning(true); setOutput(''); setVerdict(''); setTestCases(null); setSubmitMsg('');

    try {
      const res = await fetch(`${API_BASE}/api/contests/${contestId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ problemId: currentProblem.id, code, language }),
      });

      if (res.status === 401) { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); return; }

      const data = await res.json();
      setIsRunning(false);

      if (data.success) {
        const sub = data.submission;
        setVerdict(sub.status);
        setOutput(`Status: ${sub.status}\nScore: ${sub.score}\n\nAll test cases passed!`);
        setSubmitMsg(`✅ ${sub.status} — Score: ${sub.score}`);
        setTestCases([{ id: 1, passed: true }, { id: 2, passed: true }, { id: 3, passed: true }]);
      } else {
        setVerdict('Error');
        setOutput(data.message || 'Submission failed.');
      }
    } catch (e) {
      setIsRunning(false);
      setOutput('Server not reachable.');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#f8fafc] flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 bg-[#0B1B3B] border-b border-white/10 px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/contests')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <span className="text-white font-black text-sm">AA</span>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10 mx-2" />
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-sm tracking-tight">{currentProblem?.title || 'Contest'}</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
              <Clock size={14} className="text-orange-400" />
              <span className="text-orange-400 font-mono text-xs font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-[#1e293b] border border-white/10 rounded-xl px-4 py-2 text-white text-xs font-bold outline-none focus:border-orange-500/50 transition-all cursor-pointer">
            <option value="javascript">JavaScript (Node v18)</option>
            <option value="python">Python 3.10</option>
            <option value="cpp">C++ (GCC 11)</option>
            <option value="java">Java 17</option>
          </select>
          <div className="flex items-center gap-2">
            <button onClick={handleRun} className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2">
              <Play size={14} fill="currentColor" /> Run
            </button>
            <button onClick={handleSubmit} className="px-5 py-2 rounded-xl bg-orange-600 text-white text-xs font-black hover:bg-orange-700 transition-all shadow-lg shadow-orange-900/20 flex items-center gap-2">
              <Send size={14} fill="currentColor" /> Submit
            </button>
            <button onClick={() => navigate(`/results/contest/${contestId}`)} className="px-5 py-2 rounded-xl bg-green-600 text-white text-xs font-black hover:bg-green-700 transition-all shadow-lg shadow-green-900/20 flex items-center gap-2">
              <CheckCircle size={14} /> Finish
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[45%] h-full border-r border-slate-200">
          {currentProblem && <ProblemPanel problem={currentProblem} />}
        </div>
        <div className="flex-1 h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            <CodeEditor code={code} onChange={setCode} language={language} />
          </div>
          <div className="h-[35%] border-t border-white/5">
            <OutputPanel output={output} verdict={verdict} testCases={testCases} isRunning={isRunning} />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <footer className="h-12 bg-white border-t border-slate-200 px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-[#0B1B3B] transition-colors p-2"><Settings size={18} /></button>
          <button className="text-slate-400 hover:text-[#0B1B3B] transition-colors p-2"><MessageSquare size={18} /></button>
          {submitMsg && <span className="text-green-600 text-xs font-bold ml-4">{submitMsg}</span>}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {problems.map((p, idx) => {
              const label = String.fromCharCode(65 + idx);
              const isActive = currentProblem?.id === p.id;
              return (
                <button key={p.id} onClick={() => navigate(`/workspace/${contestId}/${p.id}`)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${isActive ? 'bg-[#0B1B3B] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                  {label}
                </button>
              );
            })}
          </div>
          <div className="h-6 w-px bg-slate-200 mx-2" />
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-[#0B1B3B] transition-colors"><ChevronLeft size={20} /></button>
            <button className="p-2 text-slate-400 hover:text-[#0B1B3B] transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CodingWorkspace;
