import { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { getAnalytics } from "../../api/analyticsApi";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Analytics() {
  const { isDark } = useTheme();

  const [data, setData] = useState(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getAnalytics();
    setData(res.data);
  };

  if (!data) return <p>Loading...</p>;

  const Card = ({ title, value }) => (
    <div className={`p-5 rounded-xl border ${isDark ? "bg-[#151823] text-white" : "bg-white"}`}>
      <h3 className="text-sm opacity-70">{title}</h3>
      <h1 className="text-2xl font-bold mt-2">{value}</h1>
    </div>
  );

  return (
    <div>
      <h1 className={`text-3xl font-bold mb-6 ${isDark ? "text-white" : ""}`}>
        Platform Analytics Dashboard
      </h1>

      {/* USERS */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Total Users" value={data.users.total} />
        <Card title="Weekly Users" value={data.users.weekly} />
        <Card title="DAU" value={data.activity.dau} />

        <Card title="Contests" value={data.contests.total} />
        <Card title="Problems" value={data.problems.total} />
        <Card title="OA Tests" value={data.oaTests.total} />
        <Card title="AI Interviews" value={data.aiInterviews.total} />

        <Card title="Logins" value={data.activity.logins} />
        <Card title="Visits" value={data.activity.visits} />
      </div>

      {/* SIMPLE GROWTH GRAPH (PLACEHOLDER) */}
      <div className={`mt-10 p-6 border rounded-xl ${isDark ? "bg-[#151823]" : "bg-white"}`}>
        <h2 className="text-xl font-semibold mb-4 text-white">
          Growth Overview
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={[
              { name: "Mon", users: 20 },
              { name: "Tue", users: 40 },
              { name: "Wed", users: 60 },
              { name: "Thu", users: 90 },
              { name: "Fri", users: 120 },
              { name: "Sat", users: 150 },
              { name: "Sun", users: 200 },
            ]}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="users" stroke="#f97316" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}