import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ icon: Icon, value, label, trend }) => {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl p-5 shadow-lg shadow-orange-900/5 border border-orange-100/50 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <div>
        <h4 className="text-2xl font-black text-[#0B1B3B]">{value}</h4>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</p>
        {trend && (
          <span className={`text-[10px] font-bold ${trend.startsWith('+') ? 'text-green-500' : 'text-orange-500'}`}>
            {trend} from last month
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
