import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, ChevronRight, Video, Target } from 'lucide-react';

const InterviewCard = ({ interview }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-orange-900/5 border border-orange-100/50 flex flex-col h-full hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
            <Video size={20} />
          </div>
          <div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              interview.type === 'Scheduled' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'
            }`}>
              {interview.type}
            </span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          interview.status === 'Upcoming' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-100 text-slate-500 border-slate-200'
        }`}>
          {interview.status}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1">{interview.company}</p>
        <h3 className="text-xl font-black text-[#0B1B3B] leading-tight mb-2">{interview.role}</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {interview.skills.slice(0, 3).map((skill, idx) => (
          <span key={idx} className="px-3 py-1 rounded-lg bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-tighter border border-slate-100">
            {skill}
          </span>
        ))}
        {interview.skills.length > 3 && (
          <span className="px-3 py-1 rounded-lg bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
            +{interview.skills.length - 3} More
          </span>
        )}
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <Calendar size={16} className="text-slate-400" />
          <span>{interview.date}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <Clock size={16} className="text-slate-400" />
          <span>{interview.time} • {interview.duration}</span>
        </div>
      </div>

      <div className="mt-auto">
        <button 
          onClick={() => navigate(`/interviews/${interview.id}/resume`)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-50 border border-slate-100 text-[#0B1B3B] text-xs font-black uppercase tracking-widest hover:bg-[#0B1B3B] hover:text-white transition-all group"
        >
          {interview.status === 'Upcoming' ? 'Start Interview' : 'Practice Now'}
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default InterviewCard;
