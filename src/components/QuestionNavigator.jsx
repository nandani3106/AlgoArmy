import React from 'react';
import { Bookmark, CheckCircle2 } from 'lucide-react';

const QuestionNavigator = ({ questions, currentIdx, onSelect, answers = {} }) => {
  return (
    <div className="bg-white rounded-3xl border border-orange-100/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0B1B3B]">Question Navigator</h4>
        <span className="text-[10px] font-bold text-slate-400">{Object.keys(answers).length}/{questions.length} Solved</span>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {questions.map((q, idx) => {
          const isCurrent = currentIdx === idx;
          const isAnswered = !!answers[idx];
          
          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all relative ${
                isCurrent 
                  ? 'bg-[#0B1B3B] text-white shadow-lg shadow-navy-900/20' 
                  : isAnswered
                    ? 'bg-green-50 text-green-600 border border-green-100'
                    : 'bg-slate-50 text-slate-500 border border-slate-100 hover:border-orange-200'
              }`}
            >
              {idx + 1}
              {isAnswered && !isCurrent && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <CheckCircle2 size={8} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-md bg-[#0B1B3B]" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-md bg-green-100 border border-green-200" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-md bg-slate-100" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Remaining</span>
        </div>
        <div className="flex items-center gap-2">
          <Bookmark size={12} className="text-orange-500" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Review</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigator;
