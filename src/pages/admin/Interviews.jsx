export default function Interviews() {
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
      <h1 className="text-3xl font-bold mb-8">
        AI Interview Analysis
      </h1>

      <div className="space-y-6">
        {interviews.map((user, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-sm border"
          >
            {/* Top */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {user.name}
                </h2>

                <p className="text-slate-500">
                  {user.role}
                </p>
              </div>

              <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm">
                {user.status}
              </span>
            </div>

            {/* Scores */}
            <div className="grid md:grid-cols-5 gap-4 mb-6">
              <ScoreCard
                label="Confidence"
                value={user.confidence}
              />

              <ScoreCard
                label="Communication"
                value={user.communication}
              />

              <ScoreCard
                label="Technical"
                value={user.technical}
              />

              <ScoreCard
                label="Problem Solving"
                value={user.problemSolving}
              />

              <ScoreCard
                label="Overall"
                value={user.overall}
              />
            </div>

            {/* AI Summary */}
            <div className="bg-slate-50 rounded-xl p-4">
              <h3 className="font-semibold mb-2">
                AI Analysis
              </h3>

              <p className="text-slate-600">
                {user.summary}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-5">
              <button className="bg-green-500 text-white px-4 py-2 rounded-xl">
                Shortlist
              </button>

              <button className="bg-red-500 text-white px-4 py-2 rounded-xl">
                Reject
              </button>

              <button className="border px-4 py-2 rounded-xl">
                Review Later
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ScoreCard({ label, value }) {
  return (
    <div className="bg-slate-50 p-4 rounded-xl text-center">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <h3 className="text-2xl font-bold mt-1">
        {value}
      </h3>
    </div>
  );
}