import React from 'react';
import { motion } from 'framer-motion';

import BrandLogo from './BrandLogo';

const AuthCard = ({ title, subtitle, children }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 w-full shadow-2xl shadow-orange-900/5 border border-orange-100/50"
    >
      <div className="flex flex-col items-center mb-6">
        {/* Logo & Branding */}
        <BrandLogo size="lg" showText={true} />
        <p className="text-slate-500 text-[9px] font-bold tracking-[0.3em] uppercase mt-3 mb-6">
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
