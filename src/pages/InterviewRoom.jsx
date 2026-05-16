import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, MicOff, Camera, CameraOff, Clock, ChevronRight,
  MessageSquare, SkipForward, Loader2, AlertCircle, Volume2
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000';

const InterviewRoom = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Load questions
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('generatedQuestions') || localStorage.getItem('interviewQuestions') || '[]');
      const normalized = saved.map(item => typeof item === 'string' ? item : item.question).filter(Boolean);
      if (normalized.length === 0) { navigate('/interviews'); return; }
      setQuestions(normalized);
    } catch (e) { navigate('/interviews'); }
  }, [navigate]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // AI Speech Synthesis (Speak Question)
  const speakQuestion = useCallback((text) => {
    if (!text) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    synthRef.current.speak(utterance);
  }, []);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      setInterimText(interim);
      if (final) {
        setTranscript(prev => {
           const last = prev[prev.length - 1];
           if (last && last.role === 'user') {
             const updated = [...prev];
             updated[updated.length - 1].text += ' ' + final;
             return updated;
           }
           return [...prev, { role: 'user', text: final }];
        });
      }
    };

    recognition.onerror = (e) => console.error("SR Error:", e);
    recognitionRef.current = recognition;
  }, []);

  // Listen toggle
  useEffect(() => {
    if (micOn && !isListening) {
      recognitionRef.current?.start();
      setIsListening(true);
    } else if (!micOn && isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
  }, [micOn, isListening]);

  // When question changes, AI speaks
  useEffect(() => {
    if (questions.length > 0 && currentQ < questions.length) {
      const qText = questions[currentQ];
      setTranscript(prev => [...prev, { role: 'ai', text: qText }]);
      speakQuestion(qText);
    }
  }, [currentQ, questions, speakQuestion]);

  const handleNext = async () => {
    // Save current user response text
    const currentTranscript = transcript.filter(m => m.role === 'user').map(m => m.text).join(' ');
    const newAnswers = [...userAnswers];
    newAnswers[currentQ] = currentTranscript || "No verbal response recorded.";
    setUserAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setTranscript([]); // Clear for next Q
    } else {
      await finishInterview(newAnswers);
    }
  };

  const finishInterview = async (finalAnswers) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/interview-ai/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ questions, answers: finalAnswers })
      });
      const data = await res.json();
      if (data.success) {
        navigate(`/results/interview/${data.resultId}`);
      } else {
        toast.error("Failed to evaluate interview");
      }
    } catch (e) {
      toast.error("Network error during evaluation");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  if (questions.length === 0 || submitting) return (
    <div className="h-screen bg-[#0a0a12] flex flex-col items-center justify-center gap-4">
      <Loader2 size={48} className="text-orange-500 animate-spin" />
      <p className="text-white/60 font-bold uppercase tracking-widest text-xs">
        {submitting ? 'Evaluating Performance...' : 'Initializing Session...'}
      </p>
    </div>
  );

  return (
    <div className="h-screen bg-[#0a0a12] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-white/5 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
           <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-black text-xs">AA</div>
           <span className="text-xs font-black uppercase tracking-widest text-white/40">AI Interview Room</span>
        </div>
        <div className="flex items-center gap-6">
           <div className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
              <Clock size={14} className="text-orange-400" />
              <span className="font-mono text-sm font-bold">{formatTime(timer)}</span>
           </div>
           <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Question {currentQ + 1} / {questions.length}</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Section */}
        <div className="flex-1 flex flex-col p-8 gap-8 overflow-y-auto">
           {/* Question */}
           <div className="bg-white/5 border border-white/10 rounded-3xl p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full" />
              <div className="relative z-10">
                 <div className="flex items-center gap-2 text-orange-400 mb-4">
                    <Volume2 size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">AI Interviewer Speaking</span>
                 </div>
                 <h2 className="text-2xl md:text-3xl font-black leading-tight text-white/90">
                    {questions[currentQ]}
                 </h2>
              </div>
           </div>

           {/* Video/Audio Area */}
           <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[300px]">
              <div className="bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden flex items-center justify-center group">
                 {camOn ? (
                    <div className="text-center animate-pulse">
                       <Camera size={48} className="text-white/20 mx-auto mb-4" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Camera Active</p>
                    </div>
                 ) : (
                    <CameraOff size={48} className="text-red-500/30" />
                 )}
                 <div className="absolute top-6 left-6 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live</span>
                 </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-6">
                 <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-orange-500 shadow-lg shadow-orange-500/40 scale-110' : 'bg-white/10 text-white/40'}`}>
                    <Mic size={32} />
                 </div>
                 <div>
                    <h3 className="font-black uppercase tracking-widest text-xs mb-2">{isListening ? 'Listening to your answer...' : 'Microphone Muted'}</h3>
                    <p className="text-sm text-white/40 font-medium px-8 leading-relaxed italic">
                       {interimText || "Speak clearly into your microphone to provide your response."}
                    </p>
                 </div>
              </div>
           </div>

           {/* Controls */}
           <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-4">
                 <button onClick={() => setMicOn(!micOn)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${micOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-500'}`}>
                    {micOn ? <Mic size={20} /> : <MicOff size={20} />}
                 </button>
                 <button onClick={() => setCamOn(!camOn)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${camOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-500'}`}>
                    {camOn ? <Camera size={20} /> : <CameraOff size={20} />}
                 </button>
                 <button 
                    onClick={() => {
                      if(window.confirm("Are you sure you want to finish the interview now? All current responses will be evaluated.")) {
                        finishInterview(userAnswers); 
                      }
                    }} 
                    className="px-6 py-4 rounded-2xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all border border-red-500/20"
                 >
                    End Session
                 </button>
              </div>

              <button onClick={handleNext} className="px-10 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all shadow-lg shadow-orange-900/20 active:scale-95">
                 {currentQ === questions.length - 1 ? 'Finish Interview' : 'Next Question'}
                 <ChevronRight size={18} />
              </button>
           </div>
        </div>

        {/* Sidebar Transcript */}
        <div className="w-96 border-l border-white/5 bg-black/20 flex flex-col">
           <div className="p-6 border-b border-white/5 flex items-center gap-3">
              <MessageSquare size={16} className="text-orange-400" />
              <span className="text-xs font-black uppercase tracking-widest text-white/40">Real-time Transcript</span>
           </div>
           <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {transcript.map((msg, i) => (
                 <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0 ${msg.role === 'ai' ? 'bg-orange-500/20 text-orange-400' : 'bg-white/10 text-white/40'}`}>
                       {msg.role === 'ai' ? 'AI' : 'YOU'}
                    </div>
                    <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${msg.role === 'ai' ? 'bg-white/5 text-white/80' : 'bg-orange-500/10 text-orange-200 border border-orange-500/10'}`}>
                       {msg.text}
                    </div>
                 </div>
              ))}
              {transcript.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center opacity-20 gap-4">
                    <MessageSquare size={48} />
                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting interaction</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;