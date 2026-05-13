import { useTheme } from "../../context/ThemeContext";

export default function Interviews() {
  const { isDark } = useTheme();

  const interviews = [
    {
      name: "Tanu Raj",
      role: "Frontend Developer",
      status: "Completed",
      confidence: 84,
      communication: 78,
      technical: 88,
      problemSolving: 82,
      overall: 83,
      summary:
        "Strong DSA understanding. Good communication. Needs more confidence.",
    },
    {
      name: "Rahul Sharma",
      role: "Backend Developer",
      status: "Flagged",
      confidence: 65,
      communication: 72,
      technical: 80,
      problemSolving: 75,
      overall: 73,
      summary:
        "Good technical answers. Weak communication clarity.",
    },
  ];

  return (
    <>
      <h1 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : ''}`}>
        AI Interview Analysis
      </h1>

      <div className="space-y-6">
        {interviews.map((user, i) => (
          <div
            key={i}
            className={`rounded-2xl p-6 shadow-sm border ${
              isDark
                ? 'bg-[#151823] border-[#1e293b]'
                : 'bg-white'
            }`}
          >
            {/* Top */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : ''}`}>
                  {user.name}
                </h2>

                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                  {user.role}
                </p>
              </div>

              <span className={`px-3 py-1 rounded-full text-sm ${
                isDark
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'bg-orange-100 text-orange-600'
              }`}>
                {user.status}
              </span>
            </div>

            {/* Scores */}
            <div className="grid md:grid-cols-5 gap-4 mb-6">
              <ScoreCard
                label="Confidence"
                value={user.confidence}
                isDark={isDark}
              />

              <ScoreCard
                label="Communication"
                value={user.communication}
                isDark={isDark}
              />

              <ScoreCard
                label="Technical"
                value={user.technical}
                isDark={isDark}
              />

              <ScoreCard
                label="Problem Solving"
                value={user.problemSolving}
                isDark={isDark}
              />

              <ScoreCard
                label="Overall"
                value={user.overall}
                isDark={isDark}
              />
            </div>

            {/* AI Summary */}
            <div className={`rounded-xl p-4 ${
              isDark ? 'bg-[#1a1d2b]' : 'bg-slate-50'
            }`}>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : ''}`}>
                AI Analysis
              </h3>

              <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
                {user.summary}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-5">
              <button className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition">
                Shortlist
              </button>

              <button className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition">
                Reject
              </button>

              <button className={`border px-4 py-2 rounded-xl ${
                isDark
                  ? 'border-[#2d3348] text-slate-300 hover:bg-[#1a1d2b]'
                  : ''
              }`}>
                Review Later
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ScoreCard({ label, value, isDark }) {
  return (
    <div className={`p-4 rounded-xl text-center ${
      isDark ? 'bg-[#1a1d2b]' : 'bg-slate-50'
    }`}>
      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        {label}
      </p>

      <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : ''}`}>
        {value}
      </h3>
    </div>
  );
}