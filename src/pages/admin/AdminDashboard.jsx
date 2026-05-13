import { motion } from "framer-motion";
import {
  Users,
  Trophy,
  FileText,
  Brain,
  Plus,
} from "lucide-react";

export default function AdminDashboard() {
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
        className="bg-white rounded-3xl border border-[#ECE7DF] p-8 shadow-sm"
      >
        <p className="text-[#F59E0B] font-medium">
          Welcome back, Admin 👋
        </p>

        <h1 className="text-5xl font-bold text-[#0D1B4C] mt-3 leading-tight">
          Ready to Manage
          <br />
          AlgoArmy?
        </h1>

        <p className="text-slate-500 mt-4 max-w-xl">
          Manage contests, users, OA tests,
          and AI interview analysis from
          one place.
        </p>

        <div className="flex gap-4 mt-8">
          <button className="bg-[#0D1B4C] text-white px-6 py-3 rounded-2xl flex items-center gap-2">
            <Plus size={18} />
            Create Contest
          </button>

          <button className="bg-[#FFF4E5] text-[#F59E0B] px-6 py-3 rounded-2xl">
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
            className="bg-white rounded-2xl border border-[#ECE7DF] p-6 shadow-sm"
          >
            <div className="text-[#F59E0B] mb-4">
              {item.icon}
            </div>

            <h2 className="text-3xl font-bold text-[#0D1B4C]">
              {item.value}
            </h2>

            <p className="text-slate-500 mt-1">
              {item.title}
            </p>
          </motion.div>
        ))}
      </div>

      {/* LOWER GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-[#ECE7DF] p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-5">
            Recent Activity
          </h2>

          <div className="space-y-4">
            {activity.map((item) => (
              <div
                key={item}
                className="p-4 bg-[#FAF8F3] rounded-xl"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="bg-white rounded-2xl border border-[#ECE7DF] p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-5">
            Quick Insights
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-[#FAF8F3] rounded-xl">
              Problems Uploaded: 530
            </div>

            <div className="p-4 bg-[#FAF8F3] rounded-xl">
              Interviews Reviewed: 124
            </div>

            <div className="p-4 bg-[#FAF8F3] rounded-xl">
              Contest Participants: 2.4K
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}