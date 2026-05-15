import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, Send, ChevronLeft, ChevronRight,
  AlertTriangle, Building2, Bookmark, Loader2, Play, RotateCcw, Copy, Download, Save, Zap, Terminal,
  Layout, ListChecks, CheckCircle2
} from 'lucide-react';
import QuestionNavigator from '../components/QuestionNavigator';
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

const OAWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [oa, setOa] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [output, setOutput] = useState('');
  const [verdict, setVerdict] = useState('');
  const [testCases, setTestCases] = useState(null);
  const [executionMetrics, setExecutionMetrics] = useState(null);
  const [complexityEstimate, setComplexityEstimate] = useState('');
  const [compilerOutput, setCompilerOutput] = useState('');

  const getStorageKey = useCallback((qId, lang) => `oa-${qId}-${lang}`, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const [oaRes, qRes] = await Promise.all([
          fetch(`${API_BASE}/api/oa/${id}`),
          fetch(`${API_BASE}/api/oa/${id}/questions`)
        ]);
        
        const oaData = await oaRes.json();
        const qData = await qRes.json();

        if (oaData.success) {
          setOa(oaData.data);
          setTimeLeft((oaData.data.durationMinutes || 45) * 60);
        }

        if (qData.success) {
          setQuestions(qData.data);
          const initialAnswers = {};
          qData.data.forEach(q => {
            if (q.type === 'coding') {
              const defaultLang = 'javascript';
              const saved = localStorage.getItem(getStorageKey(q._id, defaultLang));
              initialAnswers[q._id] = { answer: saved || STARTER_TEMPLATES[defaultLang], language: defaultLang };
            } else {
              initialAnswers[q._id] = { answer: '' };
            }
          });
          setAnswers(initialAnswers);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id, navigate, getStorageKey]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswer = (val, lang = null) => {
    const qId = questions[currentIdx]._id;
    const current = answers[qId] || {};
    const newAnswer = { ...current, answer: val, ...(lang && { language: lang }) };
    setAnswers({ ...answers, [qId]: newAnswer });
    if (questions[currentIdx].type === 'coding') {
      localStorage.setItem(getStorageKey(qId, lang || current.language || 'javascript'), val);
    }
  };

  const saveProgress = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const qId = questions[currentIdx]._id;
      const ans = answers[qId];
      
      const res = await fetch(`${API_BASE}/api/oa/${id}/save-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          answers: [{ questionId: qId, answer: ans.answer, language: ans.language }]
        })
      });
      const data = await res.json();
      if (!data.success) toast.error("Failed to save progress");
    } catch (e) {
      console.error("Save progress failed", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    await saveProgress();
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      // Reset output panel for new question
      setOutput(''); setVerdict(''); setTestCases(null);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setOutput(''); setVerdict(''); setTestCases(null);
    }
  };

  const handleRun = async () => {
    const q = questions[currentIdx];
    if (q.type !== 'coding' || isRunning) return;
    setIsRunning(true); setOutput(''); setVerdict(''); setTestCases(null); setCompilerOutput('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/oa/${id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          questionId: q._id, 
          code: answers[q._id].answer, 
          language: answers[q._id].language 
        })
      });
      const data = await res.json();
      setIsRunning(false);

      if (data.success) {
        setVerdict(data.verdict);
        setTestCases(data.detailedResults);
        setExecutionMetrics({ time: data.executionTime, memory: data.memoryUsed });
        setComplexityEstimate(data.complexityEstimate);
        setCompilerOutput(data.compilerOutput);
        const failed = data.detailedResults.find(r => !r.passed);
        setOutput(failed ? failed.actual : (data.detailedResults[0]?.actual || "Execution Finished"));
      }
    } catch (e) { setIsRunning(false); toast.error("Execution error"); }
  };

  const submitAssessment = async (isAuto = false) => {
    if (!isAuto && !window.confirm('Submit Assessment?')) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        answers: Object.entries(answers).map(([qId, ans]) => ({ 
          questionId: qId, 
          answer: ans.answer, 
          language: ans.language 
        }))
      };
      const res = await fetch(`${API_BASE}/api/oa/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("oaSubmission", JSON.stringify(data.submission));
        navigate(`/oa/${id}/submitted`);
      }
    } catch (err) { toast.error('Submission error'); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="h-screen w-full bg-[#0B1B3B] flex flex-col items-center justify-center gap-4">
      <Loader2 size={48} className="animate-spin text-orange-500" />
      <span className="text-white/50 font-black text-xs uppercase tracking-[0.3em]">Preparing Assessment Environment...</span>
    </div>
  );

  const currentQ = questions[currentIdx];
  const currentAns = answers[currentQ?._id] || { answer: '', language: 'javascript' };

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex flex-col overflow-hidden">
      <header className="h-14 bg-[#0B1B3B] border-b border-white/10 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Building2 className="text-white" size={16} />
            </div>
            <span className="text-white font-black text-sm tracking-tight">{oa?.title}</span>
          </div>
          {isSaving && <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase animate-pulse"><Save size={12}/> Saving...</div>}
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <Clock size={14} className="text-orange-400" />
            <span className="text-orange-400 font-mono text-xs font-black tracking-widest">
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
          <button onClick={() => submitAssessment(false)} disabled={submitting} className="px-6 py-2 rounded-xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all disabled:opacity-50 shadow-lg shadow-orange-900/20">
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/5 h-full border-r border-slate-200 bg-white p-6 overflow-y-auto shrink-0">
          <QuestionNavigator 
            questions={questions} 
            currentIdx={currentIdx} 
            onSelect={setCurrentIdx} 
            answers={Object.fromEntries(Object.entries(answers).map(([k,v]) => [k, v.answer]))} 
            isApiMode={true} 
          />
        </div>

        <div className="flex-1 h-full flex flex-col bg-slate-50 overflow-hidden">
          {currentQ && (
            <div className="h-full flex flex-col">
              <div className="px-8 py-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                   <span className="px-3 py-1 rounded-full bg-[#0B1B3B] text-white text-[10px] font-black uppercase tracking-widest">Question {currentIdx + 1}</span>
                   <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest">{currentQ.type}</span>
                </div>
                {currentQ.type === 'coding' && (
                  <div className="flex items-center gap-3">
                    <select 
                      value={currentAns.language} 
                      onChange={(e) => handleAnswer(STARTER_TEMPLATES[e.target.value], e.target.value)} 
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                    </select>
                    <button onClick={handleRun} disabled={isRunning} className="px-4 py-1.5 bg-[#0B1B3B] text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all">
                      <Play size={12} fill="currentColor" /> {isRunning ? 'Running...' : 'Run'}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-hidden relative">
                {currentQ.type === 'coding' ? (
                  <div className="h-full flex overflow-hidden">
                    <div className="w-[35%] bg-white border-r border-slate-200 p-8 overflow-y-auto custom-scrollbar">
                      <h2 className="text-xl font-black text-[#0B1B3B] mb-6">{currentQ.title}</h2>
                      <div className="prose prose-slate max-w-none">
                        <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{currentQ.statement}</div>
                      </div>
                      {currentQ.timeLimit && (
                        <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-4">
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Limit</p>
                              <p className="text-xs font-bold text-[#0B1B3B]">{currentQ.timeLimit}s</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Memory Limit</p>
                              <p className="text-xs font-bold text-[#0B1B3B]">{currentQ.memoryLimit}MB</p>
                           </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                      <div className="flex-1 overflow-hidden relative">
                         <CodeEditor code={currentAns.answer} onChange={handleAnswer} language={currentAns.language} />
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
                ) : (
                  <div className="p-12 max-w-3xl mx-auto space-y-8 overflow-y-auto h-full custom-scrollbar pb-32">
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-orange-900/5 border border-orange-100/50">
                      <h2 className="text-2xl font-black text-[#0B1B3B] mb-10 leading-tight">{currentQ.title}</h2>
                      <div className="space-y-4">
                        {currentQ.options.map((opt, i) => (
                          <button 
                            key={i} 
                            onClick={() => handleAnswer(opt)} 
                            className={`w-full p-6 rounded-2xl border text-left flex items-center gap-5 transition-all group ${
                              currentAns.answer === opt 
                                ? 'bg-[#0B1B3B] text-white border-[#0B1B3B] shadow-lg shadow-navy-900/20' 
                                : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-orange-200'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${
                              currentAns.answer === opt ? 'bg-white/10 text-white' : 'bg-white text-slate-400 group-hover:text-orange-500'
                            }`}>
                              {String.fromCharCode(65+i)}
                            </div>
                            <span className="font-bold text-sm tracking-tight">{opt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Question Footer Navigation */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-200 flex items-center justify-between z-30">
                  <button 
                    onClick={handlePrev} 
                    disabled={currentIdx === 0} 
                    className="px-6 py-2 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all disabled:opacity-30 flex items-center gap-2"
                  >
                    <ChevronLeft size={16} /> Previous Question
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {currentIdx + 1} of {questions.length}</span>
                  </div>
                  {currentIdx === questions.length - 1 ? (
                    <button 
                      onClick={() => submitAssessment(false)} 
                      className="px-8 py-2 rounded-xl bg-green-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-900/10"
                    >
                      <CheckCircle2 size={16} /> Submit Assessment
                    </button>
                  ) : (
                    <button 
                      onClick={handleNext} 
                      className="px-8 py-2 rounded-xl bg-[#0B1B3B] text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-navy-900/20"
                    >
                      Next Question <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAWorkspace;
