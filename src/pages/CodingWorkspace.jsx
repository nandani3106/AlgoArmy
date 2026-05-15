import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, Send, Clock, ChevronLeft, ChevronRight, Settings, 
  MessageSquare, Zap, CheckCircle, Loader2, Maximize2, 
  Minimize2, RotateCcw, Copy, Download, Save, Moon, Sun, Terminal,
  Layout, ListChecks
} from 'lucide-react';
import ProblemPanel from '../components/ProblemPanel';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000';

const STARTER_TEMPLATES = {
  javascript: `/**\n * Read from stdin and write to stdout.\n */\nconst fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8');\n    // Write your code here\n}\n\nsolve();`,
  python: `# Write your code here\nimport sys\n\ndef solve():\n    for line in sys.stdin:\n        # process line\n        pass\n\nif __name__ == '__main__':\n    solve()`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your code here\n    }\n}`
};

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
  const [executionMetrics, setExecutionMetrics] = useState(null);
  const [complexityEstimate, setComplexityEstimate] = useState('');
  const [compilerOutput, setCompilerOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [theme, setTheme] = useState('vs-dark');
  const [isSaving, setIsSaving] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5400); // 90 minutes

  const getStorageKey = useCallback((qId, lang) => `contest-${qId}-${lang}`, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const fetchProblems = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/contests/${contestId}/problems`);
        const data = await res.json();
        if (data.success) {
          setProblems(data.problems);
          // If questionId is invalid or '1', select the first problem
          const currentP = data.problems.find(p => p._id === questionId) || data.problems[0];
          if (currentP && currentP._id !== questionId) {
            navigate(`/workspace/${contestId}/${currentP._id}`, { replace: true });
          }
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchProblems();
  }, [contestId, navigate, questionId]);

  useEffect(() => {
    if (questionId && questionId !== '1') {
      const savedCode = localStorage.getItem(getStorageKey(questionId, language));
      setCode(savedCode || STARTER_TEMPLATES[language]);
    }
  }, [language, questionId, getStorageKey]);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRun = async () => {
    if (!questionId || isRunning) return;
    setIsRunning(true); setOutput(''); setVerdict(''); setTestCases(null); setExecutionMetrics(null); setCompilerOutput('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/contests/${contestId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ problemId: questionId, code, language }),
      });
      const data = await res.json();
      setIsRunning(false);
      
      if (data.success) {
        setVerdict(data.verdict);
        setTestCases(data.detailedResults);
        setExecutionMetrics({ time: data.executionTime, memory: data.memoryUsed });
        setComplexityEstimate(data.complexityEstimate);
        setCompilerOutput(data.compilerOutput);
        
        const firstFailed = data.detailedResults.find(r => !r.passed);
        if (firstFailed) setOutput(firstFailed.actual);
        else setOutput(data.detailedResults[0]?.actual || "No output");
      } else {
        toast.error(data.message || "Execution failed");
      }
    } catch (e) {
      setIsRunning(false);
      toast.error("Execution engine error");
    }
  };

  const handleSubmit = async () => {
    if (!questionId || isSubmitting) return;
    const token = localStorage.getItem('token');
    setIsSubmitting(true); setIsRunning(true); setOutput(''); setVerdict(''); setTestCases(null);
    
    try {
      const res = await fetch(`${API_BASE}/api/contests/${contestId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ problemId: questionId, code, language }),
      });

      const data = await res.json();
      setIsSubmitting(false); setIsRunning(false);

      if (data.success) {
        const sub = data.submission;
        setVerdict(sub.verdict);
        setTestCases(sub.detailedResults);
        setExecutionMetrics({ time: sub.executionTime, memory: sub.memoryUsed });
        setComplexityEstimate(sub.complexityEstimate);
        setCompilerOutput(sub.compilerOutput);
        
        if (sub.verdict === 'Accepted') toast.success("Solution Accepted! 100 Points.");
        else toast.error(`Verdict: ${sub.verdict}`);
      } else {
        toast.error(data.message || "Submission failed");
      }
    } catch (e) {
      setIsSubmitting(false); setIsRunning(false);
      toast.error("Submission failed");
    }
  };

  const handleFinish = async () => {
    if (window.confirm("Are you sure you want to finish the contest? You won't be able to submit further solutions.")) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/contests/${contestId}/finish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Contest finished successfully!");
          navigate(`/results/contest/${contestId}`);
        } else {
          toast.error(data.message || "Failed to finish contest");
        }
      } catch (e) {
        toast.error("Connection error");
      }
    }
  };

  if (loading) return (
    <div className="h-screen w-full bg-[#0B1B3B] flex flex-col items-center justify-center gap-4">
      <Loader2 size={48} className="animate-spin text-orange-500" />
      <span className="text-white/50 font-black text-xs uppercase tracking-[0.3em]">Preparing Workspace...</span>
    </div>
  );

  const currentIdx = problems.findIndex(p => p._id === questionId);
  const currentProblem = currentIdx >= 0 ? problems[currentIdx] : problems[0];

  return (
    <div className={`h-screen w-full bg-[#f8fafc] flex flex-col overflow-hidden ${isFullScreen ? 'fixed inset-0 z-[9999]' : ''}`}>
      {/* Workspace Header */}
      <header className="h-14 bg-[#0B1B3B] border-b border-white/10 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/contests')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-sm">AA</span>
            </div>
            <span className="text-white/40 group-hover:text-white transition-colors"><ChevronLeft size={16} /></span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ListChecks size={16} className="text-orange-500" />
              <span className="text-white font-black text-xs uppercase tracking-widest">{currentProblem?.title || "Loading..."}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
              <Clock size={12} className="text-orange-400" />
              <span className="text-orange-400 font-mono text-[10px] font-black tracking-widest">
                {Math.floor(timeLeft / 3600)}h {Math.floor((timeLeft % 3600) / 60)}m {timeLeft % 60}s
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Problem Selector Dropdown */}
          <div className="relative group">
             <button className="flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 text-[10px] font-black uppercase tracking-widest transition-all">
                <Layout size={14} /> Change Problem
             </button>
             <div className="absolute top-full right-0 mt-2 w-64 bg-[#0B1B3B] border border-white/10 rounded-2xl shadow-2xl invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50 p-2 overflow-hidden">
                {problems.map((p, idx) => (
                   <button 
                    key={p._id}
                    onClick={() => navigate(`/workspace/${contestId}/${p._id}`)}
                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${p._id === questionId ? 'bg-orange-500 text-white' : 'hover:bg-white/5 text-slate-400'}`}
                   >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${p._id === questionId ? 'bg-white/20' : 'bg-white/5'}`}>{String.fromCharCode(65+idx)}</div>
                      <span className="text-[10px] font-bold truncate">{p.title}</span>
                   </button>
                ))}
             </div>
          </div>

          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white/80 text-[10px] font-black uppercase tracking-widest outline-none hover:bg-white/10 transition-all">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
          
          <div className="flex items-center gap-2 ml-4">
            <button onClick={handleRun} disabled={isRunning} className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 flex items-center gap-2 transition-all disabled:opacity-50">
              <Play size={12} fill="currentColor" /> {isRunning && !isSubmitting ? 'Running...' : 'Run'}
            </button>
            <button onClick={handleSubmit} disabled={isRunning} className="px-5 py-2 rounded-xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-orange-900/20">
              <Send size={12} fill="currentColor" /> {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <button onClick={handleFinish} className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 flex items-center gap-2 transition-all">
               Finish
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Problem Statement */}
        <div className="w-[35%] h-full border-r border-slate-200 shadow-xl z-10">
          <ProblemPanel problem={currentProblem} />
        </div>

        {/* Right Pane: Editor & Output */}
        <div className="flex-1 h-full flex flex-col bg-[#1e1e1e]">
          <div className="flex-1 overflow-hidden relative group">
             {/* Editor Header Overlay */}
             <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setCode(STARTER_TEMPLATES[language])} className="p-2 bg-[#252525] border border-white/5 rounded-lg text-slate-500 hover:text-white transition-all shadow-lg" title="Reset Code"><RotateCcw size={14} /></button>
                <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 bg-[#252525] border border-white/5 rounded-lg text-slate-500 hover:text-white transition-all shadow-lg">{isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}</button>
             </div>
             <CodeEditor code={code} onChange={setCode} language={language} theme={theme} />
          </div>
          
          <div className="h-[40%] min-h-[200px] border-t border-white/5">
            <OutputPanel 
              output={output} verdict={verdict} testCases={testCases} 
              isRunning={isRunning} executionMetrics={executionMetrics}
              complexityEstimate={complexityEstimate} compilerOutput={compilerOutput}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingWorkspace;
