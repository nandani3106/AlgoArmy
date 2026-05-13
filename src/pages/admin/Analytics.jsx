import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
  } from "recharts";
  
  export default function Analytics() {
    const userGrowth = [
      { month: "Jan", users: 120 },
      { month: "Feb", users: 200 },
      { month: "Mar", users: 340 },
      { month: "Apr", users: 500 },
      { month: "May", users: 780 },
    ];
  
    const platformStats = [
      { name: "Contests", value: 85 },
      { name: "OA Tests", value: 72 },
      { name: "Interviews", value: 64 },
    ];
  
    return (
      <>
        <h1 className="text-3xl font-bold mb-8">
          Analytics
        </h1>
  
        {/* User Growth */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            User Growth
          </h2>
  
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#f97316"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
  
        {/* Platform Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold mb-4">
            Platform Activity
          </h2>
  
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformStats}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="#fb923c"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    );
  }