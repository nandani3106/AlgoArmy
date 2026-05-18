import React from 'react';
import { BookOpen, Star, Tag, AlertCircle, FileText, Info } from 'lucide-react';

const ProblemPanel = ({ problem }) => {
  if (!problem) return (
    <div className="h-full flex items-center justify-center p-8 text-slate-400 font-bold uppercase tracking-widest bg-[#0b0f19]">
      Select a problem to view details
    </div>
  );

  // Markdown parser helper for statement and explanations
  const parseMarkdown = (text) => {
    if (!text) return "";
    // If it looks like HTML, return as-is
    if (/<[a-z][\s\S]*>/i.test(text)) {
      return text;
    }
    // Simple Markdown parsing for bold, italics, code, bullet points, headers, newlines
    let html = text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^\s*\n\* (.*$)/gim, '<ul><li>$1</li></ul>')
      .replace(/^\s*\n- (.*$)/gim, '<ul><li>$1</li></ul>')
      .replace(/\*\*([\s\S]*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([\s\S]*?)\*/g, '<em>$1</em>')
      .replace(/`([\s\S]*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br />');
    return html;
  };

  // Safe constraints renderer supporting both array of strings and single string
  const renderConstraints = () => {
    let list = [];
    if (Array.isArray(problem.constraints)) {
      list = problem.constraints;
    } else if (typeof problem.constraints === "string" && problem.constraints) {
      list = problem.constraints.split("\n").map(c => c.trim()).filter(Boolean);
    }

    if (list.length === 0) return null;

    return (
      <section className="space-y-4 pt-8 border-t border-white/5">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500" /> Constraints
        </h3>
        <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/10">
          <ul className="list-disc pl-5 space-y-2 text-xs text-red-400 font-bold font-mono leading-relaxed">
            {list.map((c, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: parseMarkdown(c) }} />
            ))}
          </ul>
        </div>
      </section>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-[#0b0f19] p-8 custom-scrollbar text-slate-200">
      {/* Problem Header: Title, Difficulty Badge, Tags */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">
          Problem {problem.order || 1}
        </span>
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
          problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
          problem.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {problem.difficulty || 'Medium'}
        </span>
        {problem.points !== undefined && (
          <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-[0.2em]">
            <Star size={12} fill="currentColor" /> {problem.points || 0} Points
          </span>
        )}
      </div>

      <div className="flex items-start justify-between mb-8">
        <h1 className="text-3xl font-black text-white leading-tight">
          {problem.title}
        </h1>
      </div>

      <div className="space-y-10 pb-12">
        {/* Full Problem Statement */}
        <section className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
            <BookOpen size={16} className="text-orange-500" /> Problem Statement
          </h3>
          <div 
            className="text-slate-300 font-medium leading-relaxed prose prose-invert max-w-none break-words"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(problem.statement || problem.description || "No description provided.") }}
          />
        </section>

        {/* Input/Output Format */}
        {(problem.inputFormat || problem.outputFormat) && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
            {problem.inputFormat && (
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                  <FileText size={16} className="text-orange-500" /> Input Format
                </h3>
                <p className="text-slate-400 text-xs font-bold leading-relaxed">{problem.inputFormat}</p>
              </div>
            )}
            {problem.outputFormat && (
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                  <Info size={16} className="text-orange-500" /> Output Format
                </h3>
                <p className="text-slate-400 text-xs font-bold leading-relaxed">{problem.outputFormat}</p>
              </div>
            )}
          </section>
        )}

        {/* Examples: Only render if examples length > 0 and skip blank cards */}
        {problem.examples && problem.examples.length > 0 && (
          <div className="space-y-8 pt-8 border-t border-white/5">
            {problem.examples.map((example, idx) => {
              if (!example.input && !example.output) return null; // Safe rendering check

              return (
                <section key={idx} className="space-y-4 text-left">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                    Example {idx + 1}
                  </h3>
                  <div className="space-y-4">
                    {example.input && (
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-inner">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Input</p>
                        <code className="text-sm font-bold text-orange-400 block whitespace-pre-wrap font-mono">{example.input}</code>
                      </div>
                    )}
                    {example.output && (
                      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-inner">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Output</p>
                        <code className="text-sm font-bold text-orange-400 block whitespace-pre-wrap font-mono">{example.output}</code>
                      </div>
                    )}
                    {example.explanation && (
                      <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                        <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                          <span className="font-bold uppercase tracking-widest text-blue-400 mr-2">Explanation:</span>
                          <span dangerouslySetInnerHTML={{ __html: parseMarkdown(example.explanation) }} />
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Constraints */}
        {renderConstraints()}

        {/* Notes (if any) */}
        {(problem.notes || problem.note) && (
          <section className="space-y-4 pt-8 border-t border-white/5">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <Info size={16} className="text-orange-500" /> Notes
            </h3>
            <div 
              className="text-xs text-slate-400 leading-relaxed font-medium"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(problem.notes || problem.note) }}
            />
          </section>
        )}

        {/* Topics / Tags */}
        {problem.tags && problem.tags.length > 0 && (
          <section className="space-y-4 pt-8 border-t border-white/5">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
              <Tag size={16} className="text-orange-500" /> Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {problem.tags.map((tag) => (
                <span key={tag} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
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
