import React from 'react';
import { BookOpen, Star, Tag, AlertCircle } from 'lucide-react';

const ProblemPanel = ({ problem }) => {
  return (
    <div className="h-full overflow-y-auto bg-white p-8 custom-scrollbar">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
          Problem {problem.id}
        </span>
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
          problem.difficulty === 'Easy' ? 'bg-green-50 text-green-600' :
          problem.difficulty === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
        }`}>
          {problem.difficulty}
        </span>
        <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-[0.2em]">
          <Star size={12} fill="currentColor" /> {problem.points} Points
        </span>
      </div>

      <h1 className="text-3xl font-black text-[#0B1B3B] mb-8 leading-tight">
        {problem.title}
      </h1>

      <div className="space-y-8">
        {/* Description */}
        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#0B1B3B] flex items-center gap-2">
            <BookOpen size={16} /> Problem Description
          </h3>
          <p className="text-slate-600 font-medium leading-relaxed">
            {problem.description}
          </p>
        </section>

        {/* Examples */}
        {problem.examples.map((example, idx) => (
          <section key={idx} className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#0B1B3B]">
              Example {idx + 1}
            </h3>
            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Input</p>
                <code className="text-sm font-bold text-[#0B1B3B]">{example.input}</code>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Output</p>
                <code className="text-sm font-bold text-[#0B1B3B]">{example.output}</code>
              </div>
              {example.explanation && (
                <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                  <span className="font-bold uppercase tracking-widest mr-2">Explanation:</span>
                  {example.explanation}
                </p>
              )}
            </div>
          </section>
        ))}

        {/* Constraints */}
        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#0B1B3B] flex items-center gap-2">
            <AlertCircle size={16} /> Constraints
          </h3>
          <ul className="space-y-3">
            {problem.constraints.map((c, idx) => (
              <li key={idx} className="flex gap-3 items-start text-xs text-slate-500 font-bold bg-slate-50 p-3 rounded-xl">
                <div className="mt-1 w-1 h-1 rounded-full bg-slate-300 shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </section>

        {/* Tags */}
        <section className="space-y-4 pt-8 border-t border-slate-100">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#0B1B3B] flex items-center gap-2">
            <Tag size={16} /> Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {problem.tags.map((tag) => (
              <span key={tag} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                {tag}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProblemPanel;
