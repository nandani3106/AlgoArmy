import { NavLink, Outlet } from "react-router-dom";
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
} from "lucide-react";

export default function AdminLayout() {
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
    <div className="flex min-h-screen bg-[#F8F4EC]">
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-[#ECE7DF] p-6 flex flex-col">
        {/* Logo */}
        <h1 className="text-3xl font-bold text-[#0D1B4C] mb-10">
          AlgoArmy
        </h1>

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
                    ? "bg-[#0D1B4C] text-white shadow-md"
                    : "text-slate-600 hover:bg-[#FFF4E5] hover:text-[#0D1B4C]"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Admin Card */}
        <div className="mt-8 bg-[#FFF8EE] rounded-2xl border border-[#ECE7DF] p-4">
          <p className="text-sm text-slate-500">
            Admin
          </p>

          <h3 className="font-semibold text-[#0D1B4C] mt-1">
            AlgoArmy Team
          </h3>

          <button className="mt-4 w-full bg-[#F59E0B] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}