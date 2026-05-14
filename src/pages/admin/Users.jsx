import { useState, useEffect } from "react";
import { getUsers } from "../../api/userApi";
import { useTheme } from "../../context/ThemeContext";

export default function Users() {
  const { isDark } = useTheme();

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [users, setUsers] = useState([]);

  // Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      console.log(
        "Fetched users:",
        res.data
      );
      setUsers(res.data);
    } catch (error) {
      console.log(
        "Error fetching users:",
        error
      );
    }
  };

  // USER DETAILS PAGE
  if (selectedUser) {
    return (
      <>
        <button
          onClick={() =>
            setSelectedUser(null)
          }
          className={`mb-6 border px-4 py-2 rounded-xl ${
            isDark
              ? "border-[#2d3348] text-slate-300 hover:bg-[#1a1d2b]"
              : ""
          }`}
        >
          ← Back
        </button>

        <h1
          className={`text-3xl font-bold mb-6 ${
            isDark
              ? "text-white"
              : ""
          }`}
        >
          {selectedUser.fullName ||
            selectedUser.name}
        </h1>

        {/* Basic Info */}
        <div
          className={`rounded-2xl p-6 border shadow-sm mb-6 ${
            isDark
              ? "bg-[#151823] border-[#1e293b]"
              : "bg-white"
          }`}
        >
          <h2
            className={`font-semibold mb-3 ${
              isDark
                ? "text-white"
                : ""
            }`}
          >
            Basic Info
          </h2>

          <p
            className={
              isDark
                ? "text-slate-300"
                : ""
            }
          >
            Email:{" "}
            {selectedUser.email}
          </p>

          <p
            className={
              isDark
                ? "text-slate-300"
                : ""
            }
          >
            Role:{" "}
            {selectedUser.role}
          </p>

          <p
            className={
              isDark
                ? "text-slate-300"
                : ""
            }
          >
            Joined:{" "}
            {new Date(
              selectedUser.createdAt
            ).toLocaleDateString()}
          </p>
        </div>

        {/* Contest History */}
        <Section
          title="Contest History"
          isDark={isDark}
        >
          {selectedUser.contests
            ?.length > 0 ? (
            selectedUser.contests.map(
              (c, i) => (
                <p
                  key={i}
                  className={
                    isDark
                      ? "text-slate-300"
                      : ""
                  }
                >
                  {c.name} — Rank #
                  {c.rank} —
                  Score {c.score}
                </p>
              )
            )
          ) : (
            <p>No contests yet</p>
          )}
        </Section>

        {/* OA Tests */}
        <Section
          title="OA Test History"
          isDark={isDark}
        >
          {selectedUser.oaTests
            ?.length > 0 ? (
            selectedUser.oaTests.map(
              (o, i) => (
                <p
                  key={i}
                  className={
                    isDark
                      ? "text-slate-300"
                      : ""
                  }
                >
                  {o.name} —
                  {o.score}% —
                  {o.result}
                </p>
              )
            )
          ) : (
            <p>No OA tests yet</p>
          )}
        </Section>

        {/* AI Interviews */}
        <Section
          title="AI Interviews"
          isDark={isDark}
        >
          {selectedUser.interviews
            ?.length > 0 ? (
            selectedUser.interviews.map(
              (iv, i) => (
                <p
                  key={i}
                  className={
                    isDark
                      ? "text-slate-300"
                      : ""
                  }
                >
                  {iv.role} —
                  {iv.score}% —
                  {iv.result}
                </p>
              )
            )
          ) : (
            <p>
              No interviews yet
            </p>
          )}
        </Section>
      </>
    );
  }

  // USER LIST PAGE
  return (
    <>
      <h1
        className={`text-3xl font-bold mb-8 ${
          isDark
            ? "text-white"
            : ""
        }`}
      >
        User Management
      </h1>

      <div
        className={`rounded-2xl border shadow-sm ${
          isDark
            ? "bg-[#151823] border-[#1e293b]"
            : "bg-white"
        }`}
      >
        {users.length === 0 && (
          <p className="p-6 text-slate-500">
            No users found...
          </p>
        )}

        {users.map((user) => (
          <div
            key={user._id}
            onClick={() =>
              setSelectedUser(user)
            }
            className={`p-5 border-b cursor-pointer ${
              isDark
                ? "border-[#1e293b] hover:bg-[#1a1d2b]"
                : "hover:bg-slate-50"
            }`}
          >
            <div className="flex justify-between">
              <div>
                <h2
                  className={`font-semibold ${
                    isDark
                      ? "text-white"
                      : ""
                  }`}
                >
                  {user.fullName ||
                    user.name}
                </h2>

                <p
                  className={
                    isDark
                      ? "text-slate-400"
                      : "text-slate-500"
                  }
                >
                  {user.email}
                </p>
              </div>

              <div className="text-right">
                <p
                  className={
                    isDark
                      ? "text-slate-300"
                      : ""
                  }
                >
                  {user.role}
                </p>

                <p
                  className="text-sm text-slate-500"
                >
                  {new Date(
                    user.createdAt
                  ).toLocaleDateString()}
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
    <div
      className={`rounded-2xl p-6 border shadow-sm mb-6 ${
        isDark
          ? "bg-[#151823] border-[#1e293b]"
          : "bg-white"
      }`}
    >
      <h2
        className={`font-semibold mb-3 ${
          isDark
            ? "text-white"
            : ""
        }`}
      >
        {title}
      </h2>

      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}