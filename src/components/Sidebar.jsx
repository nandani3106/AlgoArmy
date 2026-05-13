import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Sidebar = () => {
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Contests', path: '/contests' },
    { label: 'Assessments', path: '/oa' },
    { label: 'Interviews', path: '/interviews' },
    { label: 'Results', path: '/results' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Profile', path: '/profile' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-white border-r border-orange-100/50 flex flex-col z-40">
      {/* Logo Section */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
          <span className="text-white font-black text-xl">AA</span>
        </div>
        <span className="text-2xl font-black text-[#0B1B3B] tracking-tighter">AlgoArmy</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Main Menu</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group
              ${isActive 
                ? 'bg-[#0B1B3B] text-white shadow-lg shadow-navy-900/20' 
                : 'text-slate-500 hover:bg-orange-50 hover:text-orange-600'}
            `}
          >
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm">{item.label}</span>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 mt-auto space-y-2">
        <button
          onClick={() => window.location.href = '/login'}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-orange-600 hover:bg-orange-50 transition-all font-bold text-sm"
        >
          <span>Logout</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-50 transition-all font-bold text-sm group"
        >
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          <div className={`w-12 h-7 rounded-full flex items-center px-1 transition-all duration-300 ${isDark ? 'bg-orange-500' : 'bg-slate-200'}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 ${isDark ? 'translate-x-5' : 'translate-x-0'}`}>
              {isDark ? <Moon size={12} className="text-orange-500" /> : <Sun size={12} className="text-amber-500" />}
            </div>
          </div>
        </button>
      </div>

      {/* Profile Summary */}
      <div className="p-6 border-t border-orange-50">
        <div 
          onClick={() => window.location.href = '/profile'}
          className="bg-orange-50 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:bg-orange-100/50 transition-all"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm">
            <img src="https://ui-avatars.com/api/?name=Nandani&background=0B1B3B&color=fff" alt="User" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black text-[#0B1B3B]">Nandani 👋</p>
            <p className="text-[10px] text-orange-600 font-bold uppercase tracking-tighter">Level 24 Candidate</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
