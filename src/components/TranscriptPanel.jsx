import React from 'react';
import { MessageSquare, User, Bot, CornerDownRight } from 'lucide-react';

const TranscriptPanel = ({ transcript = [] }) => {
  return (
    <div className="h-full bg-white rounded-[2.5rem] border border-orange-100/50 flex flex-col overflow-hidden shadow-xl shadow-orange-900/5">
      <div className="p-6 border-b border-orange-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare size={18} className="text-orange-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#0B1B3B]">Live Transcript</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      </div>

      <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar bg-slate-50/30">
        {transcript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
            <MessageSquare size={48} strokeWidth={1} />
            <p className="text-xs font-bold uppercase tracking-widest">Awaiting Audio Input...</p>
          </div>
        ) : (
          transcript.map((item, idx) => (
            <div key={idx} className={`space-y-2 animate-in fade-in slide-in-from-top-2 duration-300`}>
              <div className="flex items-center gap-2">
                {item.role === 'AI' ? (
                  <Bot size={14} className="text-orange-500" />
                ) : (
                  <User size={14} className="text-blue-500" />
                )}
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  item.role === 'AI' ? 'text-orange-600' : 'text-blue-600'
                }`}>
                  {item.role === 'AI' ? 'AlgoAI' : 'Candidate'}
                </span>
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed font-medium ${
                item.role === 'AI' 
                  ? 'bg-orange-50/50 border border-orange-100/50 text-[#0B1B3B]' 
                  : 'bg-white border border-slate-100 text-slate-600'
              }`}>
                {item.text}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Suggested Improvements Sidebar */}
      <div className="p-6 bg-[#0B1B3B] text-white">
        <div className="flex items-center gap-2 mb-4">
          <CornerDownRight size={14} className="text-orange-400" />
          <span className="text-[10px] font-black uppercase tracking-widest">AI Feedback Loop</span>
        </div>
        <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
          "Try to emphasize your role in the Traveloop project specifically regarding state management."
        </p>
      </div>
    </div>
  );
};

export default TranscriptPanel;
