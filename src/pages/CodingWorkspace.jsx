import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play, Send, Clock, ChevronLeft, ChevronRight, Settings,
  MessageSquare, Zap, CheckCircle, Loader2, Maximize2,
  Minimize2, RotateCcw, Copy, Download, Save, Moon, Sun, Terminal,
  Layout, ListChecks, ArrowLeft
} from 'lucide-react';
import ProblemPanel from '../components/ProblemPanel';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';
import WorkspaceLayout from '../components/WorkspaceLayout';
import BrandLogo from '../components/BrandLogo';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000';

const STARTER_TEMPLATES = {
  javascript: `/**\n * Read from stdin and write to stdout.\n */\nconst fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8');\n    // Write your code here\n}\n\nsolve();`,
  python: `# Write your Python code here\nimport sys\n\ndef solve():\n    pass\n\nif __name__ == '__main__':\n    solve()`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    return 0;\n}`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your Java code here\n    }\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    // Write your C code here\n    return 0;\n}`
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

  // Custom workspace parameters
  const [theme, setTheme] = useState(() => localStorage.getItem('algoarmy-theme') || 'vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [minimapEnabled, setMinimapEnabled] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [isCustomInputActive, setIsCustomInputActive] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  // Ref so code-loading effect can read latest problems without depending on them
  const problemsRef = useRef([]);
  useEffect(() => { problemsRef.current = problems; }, [problems]);

  // Mobile rendering states
  const [activeMobileTab, setActiveMobileTab] = useState('problem'); // 'problem', 'editor', 'console'
  const [isMobile, setIsMobile] = useState(false);

  const [contest, setContest] = useState(null);
  const [contestSession, setContestSession] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);

  const getStorageKey = useCallback((qId, lang) => `contest-${qId}-${lang}`, []);

  // Listen to screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Persist Theme Selection
  useEffect(() => {
    localStorage.setItem('algoarmy-theme', theme);
  }, [theme]);

  // Fetch submissions from API
  const fetchSubmissions = useCallback(async () => {
    if (!questionId || questionId === '1') return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/contests/${contestId}/results`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.submissions) {
        // filter submissions for the current questionId
        const filtered = data.submissions.filter(s => s.problem?._id === questionId || s.problem === questionId);
        setSubmissions(filtered);
      }
    } catch (e) {
      console.error("Submissions load failed", e);
    }
  }, [contestId, questionId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const fetchProblems = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/contests/${contestId}/problems`);
        const data = await res.json();
        if (data.success) {
          setProblems(data.problems);
          if (data.contest) {
            setContest(data.contest);
          } else {
            // Fallback direct contest call
            const contestRes = await fetch(`${API_BASE}/api/contests/${contestId}`);
            const contestData = await contestRes.json();
            if (contestData.success && contestData.contest) {
              setContest(contestData.contest);
            }
          }
          const currentP = data.problems.find(p => p._id === questionId) || data.problems[0];
          if (currentP && currentP._id !== questionId) {
            navigate(`/workspace/${contestId}/${currentP._id}`, { replace: true });
          }

          if (token) {
            try {
              const sessionRes = await fetch(`${API_BASE}/api/contests/${contestId}/session`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              const sessionData = await sessionRes.json();
              if (sessionData.success && sessionData.registration) {
                setContestSession(sessionData.registration);
              }
            } catch (err) {
              console.error("Session load failed", err);
            }
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
      if (savedCode) {
        setCode(savedCode);
      } else {
        // Use problem's starter code if defined, else fall back to generic template
        const currentP = problemsRef.current.find(p => p._id === questionId) || problemsRef.current[0];
        const problemStarter = currentP?.starterCode?.[language];
        setCode(problemStarter || STARTER_TEMPLATES[language]);
      }
      fetchSubmissions();
    }
  }, [language, questionId, getStorageKey, fetchSubmissions]); // problems via ref — not a dependency

  // Save code changes to localStorage
  useEffect(() => {
    if (questionId && questionId !== '1' && code) {
      localStorage.setItem(getStorageKey(questionId, language), code);
    }
  }, [code, language, questionId, getStorageKey]);

  useEffect(() => {
    if (!contest || !contest.durationMinutes) return;

    const updateTimer = () => {
      // Use user's registration time if available, fallback to contest start time
      const startTimeStr = contestSession?.registeredAt || contest.startTime;
      if (!startTimeStr) return;

      const startTime = new Date(startTimeStr).getTime();
      const contestEndTime = startTime + (contest.durationMinutes * 60 * 1000);
      const remTime = contestEndTime - Date.now();

      setRemainingTime(remTime);
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [contest, contestSession]);

  const formatTime = (ms) => {
    if (ms === null || ms === undefined) return "00:00:00";
    if (ms <= 0) return "Contest Ended";

    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const isEnded = remainingTime !== null && remainingTime <= 0;

  const handleRun = async () => {
    if (isEnded) {
      toast.warning("Contest has ended, but running code for evaluation.");
    }
    if (!questionId || isRunning) return;
    setIsRunning(true);
    setIsSubmitting(false);
    setOutput('');
    setVerdict('');
    setTestCases(null);
    setExecutionMetrics(null);
    setCompilerOutput('');

    if (isMobile) setActiveMobileTab('console');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        problemId: questionId,
        code,
        language,
        ...(isCustomInputActive && { customInput })
      };

      const res = await fetch(`${API_BASE}/api/contests/${contestId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
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
        else setOutput(data.detailedResults[0]?.actual || "No output recorded");
      } else {
        toast.error(data.message || "Execution failed");
      }
    } catch (e) {
      setIsRunning(false);
      toast.error("Execution engine offline");
    }
  };

  const handleSubmit = async () => {
    if (isEnded) {
      toast.warning("Contest has ended, but submitting solution for evaluation.");
    }
    if (!questionId || isRunning || isSubmitting) return;
    const token = localStorage.getItem('token');
    setIsSubmitting(true);
    setIsRunning(true);
    setOutput('');
    setVerdict('');
    setTestCases(null);
    setCompilerOutput('');

    if (isMobile) setActiveMobileTab('console');

    try {
      const res = await fetch(`${API_BASE}/api/contests/${contestId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ problemId: questionId, code, language }),
      });

      const data = await res.json();
      setIsSubmitting(false);
      setIsRunning(false);

      if (data.success) {
        const sub = data.submission;
        setVerdict(sub.verdict);
        setTestCases(sub.detailedResults);
        setExecutionMetrics({ time: sub.executionTime, memory: sub.memoryUsed });
        setComplexityEstimate(sub.complexityEstimate);
        setCompilerOutput(sub.compilerOutput);

        if (sub.verdict === 'Accepted') {
          toast.success("Solution Accepted! 100 Points.");
        } else {
          toast.error(`Verdict: ${sub.verdict}`);
        }

        // Refresh past submissions log
        fetchSubmissions();
      } else {
        toast.error(data.message || "Submission failed");
      }
    } catch (e) {
      setIsSubmitting(false);
      setIsRunning(false);
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

  // Editor controls panel block
  const editorHeaderControls = (
    <div className="h-12 bg-[#090b11] border-b border-[#1e293b] px-4 flex items-center justify-between shrink-0 select-none text-slate-300">
      <div className="flex items-center gap-3">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-[#1a1c2e] border border-[#2b3052] rounded-xl px-3 py-1 text-white text-[10px] font-black uppercase tracking-widest outline-none hover:bg-[#252a47] transition-all cursor-pointer"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="c">C</option>
        </select>

        <div className="h-4 w-px bg-[#1e293b]" />

        {/* Font size selectors */}
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mr-1">Font</span>
          <button
            onClick={() => setFontSize(prev => Math.max(10, prev - 1))}
            className="w-5 h-5 rounded bg-[#1a1c2e] hover:bg-[#252a47] flex items-center justify-center text-xs font-bold transition-all border border-[#2b3052]"
          >
            -
          </button>
          <span className="text-xs font-mono font-bold w-4 text-center">{fontSize}</span>
          <button
            onClick={() => setFontSize(prev => Math.min(24, prev + 1))}
            className="w-5 h-5 rounded bg-[#1a1c2e] hover:bg-[#252a47] flex items-center justify-center text-xs font-bold transition-all border border-[#2b3052]"
          >
            +
          </button>
        </div>

        <div className="h-4 w-px bg-[#1e293b]" />

        {/* Minimap toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={minimapEnabled}
            onChange={(e) => setMinimapEnabled(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-7 h-3.5 rounded-full transition-colors ${minimapEnabled ? 'bg-orange-500' : 'bg-slate-700'}`} />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Minimap</span>
        </label>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
          className="p-1.5 bg-[#1a1c2e] border border-[#2b3052] rounded-lg text-slate-400 hover:text-white transition-all"
          title="Toggle Editor Theme"
        >
          {theme === 'vs-dark' ? <Moon size={14} /> : <Sun size={14} />}
        </button>

        <button
          onClick={() => {
            if (window.confirm("Reset editor to problem's starter code?")) {
              const problemStarter = currentProblem?.starterCode?.[language];
              setCode(problemStarter || STARTER_TEMPLATES[language]);
            }
          }}
          className="p-1.5 bg-[#1a1c2e] border border-[#2b3052] rounded-lg text-slate-400 hover:text-white transition-all"
          title="Reset starter code"
        >
          <RotateCcw size={14} />
        </button>

        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="p-1.5 bg-[#1a1c2e] border border-[#2b3052] rounded-lg text-slate-400 hover:text-white transition-all"
          title="Toggle Fullscreen"
        >
          {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`h-screen w-full bg-[#090b11] flex flex-col overflow-hidden ${isFullScreen ? 'fixed inset-0 z-[9999]' : ''}`}>

      {/* Premium Header Workspace */}
      <header className="h-14 bg-[#0B1B3B] border-b border-white/10 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/contests')}>
            <BrandLogo size="sm" showText={false} clickable={false} />
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
                {formatTime(remainingTime)}
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
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${p._id === questionId ? 'bg-white/20' : 'bg-white/5'}`}>{String.fromCharCode(65 + idx)}</div>
                  <span className="text-[10px] font-bold truncate">{p.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button onClick={handleRun} disabled={isRunning} className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 flex items-center gap-2 transition-all disabled:opacity-50">
              <Play size={12} fill="currentColor" /> {isRunning && !isSubmitting ? 'Running...' : 'Run'}
            </button>
            <button onClick={handleSubmit} disabled={isRunning || isSubmitting} className="px-5 py-2 rounded-xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-orange-900/20">
              <Send size={12} fill="currentColor" /> {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            <button onClick={handleFinish} className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 flex items-center gap-2 transition-all">
              Finish
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE HEADER BUTTONS */}
      {isMobile && (
        <div className="flex items-center justify-around bg-[#0a0d16] border-b border-[#1e293b] text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0 select-none">
          <button
            onClick={() => setActiveMobileTab('problem')}
            className={`py-3.5 flex-1 text-center border-b-2 transition-all ${activeMobileTab === 'problem' ? 'text-orange-500 border-orange-500 bg-white/5' : 'border-transparent'}`}
          >
            Problem Description
          </button>
          <button
            onClick={() => setActiveMobileTab('editor')}
            className={`py-3.5 flex-1 text-center border-b-2 transition-all ${activeMobileTab === 'editor' ? 'text-orange-500 border-orange-500 bg-white/5' : 'border-transparent'}`}
          >
            Code Editor
          </button>
          <button
            onClick={() => setActiveMobileTab('console')}
            className={`py-3.5 flex-1 text-center border-b-2 transition-all ${activeMobileTab === 'console' ? 'text-orange-500 border-orange-500 bg-white/5' : 'border-transparent'}`}
          >
            Results Console
          </button>
        </div>
      )}

      {/* DESKTOP VS MOBILE LAYOUT CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        {isMobile ? (
          <div className="w-full h-full flex flex-col">
            {activeMobileTab === 'problem' && (
              <div className="flex-1 overflow-y-auto">
                <ProblemPanel problem={currentProblem} />
              </div>
            )}

            {activeMobileTab === 'editor' && (
              <div className="flex-1 flex flex-col overflow-hidden relative">
                {editorHeaderControls}
                <div className="flex-1 overflow-hidden relative">
                  <CodeEditor
                    code={code}
                    onChange={setCode}
                    language={language}
                    theme={theme}
                    fontSize={fontSize}
                    minimapEnabled={minimapEnabled}
                    onRun={handleRun}
                    onSubmit={handleSubmit}
                  />
                </div>
              </div>
            )}

            {activeMobileTab === 'console' && (
              <div className="flex-1 overflow-hidden">
                <OutputPanel
                  output={output}
                  verdict={verdict}
                  testCases={testCases}
                  isRunning={isRunning}
                  isSubmitting={isSubmitting}
                  executionMetrics={executionMetrics}
                  complexityEstimate={complexityEstimate}
                  compilerOutput={compilerOutput}
                  customInput={customInput}
                  setCustomInput={setCustomInput}
                  isCustomInputActive={isCustomInputActive}
                  setIsCustomInputActive={setIsCustomInputActive}
                  submissions={submissions}
                  onLoadSubmission={setCode}
                />
              </div>
            )}
          </div>
        ) : (
          <WorkspaceLayout
            leftPanel={
              <div className="h-full bg-[#0b0f19] select-none">
                <ProblemPanel problem={currentProblem} />
              </div>
            }
            rightTopPanel={
              <div className="h-full flex flex-col overflow-hidden">
                {editorHeaderControls}
                <div className="flex-1 overflow-hidden relative">
                  <CodeEditor
                    code={code}
                    onChange={setCode}
                    language={language}
                    theme={theme}
                    fontSize={fontSize}
                    minimapEnabled={minimapEnabled}
                    onRun={handleRun}
                    onSubmit={handleSubmit}
                  />
                </div>
              </div>
            }
            rightBottomPanel={
              <div className="h-full overflow-hidden">
                <OutputPanel
                  output={output}
                  verdict={verdict}
                  testCases={testCases}
                  isRunning={isRunning}
                  isSubmitting={isSubmitting}
                  executionMetrics={executionMetrics}
                  complexityEstimate={complexityEstimate}
                  compilerOutput={compilerOutput}
                  customInput={customInput}
                  setCustomInput={setCustomInput}
                  isCustomInputActive={isCustomInputActive}
                  setIsCustomInputActive={setIsCustomInputActive}
                  submissions={submissions}
                  onLoadSubmission={setCode}
                />
              </div>
            }
            isFullScreen={isFullScreen}
          />
        )}
      </div>
    </div>
  );
};

export default CodingWorkspace;
