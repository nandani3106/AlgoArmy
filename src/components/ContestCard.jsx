import React from 'react';

import { Calendar, Clock, Users, Trophy, ChevronRight } from 'lucide-react';
import GradientButton from './GradientButton';

const ContestCard = ({ contest, onDetails, onRegister }) => {
  const { name, difficulty, date, time, duration, participants, status, prize } = contest;

  const statusColors = {
    Upcoming: 'bg-blue-50 text-blue-600 border-blue-100',
    Live: 'bg-green-50 text-green-600 border-green-100 animate-pulse',
    Completed: 'bg-slate-100 text-slate-500 border-slate-200',
  };

  const difficultyColors = {
    Easy: 'bg-green-50 text-green-600',
    Medium: 'bg-orange-50 text-orange-600',
    Hard: 'bg-red-50 text-red-600',
    Extreme: 'bg-[#0B1B3B] text-white',
  };

  return (
    <div 
      className="bg-white rounded-[2rem] p-6 shadow-xl shadow-orange-900/5 border border-orange-100/50 flex flex-col h-full hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[status]}`}>
            {status}
          </span>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${difficultyColors[difficulty]}`}>
            {difficulty}
          </span>
        </div>
        {prize && (
          <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs bg-amber-50 px-3 py-1 rounded-full">
            <Trophy size={14} /> {prize}
          </div>
        )}
      </div>

      <h3 className="text-xl font-black text-[#0B1B3B] mb-4 leading-tight group-hover:text-orange-600 transition-colors">
        {name}
      </h3>

      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
            <Calendar size={16} />
          </div>
          {date}
        </div>
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
            <Clock size={16} />
          </div>
          {time} • {duration}
        </div>
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
            <Users size={16} />
          </div>
          {participants} Participants
        </div>
      </div>

      <div className="mt-auto">
        <button 
          onClick={onDetails}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-50 border border-slate-100 text-[#0B1B3B] text-xs font-black uppercase tracking-widest hover:bg-[#0B1B3B] hover:text-white transition-all group"
        >
          View Contest Details
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default ContestCard;
