import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Mic, MicOff, Camera, CameraOff, Clock, ChevronRight,
  MessageSquare, SkipForward, Loader2, AlertCircle, Volume2, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { loadTrackingScripts, startFaceTracking } from '../utils/faceTracking';
import BrandLogo from '../components/BrandLogo';
import { useProctoring } from '../contexts/ProctoringContext';

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

  const [isSpeaking, setIsSpeaking] = useState(false);
  const voiceRef = useRef(null);

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Setup female voice selection
  useEffect(() => {
    const selectFemaleVoice = () => {
      if (!synthRef.current) return;
      const voices = synthRef.current.getVoices();
      const femaleKeywords = ['google us english', 'microsoft zira', 'aria', 'samantha', 'karen', 'victoria', 'female', 'hazel', 'susan', 'en-us'];
      let selected = voices.find(v => {
        const name = v.name.toLowerCase();
        return femaleKeywords.some(keyword => name.includes(keyword)) && v.lang.startsWith('en');
      });
      if (!selected) {
        selected = voices.find(v => v.lang.startsWith('en'));
      }
      voiceRef.current = selected || null;
    };

    selectFemaleVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = selectFemaleVoice;
    }
  }, []);

  // Proctoring references and states
  const {
    cameraStream, setCameraStream,
    micStream: globalMicStream, setMicStream: setGlobalMicStream,
    screenStream: globalScreenStream,
    clearStreams
  } = useProctoring();

  const videoRef = useRef(null);
  const [proctorStream, setProctorStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [violationCount, setViolationCount] = useState(0);
  const [violations, setViolations] = useState([]);
  const [integrityScore, setIntegrityScore] = useState(100);
  const lastMultiFaceViolationRef = useRef(0);
  const lastNoFaceViolationRef = useRef(0);
  const multiFaceStartRef = useRef(null);
  const noFaceStartRef = useRef(null);
  const hasLoggedMultiFaceRef = useRef(false);
  const hasLoggedNoFaceRef = useRef(false);
  const deviceStartRef = useRef(null);
  const hasLoggedDeviceRef = useRef(false);
  const [videoReady, setVideoReady] = useState(false);

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
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }
    utterance.rate = 0.95;
    utterance.pitch = 1.05; // Slightly higher pitch for female feel if default voice

    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

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

    // Cancel ongoing audio speech immediately on next question
    synthRef.current.cancel();
    setIsSpeaking(false);

    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setTranscript([]); // Clear for next Q
    } else {
      await finishInterview(newAnswers);
    }
  };

  const finishInterview = useCallback(async (finalAnswers, currentViolations = violations, currentViolationCount = violationCount, currentIntegrityScore = integrityScore) => {
    setSubmitting(true);
    // Cleanup proctoring streams on completion
    clearStreams();

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/interview-ai/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          questions,
          answers: finalAnswers,
          violations: currentViolations,
          violationCount: currentViolationCount,
          integrityScore: currentIntegrityScore
        })
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
  }, [questions, violations, violationCount, integrityScore, clearStreams, navigate]);

  const logViolation = useCallback(async (eventType, description) => {
    toast.warning(`Proctoring Warning: ${eventType} - ${description}`, { duration: 5000 });
    console.warn(`[Proctoring Violation] Event: ${eventType}, Details: ${description}`);

    const criticalViolations = [
      "Tab switched",
      "Window unfocused",
      "Fullscreen exited",
      "Screen sharing stopped",
      "Internet disconnected"
    ];

    const severity = criticalViolations.includes(eventType) ? "CRITICAL" : "WARNING";
    const newViolation = { eventType, description, severity, timestamp: new Date() };

    setViolations(prev => {
      const nextViolations = [...prev, newViolation];
      
      // Calculate violationCount and integrityScore
      const nextViolationCount = nextViolations.filter(v => v.severity === "CRITICAL" || v.severity === "WARNING").length;
      let score = 100;
      nextViolations.forEach(v => {
        if (v.severity === "CRITICAL") {
          score -= 20;
        } else if (v.severity === "WARNING") {
          score -= 5;
        }
      });
      const nextIntegrityScore = Math.max(0, score);

      setViolationCount(nextViolationCount);
      setIntegrityScore(nextIntegrityScore);

      if (nextViolationCount >= 5) {
        toast.error("Maximum proctoring violations reached. Terminating interview session...", { duration: 8000 });
        const currentTranscript = transcript.filter(m => m.role === 'user').map(m => m.text).join(' ');
        const newAnswers = [...userAnswers];
        newAnswers[currentQ] = currentTranscript || "No verbal response recorded.";
        finishInterview(newAnswers, nextViolations, nextViolationCount, nextIntegrityScore);
      } else {
        toast.error(`Warning: ${5 - nextViolationCount} violations remaining before automatic session shutdown!`, { duration: 6000 });
      }

      return nextViolations;
    });
  }, [userAnswers, currentQ, transcript, finishInterview]);

  const proctorStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  useEffect(() => {
    proctorStreamRef.current = proctorStream;
  }, [proctorStream]);

  useEffect(() => {
    screenStreamRef.current = screenStream;
  }, [screenStream]);

  // Start/Recover proctor streams once component mounts
  useEffect(() => {
    let isActive = true;
    let localProctorStream = null;
    let localScreenStream = null;

    const startProctoring = async () => {
      try {
        let camMedia = cameraStream;
        const isCameraActive = camMedia && camMedia.getVideoTracks().length > 0 && camMedia.getVideoTracks().every(t => t.readyState === 'live' && t.enabled);
        if (!isCameraActive) {
          console.log("[PROCTORING] Camera stream is inactive or missing. Requesting a fresh stream...");
          camMedia = await navigator.mediaDevices.getUserMedia({ video: true });
          setCameraStream(camMedia);
        }

        let audioMedia = globalMicStream;
        const isMicActive = audioMedia && audioMedia.getAudioTracks().length > 0 && audioMedia.getAudioTracks().every(t => t.readyState === 'live' && t.enabled);
        if (!isMicActive) {
          console.log("[PROCTORING] Mic stream is inactive or missing. Requesting a fresh stream...");
          audioMedia = await navigator.mediaDevices.getUserMedia({ audio: true });
          setGlobalMicStream(audioMedia);
        }

        if (!isActive) return;

        // Merge video and audio tracks for visual feed
        const merged = new MediaStream([
          ...camMedia.getVideoTracks(),
          ...audioMedia.getAudioTracks()
        ]);
        localProctorStream = merged;
        setProctorStream(merged);

        let screen = globalScreenStream;
        const isScreenActive = screen && screen.getVideoTracks().length > 0 && screen.getVideoTracks().every(t => t.readyState === 'live' && t.enabled);
        if (!isScreenActive) {
          console.log("[PROCTORING] Screen stream is inactive or missing. Requesting fresh screen share...");
          screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
          const screenTrack = screen.getVideoTracks()[0];
          const screenSettings = screenTrack ? screenTrack.getSettings() : {};
          const displaySurface = screenSettings.displaySurface;

          if (displaySurface !== 'monitor') {
            screen.getTracks().forEach(t => t.stop());
            if (localProctorStream) {
              localProctorStream.getTracks().forEach(t => t.stop());
            }
            toast.error("Please share your entire screen. Browser tabs and application windows are not allowed.");
            throw new Error("Entire screen sharing is required");
          }
        }

        if (!isActive) {
          if (!isScreenActive && screen) screen.getTracks().forEach(t => t.stop());
          return;
        }
        localScreenStream = screen;
        setScreenStream(screen);

        if (!document.fullscreenElement) {
          try {
            await document.documentElement.requestFullscreen();
          } catch (e) {
            console.error("Fullscreen prompt failed");
          }
        }
      } catch (err) {
        if (isActive) {
          if (err.message !== "Entire screen sharing is required") {
            toast.error("Proctoring streams failed to initialize. Please verify permissions.");
          }
        }
      }
    };

    startProctoring();

    return () => {
      isActive = false;
    };
  }, [cameraStream, globalMicStream, globalScreenStream, setCameraStream, setGlobalMicStream]);

  // Bind proctorStream to video element when it becomes available
  useEffect(() => {
    const setupVideo = async () => {
      if (!proctorStream || !videoRef.current) return;
      videoRef.current.srcObject = proctorStream;
      try {
        await videoRef.current.play();
        setVideoReady(true);
        console.log("Interview room video ready");
      } catch (err) {
        console.error("Interview room video play failed:", err);
      }
    };
    setupVideo();
  }, [proctorStream]);

  // Live face tracking for proctoring violations
  useEffect(() => {
    if (!proctorStream || !videoRef.current || !videoReady) return;

    let trackerInstance = null;
    let isActive = true;

    const runFaceTracking = async () => {
      try {
        await loadTrackingScripts();
        if (!isActive) return;

        trackerInstance = startFaceTracking(videoRef.current, (faces) => {
          if (!isActive) return;
          if (faces.length > 1) {
            noFaceStartRef.current = null;
            hasLoggedNoFaceRef.current = false;

            if (multiFaceStartRef.current === null) {
              multiFaceStartRef.current = Date.now();
            } else if (Date.now() - multiFaceStartRef.current >= 3000) {
              if (!hasLoggedMultiFaceRef.current) {
                hasLoggedMultiFaceRef.current = true;
                logViolation("Multiple faces detected", "More than one person was detected in the camera frame.");
              }
            }
          } else if (faces.length === 0) {
            multiFaceStartRef.current = null;
            hasLoggedMultiFaceRef.current = false;

            if (noFaceStartRef.current === null) {
              noFaceStartRef.current = Date.now();
            } else if (Date.now() - noFaceStartRef.current >= 3000) {
              if (!hasLoggedNoFaceRef.current) {
                hasLoggedNoFaceRef.current = true;
                logViolation("No face detected", "No face was detected in the camera frame.");
              }
            }
          } else {
            multiFaceStartRef.current = null;
            hasLoggedMultiFaceRef.current = false;
            noFaceStartRef.current = null;
            hasLoggedNoFaceRef.current = false;
          }
        });
      } catch (err) {
        console.error("Error initializing face proctoring:", err);
      }
    };

    runFaceTracking();

    return () => {
      isActive = false;
      if (trackerInstance) trackerInstance.stop();
    };
  }, [proctorStream, logViolation, videoReady]);

  // Periodic device detection (phone, other screens)
  useEffect(() => {
    if (!proctorStream || !videoRef.current || !videoReady) return;

    let isActive = true;
    let timerId = null;

    const performDeviceDetection = async () => {
      if (!isActive) return;

      try {
        const videoElement = videoRef.current;
        if (videoElement.readyState >= 2 && !videoElement.paused && !videoElement.ended) {
          const canvas = document.createElement('canvas');
          canvas.width = videoElement.videoWidth || 640;
          canvas.height = videoElement.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            const base64Image = canvas.toDataURL('image/jpeg', 0.5);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/interview-ai/detect-devices`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ image: base64Image })
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.deviceDetected && isActive) {
                if (deviceStartRef.current === null) {
                  deviceStartRef.current = Date.now();
                } else if (Date.now() - deviceStartRef.current >= 3000) {
                  if (!hasLoggedDeviceRef.current) {
                    hasLoggedDeviceRef.current = true;
                    console.log(`[PROCTORING] Device detected: ${data.deviceName} - ${data.explanation}`);
                    logViolation(
                      "Unauthorized device detected",
                      `An unauthorized device (${data.deviceName || "electronic device"}) was detected in the camera frame. Details: ${data.explanation}`
                    );
                  }
                }
              } else if (data.success && !data.deviceDetected) {
                deviceStartRef.current = null;
                hasLoggedDeviceRef.current = false;
              }
            }
          }
        }
      } catch (err) {
        console.error("Error during device detection proctoring:", err);
      }

      // Run check every 5 seconds to support responsive 3-second continuous checking
      if (isActive) {
        timerId = setTimeout(performDeviceDetection, 5000);
      }
    };

    // Delay the first check by 5 seconds to let the candidate settle
    timerId = setTimeout(performDeviceDetection, 5000);

    return () => {
      isActive = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [proctorStream, videoReady, logViolation]);

  // 1. Camera track ending
  useEffect(() => {
    if (!proctorStream) return;
    const videoTrack = proctorStream.getVideoTracks()[0];
    if (!videoTrack) return;

    const handleEnded = () => {
      toast.error("Camera stream was stopped or disconnected. Terminating session...", { duration: 8000 });
      const currentTranscript = transcript.filter(m => m.role === 'user').map(m => m.text).join(' ');
      const newAnswers = [...userAnswers];
      newAnswers[currentQ] = currentTranscript || "No verbal response recorded.";
      finishInterview(newAnswers);
    };

    videoTrack.addEventListener('ended', handleEnded);
    return () => videoTrack.removeEventListener('ended', handleEnded);
  }, [proctorStream, userAnswers, currentQ, transcript, finishInterview]);

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

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

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
      <style>{`
        @keyframes gentle-breathing {
          0%, 100% { transform: scale(1); filter: brightness(0.95) saturate(1); }
          50% { transform: scale(1.02); filter: brightness(1.03) saturate(1.05); }
        }
        @keyframes face-bracket {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.4; }
          50% { transform: scale(1.05) rotate(180deg); opacity: 0.8; }
        }
        @keyframes equalizer-1 {
          0%, 100% { height: 4px; }
          50% { height: 22px; }
        }
        @keyframes equalizer-2 {
          0%, 100% { height: 6px; }
          50% { height: 30px; }
        }
        @keyframes equalizer-3 {
          0%, 100% { height: 4px; }
          50% { height: 18px; }
        }
        @keyframes equalizer-4 {
          0%, 100% { height: 5px; }
          50% { height: 26px; }
        }
        @keyframes equalizer-5 {
          0%, 100% { height: 3px; }
          50% { height: 20px; }
        }
        .animate-eq-1 { animation: equalizer-1 0.6s ease-in-out infinite alternate; }
        .animate-eq-2 { animation: equalizer-2 0.8s ease-in-out infinite alternate 0.1s; }
        .animate-eq-3 { animation: equalizer-3 0.5s ease-in-out infinite alternate 0.2s; }
        .animate-eq-4 { animation: equalizer-4 0.7s ease-in-out infinite alternate 0.15s; }
        .animate-eq-5 { animation: equalizer-5 0.9s ease-in-out infinite alternate 0.3s; }
      `}</style>

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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-orange-400">
                  <Volume2 size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {isSpeaking ? 'AI Interviewer Speaking' : 'AI Interviewer Ready'}
                  </span>
                </div>
                <button
                  onClick={() => speakQuestion(questions[currentQ])}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-orange-400 transition-all flex items-center gap-1.5"
                >
                  <Volume2 size={12} />
                  Repeat Audio
                </button>
              </div>
              <h2 className="text-2xl md:text-3xl font-black leading-tight text-white/90">
                {questions[currentQ]}
              </h2>
            </div>
          </div>

          {/* Video/Audio Area - Meeting Style (AI Left, Candidate Right) */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[350px]">

            {/* AI Interviewer Viewport */}
            <div className="bg-[#0f0f1c] border border-white/10 rounded-3xl relative overflow-hidden flex items-center justify-center group aspect-video md:aspect-auto shadow-2xl">
              {/* Visual Image */}
              <div
                className={`w-full h-full relative transition-all duration-700`}
                style={{
                  backgroundImage: `url('/ai-interviewer.png')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: isSpeaking ? 'brightness(1.05) contrast(1.02)' : 'brightness(0.95)',
                  animation: 'gentle-breathing 6s ease-in-out infinite'
                }}
              />

              {/* Scanline grid overlay to mimic video stream scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.04),_rgba(0,255,0,0.01),_rgba(0,0,255,0.04))] bg-[size:100%_4px,_6px_100%] pointer-events-none opacity-40" />

              {/* Face Detection / Calibration brackets */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-orange-500/60 rounded-tl-md" />
                <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-orange-500/60 rounded-tr-md" />
                <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-orange-500/60 rounded-bl-md" />
                <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-orange-500/60 rounded-br-md" />

                {/* Dynamic Face box targeting */}
                <div
                  className={`absolute w-36 h-36 border border-dashed rounded-full transition-all duration-500 ${isSpeaking
                    ? 'border-orange-500/80 bg-orange-500/5 scale-110'
                    : 'border-white/20 scale-100'
                    }`}
                  style={{ animation: 'face-bracket 5s linear infinite' }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                  <div className="absolute top-12 left-2 w-1.5 h-1.5 bg-orange-400/80 rounded-full" />
                  <div className="absolute top-12 right-2 w-1.5 h-1.5 bg-orange-400/80 rounded-full" />
                </div>
              </div>

              {/* Concentric Voice Waves around Emma when speaking */}
              {isSpeaking && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="absolute w-48 h-48 rounded-full border-4 border-orange-500/30 animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="absolute w-64 h-64 rounded-full border-2 border-orange-500/10 animate-ping" style={{ animationDuration: '3.5s' }} />
                </div>
              )}

              {/* Equalizer Audio Graph at bottom-right of feed */}
              <div className="absolute bottom-6 right-6 flex items-end gap-1 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl h-10 z-10">
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 mr-2 self-center">
                  {isSpeaking ? 'SPEAKING' : 'ATTENTIVE'}
                </span>
                <div className={`w-1 rounded-full bg-orange-500 transition-all ${isSpeaking ? 'animate-eq-1 h-6' : 'h-1'}`} />
                <div className={`w-1 rounded-full bg-orange-500 transition-all ${isSpeaking ? 'animate-eq-2 h-8' : 'h-2'}`} />
                <div className={`w-1 rounded-full bg-orange-500 transition-all ${isSpeaking ? 'animate-eq-3 h-5' : 'h-1'}`} />
                <div className={`w-1 rounded-full bg-orange-500 transition-all ${isSpeaking ? 'animate-eq-4 h-7' : 'h-2'}`} />
                <div className={`w-1 rounded-full bg-orange-500 transition-all ${isSpeaking ? 'animate-eq-5 h-4' : 'h-1'}`} />
              </div>

              {/* Video Info Badge */}
              <div className="absolute top-6 left-6 flex items-center gap-2 z-10 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl">
                <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-orange-500 animate-pulse' : 'bg-green-500 animate-pulse'}`} />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">
                  Emma (AI Tech Lead)
                </span>
                {isSpeaking && (
                  <span className="text-[9px] text-orange-400 font-bold bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20 uppercase tracking-widest animate-pulse ml-1">
                    Active Voice
                  </span>
                )}
              </div>

              {/* Video Feed Stats */}
              <div className="absolute bottom-6 left-6 text-white/50 text-[9px] font-mono bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md border border-white/5 pointer-events-none">
                FHD 1080p | 30 FPS | LATENCY: 12ms
              </div>
            </div>

            {/* Candidate Webcam Feed */}
            <div className="bg-[#0f0f1c] border border-white/10 rounded-3xl relative overflow-hidden flex items-center justify-center group aspect-video md:aspect-auto shadow-2xl">
              {camOn && proctorStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-3xl absolute inset-0"
                  onPlay={() => setVideoReady(true)}
                  onPause={() => setVideoReady(false)}
                />
              ) : (
                <div className="text-center">
                  <CameraOff size={48} className="text-red-500/30 mx-auto mb-4 animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500/50">Camera Stream Muted</p>
                </div>
              )}

              {/* Candidate Info Badge */}
              <div className="absolute top-6 left-6 flex items-center gap-2 z-10 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">You (Candidate)</span>
                {isListening && (
                  <span className="text-[9px] text-green-400 font-bold bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20 uppercase tracking-widest animate-pulse ml-1">
                    Active Listening
                  </span>
                )}
              </div>

              {/* Microphone State Status Box */}
              <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl">
                {micOn ? (
                  <>
                    <Mic size={12} className={isListening ? "text-green-400 animate-pulse" : "text-white/60"} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isListening ? "text-green-400" : "text-white/60"}`}>
                      {isListening ? "Mic Active" : "Mic Standby"}
                    </span>
                  </>
                ) : (
                  <>
                    <MicOff size={12} className="text-red-400" />
                    <span className="text-[9px] text-red-400 font-black uppercase tracking-widest">Muted</span>
                  </>
                )}
              </div>

              {violationCount > 0 && (
                <div className="absolute bottom-6 left-6 px-3 py-1.5 rounded-xl bg-red-600/95 text-white text-[9px] font-black uppercase tracking-widest border border-red-500/20 z-10 flex flex-col gap-1">
                  <span className="animate-pulse">{violationCount} Violations</span>
                  <span className="text-[8px] text-white/70">Integrity: {integrityScore}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Live Closed Captions / Interim Answer Display */}
          {(isListening || interimText) && (
            <div className="bg-black/60 border border-white/10 px-6 py-3 rounded-2xl max-w-2xl mx-auto text-center backdrop-blur-md shadow-lg flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
              <p className="text-sm font-medium text-white/90">
                <span className="text-orange-400 font-bold uppercase tracking-wider text-[10px] mr-2">Live Transcript:</span>
                {interimText || "Awaiting voice input..."}
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-4">
              <button onClick={handleMicToggle} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${micOn ? 'bg-white/10 hover:bg-white/20' : 'bg-red-500/20 text-red-500 border border-red-500/20'}`}>
                {micOn ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to finish the interview now? All current responses will be evaluated.")) {
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