import React from 'react';

const ScoreCard = ({ title, value, subtitle, icon: Icon, color = "orange" }) => {
  const colors = {
    orange: "text-orange-600 bg-orange-50 border-orange-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    green: "text-green-600 bg-green-50 border-green-100",
    navy: "text-white bg-[#0B1B3B] border-navy-900"
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-orange-900/5 border border-orange-100/50 flex flex-col items-center text-center group hover:border-orange-500/30 transition-all">
      {Icon && (
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${colors[color]}`}>
          <Icon size={32} />
        </div>
      )}
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{title}</h4>
      <p className="text-4xl font-black text-[#0B1B3B] mb-2">{value}</p>
      {subtitle && <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{subtitle}</p>}
    </div>
  );
};

export default ScoreCard;
