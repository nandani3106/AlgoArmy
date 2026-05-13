import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

export default function Users() {
  const { isDark } = useTheme();
  const [selectedUser, setSelectedUser] =
    useState(null);

  const users = [
    {
      id: 1,
      name: "Tanu Raj",
      email: "tanu@gmail.com",
      status: "Active",
      lastLogin: "Today 10:30 AM",
      contests: [
        {
          name: "Weekly Contest 1",
          rank: 12,
          score: 380,
        },
      ],
      oaTests: [
        {
          name: "Amazon OA",
          score: 78,
          result: "Passed",
          flags: 0,
        },
      ],
      interviews: [
        {
          role: "Frontend Developer",
          score: 84,
          result: "Selected",
          summary:
            "Good technical answers.",
        },
      ],
      logins: [
        {
          login: "10:30 AM",
          logout: "11:45 AM",
        },
        {
          login: "Yesterday 7 PM",
          logout: "8 PM",
        },
      ],
    },

    {
      id: 2,
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      status: "Blocked",
      lastLogin: "Yesterday",
      contests: [],
      oaTests: [],
      interviews: [],
      logins: [],
    },
  ];

  if (selectedUser) {
    return (
      <>
        <button
          onClick={() =>
            setSelectedUser(null)
          }
          className={`mb-6 border px-4 py-2 rounded-xl ${
            isDark
              ? 'border-[#2d3348] text-slate-300 hover:bg-[#1a1d2b]'
              : ''
          }`}
        >
          ← Back
        </button>

        <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : ''}`}>
          {selectedUser.name}
        </h1>

        {/* Basic Info */}
        <div className={`rounded-2xl p-6 border shadow-sm mb-6 ${
          isDark
            ? 'bg-[#151823] border-[#1e293b]'
            : 'bg-white'
        }`}>
          <h2 className={`font-semibold mb-3 ${isDark ? 'text-white' : ''}`}>
            Basic Info
          </h2>

          <p className={isDark ? 'text-slate-300' : ''}>Email: {selectedUser.email}</p>
          <p className={isDark ? 'text-slate-300' : ''}>Status: {selectedUser.status}</p>
          <p className={isDark ? 'text-slate-300' : ''}>
            Last Login:{" "}
            {selectedUser.lastLogin}
          </p>
        </div>

        {/* Contest History */}
        <Section title="Contest History" isDark={isDark}>
          {selectedUser.contests.map(
            (c, i) => (
              <p key={i} className={isDark ? 'text-slate-300' : ''}>
                {c.name} — Rank #{c.rank} —
                Score {c.score}
              </p>
            )
          )}
        </Section>

        {/* OA Tests */}
        <Section title="OA Test History" isDark={isDark}>
          {selectedUser.oaTests.map(
            (o, i) => (
              <p key={i} className={isDark ? 'text-slate-300' : ''}>
                {o.name} — {o.score}% —
                {o.result} — Flags:{" "}
                {o.flags}
              </p>
            )
          )}
        </Section>

        {/* Interviews */}
        <Section title="AI Interviews" isDark={isDark}>
          {selectedUser.interviews.map(
            (iv, i) => (
              <p key={i} className={isDark ? 'text-slate-300' : ''}>
                {iv.role} — {iv.score}% —
                {iv.result}
              </p>
            )
          )}
        </Section>

        {/* Login Activity */}
        <Section title="Login Activity" isDark={isDark}>
          {selectedUser.logins.map(
            (log, i) => (
              <p key={i} className={isDark ? 'text-slate-300' : ''}>
                Login: {log.login} |
                Logout: {log.logout}
              </p>
            )
          )}
        </Section>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button className="bg-red-500 text-white px-4 py-2 rounded-xl">
            Block User
          </button>

          <button className={`border px-4 py-2 rounded-xl ${
            isDark
              ? 'border-[#2d3348] text-slate-300 hover:bg-[#1a1d2b]'
              : ''
          }`}>
            Delete User
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : ''}`}>
        User Management
      </h1>

      <div className={`rounded-2xl border shadow-sm ${
        isDark
          ? 'bg-[#151823] border-[#1e293b]'
          : 'bg-white'
      }`}>
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() =>
              setSelectedUser(user)
            }
            className={`p-5 border-b cursor-pointer ${
              isDark
                ? 'border-[#1e293b] hover:bg-[#1a1d2b]'
                : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex justify-between">
              <div>
                <h2 className={`font-semibold ${isDark ? 'text-white' : ''}`}>
                  {user.name}
                </h2>

                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  {user.email}
                </p>
              </div>

              <div className="text-right">
                <p className={isDark ? 'text-slate-300' : ''}>{user.status}</p>
                <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                  {user.lastLogin}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Section({
  title,
  children,
  isDark,
}) {
  return (
    <div className={`rounded-2xl p-6 border shadow-sm mb-6 ${
      isDark
        ? 'bg-[#151823] border-[#1e293b]'
        : 'bg-white'
    }`}>
      <h2 className={`font-semibold mb-3 ${isDark ? 'text-white' : ''}`}>
        {title}
      </h2>

      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}