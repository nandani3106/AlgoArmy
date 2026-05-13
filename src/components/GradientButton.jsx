import React from 'react';
import { motion } from 'framer-motion';

const GradientButton = ({ 
  children, 
  onClick, 
  type = 'button', 
  className = '', 
  variant = 'primary',
  disabled = false,
}) => {
  const baseStyles = "w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-3 shadow-md";
  
  const variants = {
    primary: "bg-[#0B1B3B] text-white hover:bg-[#050d1d] hover:shadow-xl hover:shadow-navy-900/10 hover:-translate-y-0.5 active:scale-[0.98]",
    outline: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 active:scale-[0.98]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

export default GradientButton;
