import React from 'react';
import { Play, Send, CheckCircle2, XCircle, AlertTriangle, Terminal } from 'lucide-react';

const OutputPanel = ({ output, verdict, testCases, isRunning }) => {
  return (
    <div className="h-full bg-[#0B1B3B] text-white flex flex-col font-mono text-sm">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal size={18} className="text-orange-400" />
          <span className="font-black uppercase tracking-widest text-[10px] text-slate-400">Execution Output</span>
        </div>
        {verdict && (
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            verdict === 'Accepted' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {verdict}
          </span>
        )}
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
        {isRunning ? (
          <div className="flex items-center gap-3 text-orange-400 animate-pulse">
            <Play size={16} fill="currentColor" />
            <span>Running test cases...</span>
          </div>
        ) : output ? (
          <div className="space-y-4">
            {testCases && (
              <div className="grid grid-cols-2 gap-3 mb-8">
                {testCases.map((tc, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${
                    tc.passed ? 'bg-green-500/5 border-green-500/20 text-green-400' : 'bg-red-500/5 border-red-500/20 text-red-400'
                  }`}>
                    <span className="text-[10px] font-black uppercase tracking-widest">Test Case {idx + 1}</span>
                    {tc.passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Terminal Output</p>
              <pre className="bg-black/20 p-4 rounded-xl text-slate-300 leading-relaxed overflow-x-auto">
                {output}
              </pre>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Runtime</p>
                <p className="text-orange-400 font-black">42ms</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Memory</p>
                <p className="text-orange-400 font-black">12.4MB</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center space-y-4">
            <Terminal size={48} strokeWidth={1} className="opacity-20" />
            <p className="max-w-[200px]">Run your code to see the test case results here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
