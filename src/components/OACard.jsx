import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Calendar, ChevronRight } from 'lucide-react';
import GradientButton from './GradientButton';

const OACard = ({ oa }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-orange-900/5 border border-orange-100/50 flex flex-col h-full hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center">
          <img src={oa.logo} alt={oa.company} className="w-full h-full object-contain" />
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
          oa.status === 'Available' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-100 text-slate-500 border-slate-200'
        }`}>
          {oa.status}
        </span>
      </div>

      <div className="mb-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1">{oa.company}</p>
        <h3 className="text-xl font-black text-[#0B1B3B] leading-tight mb-4">{oa.title}</h3>
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <Calendar size={16} className="text-slate-400" />
          <span>Deadline: {oa.deadline}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <Clock size={16} className="text-slate-400" />
          <span>{oa.duration}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <BookOpen size={16} className="text-slate-400" />
          <span>{oa.questions} Questions</span>
        </div>
      </div>

      <div className="mt-auto">
        <button 
          onClick={() => navigate(`/oa/${oa.id}`)}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-50 border border-slate-100 text-[#0B1B3B] text-xs font-black uppercase tracking-widest hover:bg-[#0B1B3B] hover:text-white transition-all group"
        >
          View Details
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default OACard;
