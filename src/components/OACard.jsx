import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Calendar, ChevronRight, AlertCircle, PlayCircle } from 'lucide-react';

const OACard = ({ oa }) => {
  const navigate = useNavigate();

  const now = new Date();
  const start = new Date(oa.startDate);
  const end = new Date(oa.endDate);

  let status = "Upcoming";
  let statusColor = "bg-amber-50 text-amber-600 border-amber-100";
  let isLive = false;

  if (now >= start && now <= end) {
    status = "Live";
    statusColor = "bg-green-50 text-green-600 border-green-100";
    isLive = true;
  } else if (now > end) {
    status = "Ended";
    statusColor = "bg-red-50 text-red-600 border-red-100";
  }

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-orange-900/5 border border-orange-100/50 flex flex-col h-full hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center">
          <div className="w-full h-full bg-orange-500 rounded-lg flex items-center justify-center text-white font-black text-xs">
            {oa.company?.substring(0, 2).toUpperCase()}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColor}`}>
            {status}
          </span>
          {isLive && (
             <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Active</span>
             </div>
          )}
        </div>
      </div>

      <div className="mb-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1">{oa.company}</p>
        <h3 className="text-xl font-black text-[#0B1B3B] leading-tight mb-4">{oa.title}</h3>
      </div>

      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <Calendar size={16} className="text-slate-400" />
          <span>Starts: {formatDateTime(oa.startDate)}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <Clock size={16} className="text-slate-400" />
          <span>Ends: {formatDateTime(oa.endDate)}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
          <BookOpen size={16} className="text-slate-400" />
          <span>{oa.durationMinutes} Minutes</span>
        </div>
      </div>

      <div className="mt-auto">
        <button 
          onClick={() => navigate(`/oa/${oa.id}`)}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all group ${
            isLive 
            ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20 hover:bg-orange-700' 
            : 'bg-slate-50 border border-slate-100 text-[#0B1B3B] hover:bg-[#0B1B3B] hover:text-white'
          }`}
        >
          {status === "Upcoming" ? "View Details" : status === "Live" ? "Start Now" : "View Results"}
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default OACard;
