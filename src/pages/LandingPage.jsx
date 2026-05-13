import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Trophy, Brain, ShieldCheck, Code2 } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const features = [
    {
      title: "DSA Practice",
      desc: "Solve daily coding problems and improve your problem-solving skills.",
      icon: <Code2 size={28} />,
    },
    {
      title: "Coding Contests",
      desc: "Compete in live contests and climb dynamic leaderboards.",
      icon: <Trophy size={28} />,
    },
    {
      title: "OA Platform",
      desc: "Take AI-proctored online assessments with smart monitoring.",
      icon: <ShieldCheck size={28} />,
    },
    {
      title: "AI Interviews",
      desc: "Practice real interviews with an AI interviewer and get feedback.",
      icon: <Brain size={28} />,
    },
  ];

  const particles = Array.from({ length: 15 });

  return (
    <main className="min-h-screen bg-[#f9f7f2] text-slate-800 overflow-hidden relative">

      {/* Background Glow */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-20 left-20 w-80 h-80 bg-orange-200/50 blur-[120px] rounded-full"
      />

      <motion.div
        animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-20 right-20 w-80 h-80 bg-yellow-200/40 blur-[120px] rounded-full"
      />

      {/* Floating Particles */}
      {particles.map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -25, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 3 + i * 0.2,
            repeat: Infinity,
          }}
          className="absolute w-2 h-2 bg-slate-400/20 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* NAVBAR */}
      <nav className="relative z-10 flex justify-between items-center px-8 md:px-14 py-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
          AlgoArmy
        </h1>

        <div className="space-x-4">
          <button onClick={() => navigate('/login')}
            className="text-slate-600 hover:text-slate-900 transition">
            Login
          </button>

          {/* Animated Button */}
          <motion.button
            onClick={() => navigate('/signup')}
            whileHover={{ scale: 1.05 }}
            className="relative overflow-hidden bg-slate-900 text-white px-5 py-2 rounded-full font-medium shadow-lg"
          >
            <span className="relative z-10">Get Started</span>

            <motion.div
              animate={{ x: ["-120%", "150%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </motion.button>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-24">

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold leading-tight max-w-4xl"
        >
          Join the{" "}
          <span className="bg-gradient-to-r from-orange-500 via-yellow-500 to-amber-400 bg-clip-text text-transparent">
            AlgoArmy
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-slate-600 text-lg md:text-xl max-w-2xl"
        >
          Compete in coding contests, take online assessments,
          and ace AI-powered interviews.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          {/* Start Practicing */}
          <motion.button
            onClick={() => navigate('/signup')}
            whileHover={{ scale: 1.05 }}
            className="relative overflow-hidden bg-slate-900 text-white px-8 py-4 rounded-full shadow-lg flex items-center gap-2"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Practicing
              <ArrowRight size={18} />
            </span>

            <motion.div
              animate={{ x: ["-100%", "150%"] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </motion.button>

          {/* Explore Contests */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            className="relative overflow-hidden border border-slate-300 px-8 py-4 rounded-full bg-white/60 hover:bg-white transition"
          >
            <span className="relative z-10">
              Explore Contests
            </span>

            <motion.div
              animate={{ x: ["-100%", "150%"] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent"
            />
          </motion.button>
        </motion.div>

        <p className="mt-6 text-sm text-slate-500">
          Practice DSA • Join Weekly Contests • Take AI Interviews
        </p>
      </section>

      {/* STATS */}
      <section className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 px-8 md:px-14 mt-24">
        {[
          ["10K+", "Developers"],
          ["500+", "Problems"],
          ["100+", "Contests"],
          ["95%", "Success Rate"],
        ].map(([num, label]) => (
          <motion.div
            whileHover={{ y: -5 }}
            key={label}
            className="backdrop-blur-xl bg-white/70 border border-white/50 rounded-2xl p-6 text-center shadow-md"
          >
            <h3 className="text-3xl font-bold text-slate-800">{num}</h3>
            <p className="text-slate-500 mt-2">{label}</p>
          </motion.div>
        ))}
      </section>

      {/* FEATURES */}
      <section className="relative z-10 px-8 md:px-14 mt-28">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {features.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ y: -8 }}
              className="backdrop-blur-xl bg-white/70 border border-white/50 rounded-2xl p-6 shadow-md"
            >
              <div className="text-orange-500 mb-4">
                {item.icon}
              </div>

              <h3 className="text-xl font-semibold">
                {item.title}
              </h3>

              <p className="text-slate-500 mt-3 text-sm">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 py-8 text-center text-slate-500 mt-24">
        © 2026 AlgoArmy. All rights reserved.
      </footer>
    </main>
  );
}