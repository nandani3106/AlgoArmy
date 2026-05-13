import React from 'react';
import { motion } from 'framer-motion';

const DashboardCard = ({ children, className = '', title, subtitle, icon: Icon, action }) => {
  return (
    <div 
      className={`bg-white rounded-[2rem] p-6 shadow-xl shadow-orange-900/5 border border-orange-100/50 ${className}`}
    >
      {(title || Icon || action) && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Icon size={20} />
              </div>
            )}
            <div>
              {title && <h3 className="text-lg font-bold text-[#0B1B3B]">{title}</h3>}
              {subtitle && <p className="text-slate-500 text-xs font-medium">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default DashboardCard;
