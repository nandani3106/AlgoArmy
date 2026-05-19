import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Mic, MicOff, Camera, CameraOff, Clock, ChevronRight,
  MessageSquare, SkipForward, Loader2, AlertCircle, Volume2
} from 'lucide-react';
import { toast } from 'sonner';
import BrandLogo from '../components/BrandLogo';

const API_BASE = 'http://localhost:5000';

const InterviewRoom = () => {
  const navigate = useNavigate();
  const { id } = useParams();

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

  // Proctoring references and states
  const videoRef = useRef(null);
  const [proctorStream, setProctorStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [violationCount, setViolationCount] = useState(0);

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
    // Cleanup proctoring streams on completion
    if (proctorStream) proctorStream.getTracks().forEach(t => t.stop());
    if (screenStream) screenStream.getTracks().forEach(t => t.stop());

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

  const logViolation = useCallback(async (eventType, description) => {
    toast.warning(`Proctoring Warning: ${eventType} - ${description}`, { duration: 5000 });
    console.warn(`[Proctoring Violation] Event: ${eventType}, Details: ${description}`);

    let activeCount = violationCount + 1;
    setViolationCount(prev => {
      const next = prev + 1;
      activeCount = next;
      return next;
    });

    if (id && id !== 'room') {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE}/api/oa/${id}/log-violation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ eventType, description })
        });
      } catch (err) {
        console.error("Failed to log violation on backend:", err);
      }
    }

    if (activeCount >= 5) {
      toast.error("Maximum proctoring violations reached. Terminating interview session...", { duration: 8000 });
      const currentTranscript = transcript.filter(m => m.role === 'user').map(m => m.text).join(' ');
      const newAnswers = [...userAnswers];
      newAnswers[currentQ] = currentTranscript || "No verbal response recorded.";
      finishInterview(newAnswers);
    } else {
      toast.error(`Warning: ${5 - activeCount} violations remaining before automatic session shutdown!`, { duration: 6000 });
    }
  }, [id, violationCount, userAnswers, currentQ, transcript]);

  // Start proctor streams once components mount
  useEffect(() => {
    const startProctoring = async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setProctorStream(media);
        if (videoRef.current) {
          videoRef.current.srcObject = media;
        }

        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenStream(screen);

        if (!document.fullscreenElement) {
          try {
            await document.documentElement.requestFullscreen();
          } catch (e) {
            console.error("Fullscreen prompt failed");
          }
        }
      } catch (err) {
        toast.error("Proctoring streams failed to initialize. Please verify permissions.");
      }
    };

    startProctoring();

    return () => {
      if (proctorStream) proctorStream.getTracks().forEach(t => t.stop());
      if (screenStream) screenStream.getTracks().forEach(t => t.stop());
    };
  }, []);

  // 1. Camera track ending
  useEffect(() => {
    if (!proctorStream) return;
    const videoTrack = proctorStream.getVideoTracks()[0];
    if (!videoTrack) return;

    const handleEnded = () => {
      logViolation("Camera disabled", "Candidate camera track stopped or disconnected.");
    };
    
    videoTrack.addEventListener('ended', handleEnded);
    return () => videoTrack.removeEventListener('ended', handleEnded);
  }, [proctorStream, logViolation]);

  // 2. Microphone track ending
  useEffect(() => {
    if (!proctorStream) return;
    const audioTrack = proctorStream.getAudioTracks()[0];
    if (!audioTrack) return;

    const handleEnded = () => {
      logViolation("Microphone disabled", "Candidate microphone track stopped or disconnected.");
    };
    
    audioTrack.addEventListener('ended', handleEnded);
    return () => audioTrack.removeEventListener('ended', handleEnded);
  }, [proctorStream, logViolation]);

  // 3. Screen sharing track ending
  useEffect(() => {
    if (!screenStream) return;
    const videoTrack = screenStream.getVideoTracks()[0];
    if (!videoTrack) return;

    const handleEnded = () => {
      logViolation("Screen sharing stopped", "Candidate stopped sharing their screen feed.");
    };
    
    videoTrack.addEventListener('ended', handleEnded);
    return () => videoTrack.removeEventListener('ended', handleEnded);
  }, [screenStream, logViolation]);

  // 4. Tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation("Tab switched", "Candidate navigated away from the active interview session tab.");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [logViolation]);

  // 5. Window blur
  useEffect(() => {
    const handleBlur = () => {
      logViolation("Window unfocused", "Candidate clicked outside the active proctoring window.");
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [logViolation]);

  // 6. Fullscreen exit
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logViolation("Fullscreen exited", "Candidate exited full-screen proctoring mode.");
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [logViolation]);

  // 7. Internet disconnection
  useEffect(() => {
    const handleOffline = () => {
      logViolation("Internet disconnected", "Stable internet connection was lost.");
    };
    const handleOnline = () => {
      toast.success("Internet connection restored.");
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [logViolation]);

  // Camera toggle handler
  const handleCamToggle = () => {
    if (proctorStream) {
      const videoTrack = proctorStream.getVideoTracks()[0];
      if (videoTrack) {
        const nextState = !camOn;
        videoTrack.enabled = nextState;
        setCamOn(nextState);
        if (!nextState) {
          logViolation("Camera disabled manually", "Candidate manually turned off their camera stream.");
        }
      }
    }
  };

  // Microphone toggle handler
  const handleMicToggle = () => {
    if (proctorStream) {
      const audioTrack = proctorStream.getAudioTracks()[0];
      if (audioTrack) {
        const nextState = !micOn;
        audioTrack.enabled = nextState;
        setMicOn(nextState);
        if (!nextState) {
          logViolation("Microphone disabled manually", "Candidate manually turned off their microphone stream.");
        }
      }
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
           <BrandLogo size="sm" showText={false} clickable={false} />
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
              <div className="bg-[#0f0f1c] border border-white/10 rounded-3xl relative overflow-hidden flex items-center justify-center group aspect-video md:aspect-auto shadow-2xl">
                 {camOn && proctorStream ? (
                    <video 
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover rounded-3xl absolute inset-0"
                    />
                 ) : (
                    <div className="text-center">
                       <CameraOff size={48} className="text-red-500/30 mx-auto mb-4 animate-pulse" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-red-500/50">Camera Stream Muted</p>
                    </div>
                 )}
                 <div className="absolute top-6 left-6 flex items-center gap-2 z-10 bg-black/50 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Live Proctor</span>
                 </div>
                 {violationCount > 0 && (
                    <div className="absolute bottom-6 left-6 px-3 py-1 rounded-xl bg-red-600/90 text-white text-[8px] font-black uppercase tracking-widest animate-pulse border border-red-500/20 z-10">
                      {violationCount} Violations
                    </div>
                 )}
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
                 <button onClick={handleMicToggle} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${micOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-500 border border-red-500/20'}`}>
                    {micOn ? <Mic size={20} /> : <MicOff size={20} />}
                 </button>
                 <button onClick={handleCamToggle} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${camOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-500 border border-red-500/20'}`}>
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