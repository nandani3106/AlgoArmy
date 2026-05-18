import React, { useState, useEffect } from 'react';
import { 
  Terminal, CheckCircle, XCircle, Timer, Database, Activity, 
  ChevronDown, ChevronUp, AlertCircle, Cpu, Play, Send, Sparkles, 
  History, Code2, Clipboard, ArrowRight 
} from 'lucide-react';

const OutputPanel = ({ 
  output, 
  verdict, 
  testCases, 
  isRunning, 
  isSubmitting,
  executionMetrics, 
  complexityEstimate, 
  compilerOutput,
  customInput,
  setCustomInput,
  isCustomInputActive,
  setIsCustomInputActive,
  sampleInput,
  sampleOutput,
  submissions = [],
  onLoadSubmission
}) => {
  const [activeTab, setActiveTab] = useState('test-cases');
  const [expandedTc, setExpandedTc] = useState(null);
  
  // Real-time animation stages
  const [stage, setStage] = useState('Compiling...');
  const [percent, setPercent] = useState(15);

  useEffect(() => {
    if (isRunning) {
      setActiveTab('test-cases'); // Switch to results automatically on run
      setStage('Compiling...');
      setPercent(15);
      
      const t1 = setTimeout(() => { 
        setStage(isSubmitting ? 'Evaluating Test Suite (1/10)...' : 'Running visible test cases...'); 
        setPercent(45); 
      }, 700);
      
      const t2 = setTimeout(() => { 
        setStage(isSubmitting ? 'Analyzing Edge Cases (5/10)...' : 'Comparing expected output...'); 
        setPercent(75); 
      }, 1400);

      const t3 = setTimeout(() => { 
        setStage(isSubmitting ? 'Validating Hidden Parameters...' : 'Finalizing output streams...'); 
        setPercent(92); 
      }, 2100);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isRunning, isSubmitting]);

  const getVerdictColor = (v) => {
    switch (v) {
      case 'Accepted': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Wrong Answer': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Time Limit Exceeded': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'Memory Limit Exceeded': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'Compilation Error': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Runtime Error': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="h-full w-full bg-[#0d0f19] border-t border-[#1e293b] flex flex-col overflow-hidden text-slate-300 font-sans">
      {/* Tabs / Header */}
      <div className="flex items-center justify-between px-6 bg-[#090b11] border-b border-[#1e293b] shrink-0">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setActiveTab('test-cases')}
            className={`px-5 py-3.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'test-cases' 
                ? 'text-white border-orange-500 bg-[#0d0f19]' 
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Activity size={14} /> Console / Test Cases
          </button>
          
          <button 
            onClick={() => setActiveTab('output')}
            className={`px-5 py-3.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'output' 
                ? 'text-white border-orange-500 bg-[#0d0f19]' 
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Terminal size={14} /> Stdout Output
          </button>

          <button 
            onClick={() => setActiveTab('history')}
            className={`px-5 py-3.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border-b-2 ${
              activeTab === 'history' 
                ? 'text-white border-orange-500 bg-[#0d0f19]' 
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <History size={14} /> Submission History {submissions.length > 0 && `(${submissions.length})`}
          </button>
        </div>

        {/* Custom Input Toggle */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Custom Input</span>
            <div className="relative">
              <input 
                type="checkbox" 
                checked={isCustomInputActive} 
                onChange={(e) => {
                  setIsCustomInputActive(e.target.checked);
                  setActiveTab('test-cases');
                }}
                className="sr-only" 
              />
              <div className={`w-8 h-4 rounded-full transition-colors ${isCustomInputActive ? 'bg-orange-500' : 'bg-slate-700'}`} />
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${isCustomInputActive ? 'translate-x-4' : ''}`} />
            </div>
          </label>
        </div>
      </div>

      {/* Main Console Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#0a0c14]">
        
        {/* LOADER ANIMATION */}
        {isRunning && (
          <div className="h-full flex flex-col items-center justify-center py-8 text-slate-500 gap-5 max-w-md mx-auto">
            <div className="w-12 h-12 border-4 border-slate-800 border-t-orange-500 rounded-full animate-spin"></div>
            <div className="w-full space-y-2 text-center">
              <span className="text-white font-black text-xs uppercase tracking-widest animate-pulse block">
                {stage}
              </span>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300 rounded-full" 
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 block">
                Evaluating code via Judge0 Sandbox
              </span>
            </div>
          </div>
        )}

        {/* TAB 1: CONSOLE / TEST CASES & CUSTOM INPUT */}
        {!isRunning && activeTab === 'test-cases' && (
          <div className="space-y-6">
            
            {/* Custom Input Active View */}
            {isCustomInputActive ? (
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Custom Stdin Input</h4>
                  <span className="text-[9px] font-bold text-slate-500">Provide input variables manually</span>
                </div>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter inputs here (e.g. nums = [2,7,11,15], target = 9)..."
                  rows={4}
                  className="w-full bg-[#111322] border border-[#1e293b] rounded-2xl p-4 font-mono text-sm text-slate-200 focus:outline-none focus:border-orange-500/50 shadow-inner"
                />
              </div>
            ) : (
              // Visible Testcases Results Map
              <div className="space-y-4">
                {verdict && (
                  <div className="flex flex-wrap items-center gap-4 mb-6 text-left">
                    <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${getVerdictColor(verdict)}`}>
                      {verdict === 'Accepted' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                      <span className="font-black text-sm uppercase tracking-tight">{verdict}</span>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Timer size={14} className="text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{executionMetrics?.time || '0.00s'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Database size={14} className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{executionMetrics?.memory || '0.00MB'}</span>
                      </div>
                      {complexityEstimate && (
                        <div className="flex flex-wrap items-center gap-4 text-slate-400 border-l border-slate-800 pl-4">
                          {typeof complexityEstimate === 'object' ? (
                            <>
                              <div className="flex items-center gap-1.5" title={complexityEstimate.explanation}>
                                <Cpu size={14} className="text-purple-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Time: <span className="text-emerald-400 font-mono font-bold ml-1">{complexityEstimate.time || 'O(1)'}</span></span>
                              </div>
                              <div className="flex items-center gap-1.5" title={complexityEstimate.explanation}>
                                <Database size={14} className="text-blue-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Space: <span className="text-blue-400 font-mono font-bold ml-1">{complexityEstimate.space || 'O(1)'}</span></span>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <Cpu size={14} className="text-purple-500" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{complexityEstimate}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {testCases && testCases.length > 0 ? (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Validation Cases</h4>
                    {testCases.map((tc, idx) => (
                      <div key={idx} className={`rounded-2xl border transition-all overflow-hidden ${
                        tc.passed ? 'bg-[#0f1d19]/40 border-emerald-500/10' : 'bg-[#221015]/40 border-rose-500/10'
                      }`}>
                        <button 
                          onClick={() => setExpandedTc(expandedTc === idx ? null : idx)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                              tc.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {tc.passed ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-white text-xs font-bold uppercase tracking-tight">Test Case {idx + 1}</span>
                              {tc.isHidden && <span className="px-2 py-0.5 bg-[#1e293b] text-slate-400 text-[8px] font-black rounded-md uppercase tracking-wider">Hidden Case</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{tc.status}</span>
                             {expandedTc === idx ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                          </div>
                        </button>
                        
                        {expandedTc === idx && (
                          <div className="px-6 pb-6 pt-2 space-y-4 border-t border-[#1e293b] bg-black/25 text-left">
                            <div className="space-y-2">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Input</p>
                              <pre className="bg-[#111322] p-4 rounded-xl border border-[#1e293b] text-slate-300 font-mono text-xs overflow-x-auto whitespace-pre">{tc.input}</pre>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Expected Output</p>
                                <pre className="bg-[#111322] p-4 rounded-xl border border-[#1e293b] text-emerald-400/80 font-mono text-xs overflow-x-auto whitespace-pre">{tc.expected}</pre>
                              </div>
                              <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Actual Output</p>
                                <pre className={`p-4 rounded-xl border font-mono text-xs overflow-x-auto whitespace-pre ${tc.passed ? 'bg-[#0f1d19]/60 border-emerald-500/20 text-emerald-400' : 'bg-[#221015]/60 border-rose-500/20 text-rose-400'}`}>
                                  {tc.actual || "No output"}
                                </pre>
                              </div>
                            </div>
                            {(tc.time || tc.memory) && (
                              <div className="flex items-center gap-4 pt-2 border-t border-[#1e293b]/50">
                                 <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-black uppercase tracking-widest">
                                    <Timer size={12} className="text-orange-500" /> {tc.time}
                                 </div>
                                 <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-black uppercase tracking-widest">
                                    <Database size={12} className="text-blue-500" /> {tc.memory}
                                 </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  // Default Welcome / Placeholder Case
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3 border border-dashed border-[#1e293b] rounded-[2.5rem]">
                    <Sparkles size={32} className="text-orange-500 animate-pulse" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Environment Ready</p>
                    <p className="text-[10px] text-slate-500 font-bold max-w-xs text-center leading-relaxed">
                      Click the "Run" button to execute your code against the visible sample test cases.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STDOUT OUTPUT */}
        {!isRunning && activeTab === 'output' && (
          <div className="space-y-6 text-left">
            {compilerOutput && (
               <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">Compiler Warnings & Errors</p>
                  <pre className="bg-[#241712]/50 rounded-2xl p-6 border border-amber-500/20 font-mono text-xs text-amber-200 whitespace-pre-wrap max-h-56 overflow-y-auto">
                    {compilerOutput}
                  </pre>
               </div>
            )}

            <div className="space-y-2">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Standard Output (Stdout)</p>
               <div className="bg-[#0b0c13] rounded-3xl p-6 border border-[#1e293b] font-mono text-sm shadow-inner min-h-32">
                  <pre className="text-slate-200 whitespace-pre-wrap break-words">
                    {output || "No stdout output recorded. Run code to display print streams."}
                  </pre>
               </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUBMISSION HISTORY */}
        {!isRunning && activeTab === 'history' && (
          <div className="space-y-4 text-left">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Submission Log</h4>
            
            {submissions.length > 0 ? (
              <div className="space-y-3">
                {submissions.map((sub, idx) => (
                  <div 
                    key={idx} 
                    className="p-5 rounded-2xl bg-[#111322]/50 border border-[#1e293b] flex flex-wrap items-center justify-between gap-4 hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-black uppercase tracking-widest ${
                          sub.status === 'Accepted' || sub.verdict === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {sub.status || sub.verdict || 'Accepted'}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                          {new Date(sub.submittedAt || sub.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex gap-4 items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                         <span>Lang: <span className="text-slate-200">{sub.language}</span></span>
                         {sub.runtime && <span>Time: <span className="text-slate-200">{sub.runtime}s</span></span>}
                         {sub.memory && <span>Mem: <span className="text-slate-200">{sub.memory}MB</span></span>}
                         {sub.score !== undefined && <span>Score: <span className="text-slate-200">{sub.score} Pts</span></span>}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        onLoadSubmission(sub.code);
                        toast.success("Code restored to editor!");
                      }}
                      className="px-4 py-2 bg-[#1b1e36] hover:bg-[#252a4e] text-orange-400 hover:text-orange-300 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-orange-500/10 shadow-sm transition-all"
                    >
                      <Code2 size={12} /> Load Code <ArrowRight size={10} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3 border border-dashed border-[#1e293b] rounded-[2.5rem]">
                <History size={32} className="text-slate-600" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">No Submissions Recorded</p>
                <p className="text-[10px] text-slate-600 font-bold text-center leading-relaxed">
                  Your official solution records for this question will be listed here after you submit.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default OutputPanel;
