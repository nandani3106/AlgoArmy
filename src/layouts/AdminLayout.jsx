import { NavLink, Outlet } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard,
  Users,
  Trophy,
  FileText,
  Brain,
  Code2,
  BarChart3,
  Settings,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

export default function AdminLayout() {
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard size={18} />,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <Users size={18} />,
    },
    {
      name: "Contests",
      path: "/admin/contests",
      icon: <Trophy size={18} />,
    },
    {
      name: "OA Tests",
      path: "/admin/oa-tests",
      icon: <FileText size={18} />,
    },
    {
      name: "AI Interviews",
      path: "/admin/interviews",
      icon: <Brain size={18} />,
    },
    {
      name: "DSA Problems",
      path: "/admin/problems",
      icon: <Code2 size={18} />,
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: <BarChart3 size={18} />,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <Settings size={18} />,
    },
  ];

  return (
    <div className={`flex min-h-screen ${isDark ? 'bg-[#0a0a0f]' : 'bg-[#F8F4EC]'}`}>
      {/* SIDEBAR */}
      <aside className={`w-72 border-r p-6 flex flex-col fixed left-0 top-0 h-screen z-40 ${
        isDark 
          ? 'bg-[#0f1117] border-[#1e293b]' 
          : 'bg-white border-[#ECE7DF]'
      }`}>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span className="text-white font-black text-xl">AA</span>
          </div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-[#0D1B4C]'}`}>
            AlgoArmy
          </h1>
        </div>

        {/* Nav */}
        <nav className="space-y-3 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-4 rounded-2xl font-medium transition-all ${
                  isActive
                    ? isDark
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "bg-[#0D1B4C] text-white shadow-md"
                    : isDark
                      ? "text-slate-400 hover:bg-[#1a1d2b] hover:text-white"
                      : "text-slate-600 hover:bg-[#FFF4E5] hover:text-[#0D1B4C]"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Dark Mode Toggle */}
        <div className="mt-auto space-y-3">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-medium text-sm group ${
              isDark
                ? 'text-slate-400 hover:bg-[#1a1d2b]'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            <div className={`w-12 h-7 rounded-full flex items-center px-1 transition-all duration-300 ${isDark ? 'bg-orange-500' : 'bg-slate-200'}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 ${isDark ? 'translate-x-5' : 'translate-x-0'}`}>
                {isDark ? <Moon size={12} className="text-orange-500" /> : <Sun size={12} className="text-amber-500" />}
              </div>
            </div>
          </button>

          {/* Bottom Admin Card */}
          <div className={`rounded-2xl border p-4 ${
            isDark 
              ? 'bg-[#1a1d2b] border-[#2d3348]' 
              : 'bg-[#FFF8EE] border-[#ECE7DF]'
          }`}>
            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Admin
            </p>

            <h3 className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-[#0D1B4C]'}`}>
              AlgoArmy Team
            </h3>

            <button 
              onClick={() => window.location.href = '/login'}
              className="mt-4 w-full bg-[#F59E0B] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 p-8 overflow-y-auto ml-72 ${isDark ? 'text-slate-200' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}