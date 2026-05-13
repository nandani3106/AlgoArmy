import React from 'react';
import { Mic, Zap, AlertCircle } from 'lucide-react';

const QuestionPanel = ({ question, idx, total, isRecording }) => {
  return (
    <div className="bg-[#0B1B3B] rounded-[3rem] p-10 md:p-14 text-white shadow-2xl shadow-navy-900/40 relative overflow-hidden h-full flex flex-col justify-between">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest text-orange-400">
            Question {idx + 1} of {total}
          </span>
          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Listening</span>
            </div>
          )}
        </div>

        <h2 className="text-2xl md:text-4xl font-black mb-10 leading-tight">
          {question}
        </h2>

        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Suggested Focus Area</p>
          <div className="flex flex-wrap gap-2">
            {['Detailed Example', 'Quantifiable Results', 'Technical Accuracy'].map((tag, i) => (
              <span key={i} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 pt-12 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Zap size={24} fill="currentColor" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-white mb-0.5">AlgoAI Assistant</p>
          <p className="text-[10px] text-slate-400 font-medium">Providing real-time evaluation logic</p>
        </div>
      </div>
    </div>
  );
};

export default QuestionPanel;
