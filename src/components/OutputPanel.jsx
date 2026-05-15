import React, { useState } from 'react';
import { Terminal, CheckCircle, XCircle, Timer, Database, Activity, ChevronDown, ChevronUp, AlertCircle, Cpu } from 'lucide-react';

const OutputPanel = ({ output, verdict, testCases, isRunning, executionMetrics, complexityEstimate, compilerOutput }) => {
  const [activeTab, setActiveTab] = useState('output');
  const [expandedTc, setExpandedTc] = useState(null);

  const getVerdictColor = (v) => {
    switch (v) {
      case 'Accepted': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'Wrong Answer': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'Time Limit Exceeded': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'Memory Limit Exceeded': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'Compilation Error': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Runtime Error': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  if (isRunning) {
    return (
      <div className="h-full w-full bg-[#1e1e1e] border-t border-white/5 flex flex-col items-center justify-center gap-4 text-slate-500">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin"></div>
        <div className="flex flex-col items-center">
          <span className="text-white font-black text-sm uppercase tracking-widest animate-pulse">Evaluating Logic...</span>
          <span className="text-[10px] font-bold">Communicating with Judge0 CE</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#1e1e1e] border-t border-white/5 flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center px-4 bg-[#1a1a1a] border-b border-white/5 shrink-0">
        <button 
          onClick={() => setActiveTab('output')}
          className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
            activeTab === 'output' ? 'text-white border-b-2 border-orange-500 bg-white/5' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Terminal size={14} /> Output
        </button>
        <button 
          onClick={() => setActiveTab('test-cases')}
          className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
            activeTab === 'test-cases' ? 'text-white border-b-2 border-orange-500 bg-white/5' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Activity size={14} /> Test Results {testCases?.length > 0 && `(${testCases.length})`}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {activeTab === 'output' ? (
          <div className="space-y-6">
            {/* Verdict and Metrics */}
            {verdict && (
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className={`px-4 py-2 rounded-xl border flex items-center gap-3 ${getVerdictColor(verdict)}`}>
                  {verdict === 'Accepted' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                  <span className="font-black text-sm uppercase tracking-tight">{verdict}</span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Timer size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{executionMetrics?.time || '0 ms'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Database size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{executionMetrics?.memory || '0 MB'}</span>
                  </div>
                  {complexityEstimate && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Cpu size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{complexityEstimate}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Compiler Output */}
            {compilerOutput && (
               <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">Compiler Output</p>
                  <div className="bg-[#141414] rounded-xl p-4 border border-amber-500/10 font-mono text-xs text-amber-200/70 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {compilerOutput}
                  </div>
               </div>
            )}

            {/* Console Output */}
            <div className="space-y-2">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Standard Output</p>
               <div className="bg-[#141414] rounded-2xl p-6 border border-white/5 font-mono text-sm shadow-inner">
                  <pre className="text-slate-300 whitespace-pre-wrap">
                    {output || "No output to display. Run code to see results."}
                  </pre>
               </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {testCases && testCases.length > 0 ? (
              testCases.map((tc, idx) => (
                <div key={idx} className={`rounded-2xl border transition-all overflow-hidden ${
                  tc.passed ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'
                }`}>
                  <button 
                    onClick={() => setExpandedTc(expandedTc === idx ? null : idx)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        tc.passed ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {tc.passed ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-xs font-bold uppercase tracking-tight">Test Case {idx + 1}</span>
                        {tc.isHidden && <span className="px-1.5 py-0.5 bg-slate-800 text-slate-500 text-[8px] font-black rounded uppercase">Hidden</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-bold text-slate-500">{tc.status}</span>
                       {expandedTc === idx ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                    </div>
                  </button>
                  
                  {expandedTc === idx && (
                    <div className="px-6 pb-6 pt-2 space-y-4 border-t border-white/5 bg-black/20">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Input</p>
                        <div className="bg-[#1a1a1a] p-3 rounded-lg text-slate-300 font-mono text-xs overflow-x-auto whitespace-pre">{tc.input}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Expected</p>
                          <div className="bg-[#1a1a1a] p-3 rounded-lg text-green-400/70 font-mono text-xs overflow-x-auto whitespace-pre">{tc.expected}</div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Actual</p>
                          <div className={`p-3 rounded-lg font-mono text-xs overflow-x-auto whitespace-pre ${tc.passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {tc.actual || "No output"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                         <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                            <Timer size={12} /> {tc.time}
                         </div>
                         <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                            <Database size={12} /> {tc.memory}
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
                <Terminal size={32} />
                <p className="text-xs font-bold uppercase tracking-widest italic text-center">Execute your code to evaluate against<br />official test cases.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
