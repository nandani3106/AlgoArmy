import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { getDashboard } from "../../api/dashboardApi";

import {
  Users,
  Trophy,
  FileText,
  Brain,
  Plus,
} from "lucide-react";

export default function AdminDashboard() {
  const { isDark } = useTheme();

  const [stats, setStats] =
    useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard =
    async () => {
      try {
        const res =
          await getDashboard();

        setStats(
          res.data
        );
      } catch (err) {
        console.log(
          err
        );
      }
    };

  if (!stats) {
    return (
      <p
        className={`${
          isDark
            ? "text-white"
            : ""
        }`}
      >
        Loading dashboard...
      </p>
    );
  }

  const cards = [
    {
      title:
        "Total Users",
      value:
        stats.users,
      icon: (
        <Users
          size={22}
        />
      ),
    },
    {
      title:
        "Contests",
      value:
        stats.contests,
      icon: (
        <Trophy
          size={22}
        />
      ),
    },
    {
      title:
        "OA Tests",
      value:
        stats.oaTests,
      icon: (
        <FileText
          size={22}
        />
      ),
    },
    {
      title:
        "AI Interviews",
      value:
        stats.aiInterviews,
      icon: (
        <Brain
          size={22}
        />
      ),
    },
  ];

  return (
    <div className="space-y-8">

      {/* HERO */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className={`rounded-3xl border p-8 shadow-sm ${
          isDark
            ? "bg-[#151823] border-[#1e293b]"
            : "bg-white border-[#ECE7DF]"
        }`}
      >
        <p className="text-[#F59E0B] font-medium">
          Welcome back,
          Admin 👋
        </p>

        <h1
          className={`text-5xl font-bold mt-3 ${
            isDark
              ? "text-white"
              : "text-[#0D1B4C]"
          }`}
        >
          Ready to
          Manage
          <br />
          AlgoArmy?
        </h1>

        <p
          className={`mt-4 ${
            isDark
              ? "text-slate-400"
              : "text-slate-500"
          }`}
        >
          Manage
          contests,
          users,
          OA tests,
          and AI
          interviews.
        </p>

        <div className="flex gap-4 mt-8">
          <button className="px-6 py-3 rounded-2xl bg-orange-500 text-white flex items-center gap-2">
            <Plus
              size={
                18
              }
            />
            Create
            Contest
          </button>
        </div>
      </motion.div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-6">
        {cards.map(
          (
            item,
            index
          ) => (
            <motion.div
              key={
                item.title
              }
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay:
                  index *
                  0.1,
              }}
              className={`rounded-2xl border p-6 shadow-sm ${
                isDark
                  ? "bg-[#151823] border-[#1e293b]"
                  : "bg-white border-[#ECE7DF]"
              }`}
            >
              <div className="text-[#F59E0B] mb-4">
                {
                  item.icon
                }
              </div>

              <h2
                className={`text-3xl font-bold ${
                  isDark
                    ? "text-white"
                    : "text-[#0D1B4C]"
                }`}
              >
                {
                  item.value
                }
              </h2>

              <p
                className={`mt-1 ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                {
                  item.title
                }
              </p>
            </motion.div>
          )
        )}
      </div>

      {/* LOWER GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* RECENT ACTIVITY */}
        <div
          className={`rounded-2xl border p-6 shadow-sm ${
            isDark
              ? "bg-[#151823] border-[#1e293b]"
              : "bg-white border-[#ECE7DF]"
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-5 ${
              isDark
                ? "text-white"
                : ""
            }`}
          >
            Recent
            Activity
          </h2>

          <div className="space-y-4">
            {stats.recentActivity.map(
              (
                item,
                i
              ) => (
                <div
                  key={
                    i
                  }
                  className={`p-4 rounded-xl ${
                    isDark
                      ? "bg-[#1a1d2b] text-slate-300"
                      : "bg-[#FAF8F3]"
                  }`}
                >
                  {
                    item
                  }
                </div>
              )
            )}
          </div>
        </div>

        {/* QUICK INSIGHTS */}
        <div
          className={`rounded-2xl border p-6 shadow-sm ${
            isDark
              ? "bg-[#151823] border-[#1e293b]"
              : "bg-white border-[#ECE7DF]"
          }`}
        >
          <h2
            className={`text-xl font-semibold mb-5 ${
              isDark
                ? "text-white"
                : ""
            }`}
          >
            Quick
            Insights
          </h2>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#1a1d2b] text-slate-300">
              Problems
              Uploaded:
              {
                stats.problems
              }
            </div>

            <div className="p-4 rounded-xl bg-[#1a1d2b] text-slate-300">
              Interviews
              Reviewed:
              {
                stats.aiInterviews
              }
            </div>

            <div className="p-4 rounded-xl bg-[#1a1d2b] text-slate-300">
              Active
              Contests:
              {
                stats.contests
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}