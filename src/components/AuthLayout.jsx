import React from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children }) => {
  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-stone-50 via-orange-50 to-amber-50 flex items-center justify-center overflow-hidden px-4">
      {/* Soft Glow Circles */}
      <motion.div 
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-orange-200 rounded-full blur-[120px]"
      />
      <motion.div 
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-40 -right-20 w-[600px] h-[600px] bg-amber-200 rounded-full blur-[120px]"
      />

      {/* Grainy Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none"></div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[440px]">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
