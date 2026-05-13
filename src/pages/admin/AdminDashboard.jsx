import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import {
  Users,
  Trophy,
  FileText,
  Brain,
  Plus,
} from "lucide-react";

export default function AdminDashboard() {
  const { isDark } = useTheme();

  const stats = [
    {
      title: "Total Users",
      value: "12,540",
      icon: <Users size={22} />,
    },
    {
      title: "Active Contests",
      value: "8",
      icon: <Trophy size={22} />,
    },
    {
      title: "OA Tests",
      value: "42",
      icon: <FileText size={22} />,
    },
    {
      title: "AI Interviews",
      value: "1,284",
      icon: <Brain size={22} />,
    },
  ];

  const activity = [
    "New user registered",
    'Contest "Weekend Challenge" created',
    "OA test submitted",
    "AI interview completed",
  ];

  return (
    <div className="space-y-8">

      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl border p-8 shadow-sm ${
          isDark
            ? 'bg-[#151823] border-[#1e293b]'
            : 'bg-white border-[#ECE7DF]'
        }`}
      >
        <p className="text-[#F59E0B] font-medium">
          Welcome back, Admin 👋
        </p>

        <h1 className={`text-5xl font-bold mt-3 leading-tight ${
          isDark ? 'text-white' : 'text-[#0D1B4C]'
        }`}>
          Ready to Manage
          <br />
          AlgoArmy?
        </h1>

        <p className={`mt-4 max-w-xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Manage contests, users, OA tests,
          and AI interview analysis from
          one place.
        </p>

        <div className="flex gap-4 mt-8">
          <button className={`px-6 py-3 rounded-2xl flex items-center gap-2 ${
            isDark
              ? 'bg-orange-500 text-white'
              : 'bg-[#0D1B4C] text-white'
          }`}>
            <Plus size={18} />
            Create Contest
          </button>

          <button className={`px-6 py-3 rounded-2xl ${
            isDark
              ? 'bg-orange-500/10 text-orange-400'
              : 'bg-[#FFF4E5] text-[#F59E0B]'
          }`}>
            Add OA Test
          </button>
        </div>
      </motion.div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.1,
            }}
            whileHover={{
              y: -4,
            }}
            className={`rounded-2xl border p-6 shadow-sm ${
              isDark
                ? 'bg-[#151823] border-[#1e293b]'
                : 'bg-white border-[#ECE7DF]'
            }`}
          >
            <div className="text-[#F59E0B] mb-4">
              {item.icon}
            </div>

            <h2 className={`text-3xl font-bold ${
              isDark ? 'text-white' : 'text-[#0D1B4C]'
            }`}>
              {item.value}
            </h2>

            <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {item.title}
            </p>
          </motion.div>
        ))}
      </div>

      {/* LOWER GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Recent Activity */}
        <div className={`rounded-2xl border p-6 shadow-sm ${
          isDark
            ? 'bg-[#151823] border-[#1e293b]'
            : 'bg-white border-[#ECE7DF]'
        }`}>
          <h2 className={`text-xl font-semibold mb-5 ${isDark ? 'text-white' : ''}`}>
            Recent Activity
          </h2>

          <div className="space-y-4">
            {activity.map((item) => (
              <div
                key={item}
                className={`p-4 rounded-xl ${
                  isDark ? 'bg-[#1a1d2b] text-slate-300' : 'bg-[#FAF8F3]'
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div className={`rounded-2xl border p-6 shadow-sm ${
          isDark
            ? 'bg-[#151823] border-[#1e293b]'
            : 'bg-white border-[#ECE7DF]'
        }`}>
          <h2 className={`text-xl font-semibold mb-5 ${isDark ? 'text-white' : ''}`}>
            Quick Insights
          </h2>

          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${
              isDark ? 'bg-[#1a1d2b] text-slate-300' : 'bg-[#FAF8F3]'
            }`}>
              Problems Uploaded: 530
            </div>

            <div className={`p-4 rounded-xl ${
              isDark ? 'bg-[#1a1d2b] text-slate-300' : 'bg-[#FAF8F3]'
            }`}>
              Interviews Reviewed: 124
            </div>

            <div className={`p-4 rounded-xl ${
              isDark ? 'bg-[#1a1d2b] text-slate-300' : 'bg-[#FAF8F3]'
            }`}>
              Contest Participants: 2.4K
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}