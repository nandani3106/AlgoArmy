import React from 'react';
import { motion } from 'framer-motion';

const AuthCard = ({ title, subtitle, children }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 w-full shadow-2xl shadow-orange-900/5 border border-orange-100/50"
    >
      <div className="flex flex-col items-center mb-6">
        {/* Logo */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-3 shadow-lg shadow-orange-500/20">
          <span className="text-xl font-black text-white tracking-tighter">AA</span>
        </div>
        
        {/* Branding */}
        <h1 className="text-2xl font-black text-[#0B1B3B] mb-0.5 tracking-tight">AlgoArmy</h1>
        <p className="text-slate-500 text-[9px] font-bold tracking-[0.3em] uppercase mb-6">
          Code. Compete. Conquer.
        </p>

        {/* Header Text */}
        <div className="text-center w-full">
          <h2 className="text-xl font-extrabold text-[#0B1B3B] mb-1">{title}</h2>
          <p className="text-slate-500 text-xs font-medium">{subtitle}</p>
        </div>
      </div>

      {children}
    </motion.div>
  );
};

export default AuthCard;
