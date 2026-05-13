import { useState } from "react";

export default function Users() {
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
          className="mb-6 border px-4 py-2 rounded-xl"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold mb-6">
          {selectedUser.name}
        </h1>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 border shadow-sm mb-6">
          <h2 className="font-semibold mb-3">
            Basic Info
          </h2>

          <p>Email: {selectedUser.email}</p>
          <p>Status: {selectedUser.status}</p>
          <p>
            Last Login:{" "}
            {selectedUser.lastLogin}
          </p>
        </div>

        {/* Contest History */}
        <Section title="Contest History">
          {selectedUser.contests.map(
            (c, i) => (
              <p key={i}>
                {c.name} — Rank #{c.rank} —
                Score {c.score}
              </p>
            )
          )}
        </Section>

        {/* OA Tests */}
        <Section title="OA Test History">
          {selectedUser.oaTests.map(
            (o, i) => (
              <p key={i}>
                {o.name} — {o.score}% —
                {o.result} — Flags:{" "}
                {o.flags}
              </p>
            )
          )}
        </Section>

        {/* Interviews */}
        <Section title="AI Interviews">
          {selectedUser.interviews.map(
            (iv, i) => (
              <p key={i}>
                {iv.role} — {iv.score}% —
                {iv.result}
              </p>
            )
          )}
        </Section>

        {/* Login Activity */}
        <Section title="Login Activity">
          {selectedUser.logins.map(
            (log, i) => (
              <p key={i}>
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

          <button className="border px-4 py-2 rounded-xl">
            Delete User
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">
        User Management
      </h1>

      <div className="bg-white rounded-2xl border shadow-sm">
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() =>
              setSelectedUser(user)
            }
            className="p-5 border-b cursor-pointer hover:bg-slate-50"
          >
            <div className="flex justify-between">
              <div>
                <h2 className="font-semibold">
                  {user.name}
                </h2>

                <p className="text-slate-500">
                  {user.email}
                </p>
              </div>

              <div className="text-right">
                <p>{user.status}</p>
                <p className="text-sm text-slate-500">
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
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border shadow-sm mb-6">
      <h2 className="font-semibold mb-3">
        {title}
      </h2>

      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}