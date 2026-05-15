import React from 'react';
import { BookOpen, Star, Tag, AlertCircle, FileText, Info } from 'lucide-react';

const ProblemPanel = ({ problem }) => {
  if (!problem) return (
    <div className="h-full flex items-center justify-center p-8 text-slate-400 font-bold uppercase tracking-widest bg-white">
      Select a problem to view details
    </div>
  );

  return (
    <div className="h-full overflow-y-auto bg-white p-8 custom-scrollbar">
      {/* Problem Header */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
          Problem {problem.order || 1}
        </span>
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
          problem.difficulty === 'Easy' ? 'bg-green-50 text-green-600' :
          problem.difficulty === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
        }`}>
          {problem.difficulty || 'Medium'}
        </span>
        <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-[0.2em]">
          <Star size={12} fill="currentColor" /> {problem.points || 0} Points
        </span>
      </div>

      <h1 className="text-3xl font-black text-[#0B1B3B] mb-8 leading-tight">
        {problem.title}
      </h1>

      <div className="space-y-10 pb-12">
        {/* Description / Statement */}
        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#0B1B3B] flex items-center gap-2">
            <BookOpen size={16} /> Problem Statement
          </h3>
          <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
            {problem.statement || problem.description || "No description provided."}
          </div>
        </section>

        {/* Input/Output Format */}
        {(problem.inputFormat || problem.outputFormat) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {problem.inputFormat && (
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#0B1B3B] flex items-center gap-2">
                  <FileText size={16} /> Input Format
                </h3>
                <p className="text-slate-500 text-xs font-bold leading-relaxed">{problem.inputFormat}</p>
              </div>
            )}
            {problem.outputFormat && (
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#0B1B3B] flex items-center gap-2">
                  <Info size={16} /> Output Format
                </h3>
                <p className="text-slate-500 text-xs font-bold leading-relaxed">{problem.outputFormat}</p>
              </div>
            )}
          </section>
        )}

        {/* Examples */}
        {problem.examples && problem.examples.length > 0 && (
          <div className="space-y-8">
            {problem.examples.map((example, idx) => (
              <section key={idx} className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#0B1B3B]">
                  Example {idx + 1}
                </h3>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Input</p>
                    <code className="text-sm font-bold text-[#0B1B3B] block whitespace-pre-wrap">{example.input}</code>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Output</p>
                    <code className="text-sm font-bold text-[#0B1B3B] block whitespace-pre-wrap">{example.output}</code>
                  </div>
                  {example.explanation && (
                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                      <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                        <span className="font-bold uppercase tracking-widest text-blue-600 mr-2">Explanation:</span>
                        {example.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Constraints */}
        {problem.constraints && (
          <section className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#0B1B3B] flex items-center gap-2">
              <AlertCircle size={16} /> Constraints
            </h3>
            <div className="bg-red-50/30 p-6 rounded-2xl border border-red-100/50">
               <pre className="text-xs text-red-800 font-black whitespace-pre-wrap font-mono leading-relaxed">
                 {problem.constraints}
               </pre>
            </div>
          </section>
        )}

        {/* Topics / Tags */}
        {problem.tags && problem.tags.length > 0 && (
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
        )}
      </div>
    </div>
  );
};

export default ProblemPanel;
