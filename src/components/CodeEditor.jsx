import React from 'react';

const CodeEditor = ({ code, onChange, language }) => {
  return (
    <div className="relative h-full bg-[#050d1d] flex flex-col">
      {/* Editor Header */}
      <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Main.{language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'cpp'}</span>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative flex">
        {/* Line Numbers */}
        <div className="w-12 bg-[#081225] border-r border-white/5 py-6 flex flex-col items-center text-slate-700 font-mono text-xs select-none">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="h-6 flex items-center">{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="flex-1 bg-transparent text-slate-300 font-mono text-sm p-6 focus:outline-none resize-none custom-scrollbar leading-6"
          placeholder="// Start coding your solution here..."
        />
      </div>

      {/* Footer Info */}
      <div className="px-6 py-2 bg-[#0B1B3B]/50 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-slate-500">
        <div className="flex gap-4 uppercase tracking-widest">
          <span>UTF-8</span>
          <span>Tab Size: 4</span>
        </div>
        <div className="uppercase tracking-widest">
          Ln {code.split('\n').length}, Col {code.split('\n').pop().length + 1}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
