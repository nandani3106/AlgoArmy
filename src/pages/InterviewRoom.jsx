import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Camera, CameraOff, Clock, ChevronRight, MessageSquare, SkipForward } from 'lucide-react';

const QUESTIONS = [
  'Tell me about your project AlgoArmy. What problem does it solve?',
  'Why did you choose React and Tailwind CSS for the frontend?',
  'Explain how JWT authentication works in your projects.',
  'What are your strongest technical skills and why?',
  'Describe a challenge you faced in one of your projects and how you solved it.',
  'What is the difference between let, const, and var in JavaScript?',
];

const InterviewRoom = () => {
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentQ < QUESTIONS.length) {
      const timeout = setTimeout(() => {
        setTranscript(prev => [...prev, { role: 'ai', text: QUESTIONS[currentQ] }]);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [currentQ]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleNext = () => {
    setTranscript(prev => [...prev, { role: 'user', text: 'Thank you, that\'s a great question. Let me explain...' }]);
    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 500);
    } else {
      setTimeout(() => navigate('/interviews/completed'), 1000);
    }
  };

  const handleEnd = () => navigate('/interviews/completed');

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-xs font-black">AA</div>
          <span className="text-sm font-bold text-white/60">AI Interview Session</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <Clock size={16} className="text-orange-400" />
            <span className="text-sm font-mono font-bold">{formatTime(timer)}</span>
          </div>
          <span className="text-xs font-black text-white/40 uppercase tracking-widest">
            Q {currentQ + 1} / {QUESTIONS.length}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">

        {/* Question + Camera (Left) */}
        <div className="lg:col-span-8 flex flex-col p-6 gap-6">
          {/* Question Panel */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex-shrink-0">
            <p className="text-xs font-black uppercase tracking-widest text-orange-400 mb-3">Question {currentQ + 1}</p>
            <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
              {QUESTIONS[currentQ]}
            </h2>
          </div>

          {/* Camera Feed Placeholder */}
          <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center min-h-[280px] relative overflow-hidden">
            <div className="text-center">
              {camOn ? (
                <>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mx-auto mb-4 border-2 border-white/10">
                    <Camera size={32} className="text-white/30" />
                  </div>
                  <p className="text-sm text-white/30 font-medium">Camera Preview</p>
                </>
              ) : (
                <p className="text-sm text-red-400 font-bold">Camera Off</p>
              )}
            </div>
            {/* Recording indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400">REC</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setMicOn(!micOn)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${micOn ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-red-500/20 text-red-400'}`}>
                {micOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button onClick={() => setCamOn(!camOn)} className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${camOn ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-red-500/20 text-red-400'}`}>
                {camOn ? <Camera size={20} /> : <CameraOff size={20} />}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition-all">
                {currentQ < QUESTIONS.length - 1 ? <><SkipForward size={16} /> Next Question</> : <><ChevronRight size={16} /> Finish Interview</>}
              </button>
              <button onClick={handleEnd} className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 text-sm font-bold hover:bg-red-500/30 transition-all">
                End
              </button>
            </div>
          </div>
        </div>

        {/* Transcript Panel (Right) */}
        <div className="lg:col-span-4 border-l border-white/5 flex flex-col">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-sm font-bold text-white/60 flex items-center gap-2">
              <MessageSquare size={16} /> Live Transcript
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(100vh-180px)]">
            {transcript.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black ${
                  msg.role === 'ai' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {msg.role === 'ai' ? 'AI' : 'U'}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                  msg.role === 'ai' ? 'bg-white/5 text-white/80' : 'bg-blue-500/10 text-blue-300'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {transcript.length === 0 && (
              <p className="text-sm text-white/20 text-center pt-12">Waiting for the interview to begin...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
