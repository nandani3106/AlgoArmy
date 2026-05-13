import { useTheme } from "../../context/ThemeContext";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar,
  } from "recharts";
  
  export default function Analytics() {
    const { isDark } = useTheme();
    const userGrowth = [
      { month: "Jan", users: 120 }, { month: "Feb", users: 200 },
      { month: "Mar", users: 340 }, { month: "Apr", users: 500 },
      { month: "May", users: 780 },
    ];
    const platformStats = [
      { name: "Contests", value: 85 }, { name: "OA Tests", value: 72 },
      { name: "Interviews", value: 64 },
    ];
    const ax = isDark ? '#64748b' : '#94a3b8';
    const tt = { backgroundColor: isDark ? '#1a1d2b' : '#fff', borderColor: isDark ? '#2d3348' : '#e2e8f0', color: isDark ? '#e2e8f0' : '#0f172a', borderRadius: '12px' };
    const card = `rounded-2xl p-6 shadow-sm border ${isDark ? 'bg-[#151823] border-[#1e293b]' : 'bg-white border-slate-200'}`;
    const heading = `text-xl font-semibold mb-4 ${isDark ? 'text-white' : ''}`;
  
    return (
      <>
        <h1 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : ''}`}>Analytics</h1>
        <div className={`${card} mb-8`}>
          <h2 className={heading}>User Growth</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth}>
                <XAxis dataKey="month" stroke={ax} /><YAxis stroke={ax} />
                <Tooltip contentStyle={tt} labelStyle={{ color: tt.color }} />
                <Line type="monotone" dataKey="users" stroke="#f97316" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={card}>
          <h2 className={heading}>Platform Activity</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformStats}>
                <XAxis dataKey="name" stroke={ax} /><YAxis stroke={ax} />
                <Tooltip contentStyle={tt} labelStyle={{ color: tt.color }} />
                <Bar dataKey="value" fill="#fb923c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    );
  }