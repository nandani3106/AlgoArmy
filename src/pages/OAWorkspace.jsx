import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, Send, ChevronLeft, ChevronRight,
  AlertTriangle, Building2, Bookmark, Loader2, Play, RotateCcw, Copy, Download, Save, Zap, Terminal,
  Layout, ListChecks, CheckCircle2, Moon, Sun, Minimize2, Maximize2, Menu
} from 'lucide-react';
import QuestionNavigator from '../components/QuestionNavigator';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';
import ProblemPanel from '../components/ProblemPanel';
import WorkspaceLayout from '../components/WorkspaceLayout';
import { toast } from 'sonner';
import { loadTrackingScripts, startFaceTracking } from '../utils/faceTracking';
import { useProctoring } from '../contexts/ProctoringContext';

const API_BASE = 'http://localhost:5000';

const STARTER_TEMPLATES = {
  javascript: `/**\n * Read from stdin and write to stdout.\n */\nconst fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf8');\n    // Write your code here\n}\n\nsolve();`,
  python: `# Write your Python code here\nimport sys\n\ndef solve():\n    pass\n\nif __name__ == '__main__':\n    solve()`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    return 0;\n}`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your Java code here\n    }\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    // Write your C code here\n    return 0;\n}`
};

const OAWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cameraStream, setCameraStream, micStream, setMicStream, screenStream: globalScreenStream } = useProctoring();
  const isNavigatingOrSubmitting = useRef(false);

  const [oa, setOa] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [output, setOutput] = useState('');
  const [verdict, setVerdict] = useState('');
  const [testCases, setTestCases] = useState(null);
  const [executionMetrics, setExecutionMetrics] = useState(null);
  const [complexityEstimate, setComplexityEstimate] = useState('');
  const [compilerOutput, setCompilerOutput] = useState('');

  // Custom workspace parameters
  const [theme, setTheme] = useState(() => localStorage.getItem('algoarmy-theme') || 'vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [minimapEnabled, setMinimapEnabled] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [isCustomInputActive, setIsCustomInputActive] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Mobile rendering states
  const [activeMobileTab, setActiveMobileTab] = useState('problem'); // 'problem', 'editor', 'console'
  const [isMobile, setIsMobile] = useState(false);

  const [proctorStream, setProctorStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [violationCount, setViolationCount] = useState(0);
  const workspaceVideoRef = useRef(null);
  const lastMultiFaceViolationRef = useRef(0);
  const lastNoFaceViolationRef = useRef(0);
  const [videoReady, setVideoReady] = useState(false);
  const alertShownRef = useRef(false);
  const [showInstructionModal, setShowInstructionModal] = useState(false);

  const getStorageKey = useCallback((qId, lang) => `oa-${qId}-${lang}`, []);

  // Screen size listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Persist Theme Preference
  useEffect(() => {
    localStorage.setItem('algoarmy-theme', theme);
  }, [theme]);

  // Load past submissions for current coding question
  useEffect(() => {
    const currentQ = questions[currentIdx];
    if (currentQ && currentQ.type === 'coding') {
      const savedHistory = localStorage.getItem(`oa-history-${id}-${currentQ._id}`);
      setSubmissions(savedHistory ? JSON.parse(savedHistory) : []);
    }
  }, [currentIdx, questions, id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const headers = { 'Authorization': `Bearer ${token}` };

        const [oaRes, qRes] = await Promise.all([
          fetch(`${API_BASE}/api/oa/${id}`, { headers }),
          fetch(`${API_BASE}/api/oa/${id}/questions`, { headers })
        ]);

        const oaData = await oaRes.json();
        const qData = await qRes.json();

        if (oaData.success) {
          const test = oaData.data;
          const now = new Date();
          if (now < new Date(test.startDate) || now > new Date(test.endDate)) {
            toast.error("This assessment is not currently live.");
            navigate(`/oa/${id}`);
            return;
          }

          setOa(test);
          setTimeLeft((test.durationMinutes || 45) * 60);
        }

        if (qData.success) {
          setQuestions(qData.data);
          const initialAnswers = {};
          qData.data.forEach(q => {
            if (q.type === 'coding') {
              const defaultLang = 'javascript';
              const saved = localStorage.getItem(getStorageKey(q._id, defaultLang));
              initialAnswers[q._id] = { answer: saved || STARTER_TEMPLATES[defaultLang], language: defaultLang };
            } else {
              initialAnswers[q._id] = { answer: '' };
            }
          });
          setAnswers(initialAnswers);
        } else {
          toast.error(qData.message || "Failed to load questions");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to initialize workspace");
      }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id, navigate, getStorageKey]);

  useEffect(() => {
    if (oa && !alertShownRef.current) {
      alertShownRef.current = true;
      setShowInstructionModal(true);
    }
  }, [oa]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswer = (val, lang = null) => {
    const qId = questions[currentIdx]._id;
    const current = answers[qId] || {};
    const newAnswer = { ...current, answer: val, ...(lang && { language: lang }) };
    setAnswers({ ...answers, [qId]: newAnswer });
    if (questions[currentIdx].type === 'coding') {
      localStorage.setItem(getStorageKey(qId, lang || current.language || 'javascript'), val);
    }
  };

  const saveProgress = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const qId = questions[currentIdx]._id;
      const ans = answers[qId] || { answer: '', language: 'javascript' };

      const res = await fetch(`${API_BASE}/api/oa/${id}/save-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          answers: [{ questionId: qId, answer: ans.answer, language: ans.language }]
        })
      });
      const data = await res.json();
      if (!data.success) toast.error("Failed to save progress");
    } catch (e) {
      console.error("Save progress failed", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    await saveProgress();
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setOutput(''); setVerdict(''); setTestCases(null); setCompilerOutput('');
      if (isMobile) setActiveMobileTab('problem');
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setOutput(''); setVerdict(''); setTestCases(null); setCompilerOutput('');
      if (isMobile) setActiveMobileTab('problem');
    }
  };

  const handleRun = async () => {
    const q = questions[currentIdx];
    if (q.type !== 'coding' || isRunning) return;
    setIsRunning(true);
    setIsSubmitting(false);
    setOutput('');
    setVerdict('');
    setTestCases(null);
    setCompilerOutput('');

    if (isMobile) setActiveMobileTab('console');

    try {
      const token = localStorage.getItem('token');
      const ans = answers[q._id] || { answer: '', language: 'javascript' };
      const payload = {
        questionId: q._id,
        code: ans.answer,
        language: ans.language,
        ...(isCustomInputActive && { customInput })
      };

      const res = await fetch(`${API_BASE}/api/oa/${id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setIsRunning(false);

      if (data.success) {
        setVerdict(data.verdict);
        setTestCases(data.detailedResults);
        setExecutionMetrics({ time: data.executionTime, memory: data.memoryUsed });
        setComplexityEstimate(data.complexityEstimate);
        setCompilerOutput(data.compilerOutput);
        const failed = data.detailedResults.find(r => !r.passed);
        setOutput(failed ? failed.actual : (data.detailedResults[0]?.actual || "Execution Finished"));
      }
    } catch (e) { setIsRunning(false); toast.error("Execution error"); }
  };

  const handleQuestionSubmit = async () => {
    const q = questions[currentIdx];
    if (q.type !== 'coding' || isRunning || isSubmitting) return;
    setIsRunning(true);
    setIsSubmitting(true);
    setOutput('');
    setVerdict('');
    setTestCases(null);
    setCompilerOutput('');

    if (isMobile) setActiveMobileTab('console');

    try {
      const token = localStorage.getItem('token');
      const ans = answers[q._id] || { answer: '', language: 'javascript' };
      const res = await fetch(`${API_BASE}/api/oa/${id}/submit-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          questionId: q._id,
          code: ans.answer,
          language: ans.language
        })
      });
      const data = await res.json();
      setIsRunning(false);
      setIsSubmitting(false);

      if (data.success) {
        setVerdict(data.verdict);
        setTestCases(data.detailedResults);
        setExecutionMetrics({ time: data.executionTime, memory: data.memoryUsed });
        setComplexityEstimate(data.complexityEstimate);
        setCompilerOutput(data.compilerOutput);

        const passedCount = data.passedTestCases || 0;
        const totalCount = data.totalTestCases || 0;

        if (data.verdict === 'Accepted') {
          toast.success(`Solution Accepted! All ${totalCount}/${totalCount} test cases passed.`);
        } else {
          toast.error(`Solution Rejected: ${data.verdict}. Passed ${passedCount}/${totalCount} test cases.`);
        }

        const failed = data.detailedResults.find(r => !r.passed);
        setOutput(failed ? failed.actual : (data.detailedResults[0]?.actual || "Execution Finished"));

        // Store to local submissions list
        const newSub = {
          code: answers[q._id].answer,
          language: answers[q._id].language,
          verdict: data.verdict,
          status: data.verdict,
          score: data.verdict === 'Accepted' ? 100 : 0,
          runtime: data.executionTime,
          memory: data.memoryUsed,
          submittedAt: new Date().toISOString()
        };
        const updatedHistory = [newSub, ...submissions];
        setSubmissions(updatedHistory);
        localStorage.setItem(`oa-history-${id}-${q._id}`, JSON.stringify(updatedHistory));
      } else {
        toast.error(data.message || "Failed to submit code");
      }
    } catch (e) {
      setIsRunning(false);
      setIsSubmitting(false);
      toast.error("Submission error");
    }
  };

  const submitAssessment = async (isAuto = false) => {
    if (!isAuto && !window.confirm('Submit Assessment?')) return;
    isNavigatingOrSubmitting.current = true;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        answers: Object.entries(answers).map(([qId, ans]) => ({
          questionId: qId,
          answer: ans.answer,
          language: ans.language
        }))
      };
      const res = await fetch(`${API_BASE}/api/oa/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("oaSubmission", JSON.stringify(data.submission));
        navigate(`/oa/${id}/submitted`);
      }
    } catch (err) { toast.error('Submission error'); }
    finally { setSubmitting(false); }
  };

  const logViolation = useCallback(async (eventType, description) => {
    toast.warning(`Proctoring Alert: ${eventType} - ${description}`, { duration: 5000 });
    console.warn(`[Proctoring Violation] Event: ${eventType}, Details: ${description}`);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/oa/${id}/log-violation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ eventType, description })
      });
      const data = await res.json();
      if (data.success) {
        const count = data.violationCount;
        setViolationCount(count);

        const isCritical = [
          "Tab switched",
          "Window unfocused",
          "Fullscreen exited",
          "Screen sharing stopped",
          "Internet disconnected"
        ].includes(eventType);

        if (isCritical) {
          if (count >= 5 || data.autoSubmitted) {
            toast.error("Maximum proctoring violations reached. Auto-submitting assessment...", { duration: 8000 });
            submitAssessment(true);
          } else {
            toast.error(`Warning: ${5 - count} critical violations remaining before automatic assessment submission!`, { duration: 6000 });
          }
        }
      }
    } catch (err) {
      console.error("Failed to log violation on backend:", err);
      const isCritical = [
        "Tab switched",
        "Window unfocused",
        "Fullscreen exited",
        "Screen sharing stopped",
        "Internet disconnected"
      ].includes(eventType);

      if (isCritical) {
        setViolationCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 5) {
            submitAssessment(true);
          }
          return newCount;
        });
      }
    }
  }, [id]);

  const cameraStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  useEffect(() => {
    cameraStreamRef.current = cameraStream;
  }, [cameraStream]);

  useEffect(() => {
    screenStreamRef.current = globalScreenStream;
  }, [globalScreenStream]);

  useEffect(() => {
    return () => {
      isNavigatingOrSubmitting.current = true;
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Start proctor streams once OA metadata is initialized
  useEffect(() => {
    if (!oa) return;

    const startProctoring = async () => {
      try {
        let media = cameraStream;
        const isCameraActive = media && media.getVideoTracks().length > 0 && media.getVideoTracks().every(t => t.readyState === 'live' && t.enabled);
        if (!isCameraActive) {
          console.log("[PROCTORING] Camera stream is inactive or missing. Requesting a fresh stream...");
          media = await navigator.mediaDevices.getUserMedia({ video: true });
          setCameraStream(media);
        }
        setProctorStream(media);

        let audioMedia = micStream;
        const isMicActive = audioMedia && audioMedia.getAudioTracks().length > 0 && audioMedia.getAudioTracks().every(t => t.readyState === 'live' && t.enabled);
        if (!isMicActive) {
          console.log("[PROCTORING] Mic stream is inactive or missing. Requesting a fresh stream...");
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMicStream(audioStream);
        }

        if (globalScreenStream) {
          console.log("[PROCTORING] Screen stream restored");
          setScreenStream(globalScreenStream);
        } else {
          console.warn("Screen stream is missing from global store!");
        }
      } catch (err) {
        toast.error("Proctoring streams failed to initialize. Please verify device permissions.");
      }
    };

    startProctoring();
  }, [oa, cameraStream, micStream, globalScreenStream, setCameraStream, setMicStream]);

  // Bind proctorStream to workspace preview ref
  useEffect(() => {
    const setupVideo = async () => {
      if (!proctorStream || !workspaceVideoRef.current) return;
      workspaceVideoRef.current.srcObject = proctorStream;
      try {
        await workspaceVideoRef.current.play();
        setVideoReady(true);
        console.log("[PROCTORING] Workspace video playing");
      } catch (err) {
        console.error("[PROCTORING] Workspace video play failed:", err);
      }
    };
    setupVideo();
  }, [proctorStream]);

  // Live face tracking for proctoring violations
  useEffect(() => {
    if (!proctorStream || !workspaceVideoRef.current || !videoReady) return;

    let trackerInstance = null;
    let isActive = true;

    const runFaceTracking = async () => {
      try {
        await loadTrackingScripts();
        if (!isActive) return;

        trackerInstance = startFaceTracking(workspaceVideoRef.current, (faces) => {
          if (!isActive) return;
          if (faces.length > 1) {
            const now = Date.now();
            if (now - lastMultiFaceViolationRef.current > 15000) {
              lastMultiFaceViolationRef.current = now;
              logViolation("Multiple faces detected", "More than one person was detected in the camera frame.");
            }
          } else if (faces.length === 0) {
            const now = Date.now();
            if (now - lastNoFaceViolationRef.current > 15000) {
              lastNoFaceViolationRef.current = now;
              logViolation("No face detected", "No face was detected in the camera frame.");
            }
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
    if (!proctorStream || !workspaceVideoRef.current || !videoReady) return;

    let isActive = true;
    let timerId = null;

    const performDeviceDetection = async () => {
      if (!isActive) return;

      try {
        const videoElement = workspaceVideoRef.current;
        if (videoElement.readyState >= 2 && !videoElement.paused && !videoElement.ended) {
          const canvas = document.createElement('canvas');
          canvas.width = videoElement.videoWidth || 640;
          canvas.height = videoElement.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            const base64Image = canvas.toDataURL('image/jpeg', 0.5);

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/api/oa/${id}/detect-devices`, {
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
                console.log(`[PROCTORING] Device detected: ${data.deviceName} - ${data.explanation}`);
                logViolation(
                  "Unauthorized device detected",
                  `An unauthorized device (${data.deviceName || "electronic device"}) was detected in the camera frame. Details: ${data.explanation}`
                );
              }
            }
          }
        }
      } catch (err) {
        console.error("Error during device detection proctoring:", err);
      }

      // Run every 15 seconds
      if (isActive) {
        timerId = setTimeout(performDeviceDetection, 15000);
      }
    };

    // Delay the first check by 5 seconds to let the candidate settle
    timerId = setTimeout(performDeviceDetection, 5000);

    return () => {
      isActive = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [proctorStream, videoReady, logViolation, id]);

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
      if (isNavigatingOrSubmitting.current) return;
      console.log("[PROCTORING] Screen sharing manually stopped");
      logViolation("Screen sharing stopped", "Candidate stopped sharing their screen feed.");
    };

    videoTrack.addEventListener('ended', handleEnded);
    return () => videoTrack.removeEventListener('ended', handleEnded);
  }, [screenStream, logViolation]);

  // 4. Tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation("Tab switched", "Candidate navigated away from the active assessment tab.");
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

  const handleLanguageChange = (newLang) => {
    const qId = questions[currentIdx]._id;
    const saved = localStorage.getItem(getStorageKey(qId, newLang));
    handleAnswer(saved || STARTER_TEMPLATES[newLang], newLang);
  };

  if (loading) return (
    <div className="h-screen w-full bg-[#0B1B3B] flex flex-col items-center justify-center gap-4">
      <Loader2 size={48} className="animate-spin text-orange-500" />
      <span className="text-white/50 font-black text-xs uppercase tracking-[0.3em]">Preparing Assessment Environment...</span>
    </div>
  );

  const currentQ = questions[currentIdx];
  const currentAns = answers[currentQ?._id] || { answer: '', language: 'javascript' };

  // Editor controls panel block
  const editorHeaderControls = (
    <div className="h-12 bg-[#090b11] border-b border-[#1e293b] px-4 flex items-center justify-between shrink-0 select-none text-slate-300">
      <div className="flex items-center gap-3">
        <select
          value={currentAns.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="bg-[#1a1c2e] border border-[#2b3052] rounded-xl px-3 py-1 text-white text-[10px] font-black uppercase tracking-widest outline-none hover:bg-[#252a47] transition-all cursor-pointer"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="c">C</option>
        </select>

        <div className="h-4 w-px bg-[#1e293b]" />

        {/* Font size selectors */}
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mr-1">Font</span>
          <button
            onClick={() => setFontSize(prev => Math.max(10, prev - 1))}
            className="w-5 h-5 rounded bg-[#1a1c2e] hover:bg-[#252a47] flex items-center justify-center text-xs font-bold transition-all border border-[#2b3052]"
          >
            -
          </button>
          <span className="text-xs font-mono font-bold w-4 text-center">{fontSize}</span>
          <button
            onClick={() => setFontSize(prev => Math.min(24, prev + 1))}
            className="w-5 h-5 rounded bg-[#1a1c2e] hover:bg-[#252a47] flex items-center justify-center text-xs font-bold transition-all border border-[#2b3052]"
          >
            +
          </button>
        </div>

        <div className="h-4 w-px bg-[#1e293b]" />

        {/* Minimap toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={minimapEnabled}
            onChange={(e) => setMinimapEnabled(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-7 h-3.5 rounded-full transition-colors ${minimapEnabled ? 'bg-orange-500' : 'bg-slate-700'}`} />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Minimap</span>
        </label>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
          className="p-1.5 bg-[#1a1c2e] border border-[#2b3052] rounded-lg text-slate-400 hover:text-white transition-all"
          title="Toggle Editor Theme"
        >
          {theme === 'vs-dark' ? <Moon size={14} /> : <Sun size={14} />}
        </button>

        <button
          onClick={() => {
            if (window.confirm("Reset editor to starter templates?")) {
              handleAnswer(STARTER_TEMPLATES[currentAns.language]);
            }
          }}
          className="p-1.5 bg-[#1a1c2e] border border-[#2b3052] rounded-lg text-slate-400 hover:text-white transition-all"
          title="Reset starter code"
        >
          <RotateCcw size={14} />
        </button>

        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="p-1.5 bg-[#1a1c2e] border border-[#2b3052] rounded-lg text-slate-400 hover:text-white transition-all"
          title="Toggle Fullscreen"
        >
          {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`h-screen w-full bg-[#090b11] flex flex-col overflow-hidden ${isFullScreen ? 'fixed inset-0 z-[9999]' : ''}`}>
      {/* Workspace Header */}
      <header className="h-14 bg-[#0B1B3B] border-b border-white/10 px-6 flex items-center justify-between shrink-0 select-none relative z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsNavOpen(!isNavOpen)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer flex items-center justify-center mr-1"
            title="Toggle Question Navigator"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Building2 className="text-white" size={16} />
            </div>
            <span className="text-white font-black text-sm tracking-tight">{oa?.title}</span>
          </div>
          {isSaving && <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase animate-pulse"><Save size={12} /> Saving...</div>}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <Clock size={14} className="text-orange-400" />
            <span className="text-orange-400 font-mono text-xs font-black tracking-widest">
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
          <button onClick={() => submitAssessment(false)} disabled={submitting} className="px-6 py-2 rounded-xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all disabled:opacity-50 shadow-lg shadow-orange-900/20">
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        </div>
      </header>

      {/* Floating Dropdown for Question Navigation */}
      {isNavOpen && (
        <div className="absolute left-6 top-16 w-80 max-h-[70vh] bg-[#090b11] border border-[#1e293b] rounded-3xl p-6 shadow-2xl z-[9999] overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-4 duration-200">
          <QuestionNavigator
            questions={questions}
            currentIdx={currentIdx}
            onSelect={(idx) => {
              setCurrentIdx(idx);
              setIsNavOpen(false);
            }}
            answers={Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v.answer]))}
            isApiMode={true}
          />
        </div>
      )}

      {/* Main assessment body */}
      <div className="flex-1 flex overflow-hidden">
        {/* WORKSPACE AREA */}
        <div className="flex-1 h-full flex flex-col bg-[#0a0c14] overflow-hidden relative">

          {/* HEADER NAV AND RUN/SUBMIT TRIGGERS */}
          {currentQ && (
            <div className="h-full flex flex-col">
              <div className="px-8 py-3 bg-[#0d0f19] border-b border-[#1e293b] flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-full bg-[#0B1B3B] text-white text-[10px] font-black uppercase tracking-widest border border-white/5">Question {currentIdx + 1}</span>
                  <span className="px-3 py-1 rounded-full bg-[#1e293b] text-slate-300 text-[10px] font-black uppercase tracking-widest">{currentQ.type}</span>
                  {currentQ.difficulty && (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${currentQ.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        currentQ.difficulty === 'Medium' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>{currentQ.difficulty}</span>
                  )}
                </div>

                {currentQ.type === 'coding' && (
                  <div className="flex items-center gap-2">
                    <button onClick={handleRun} disabled={isRunning} className="px-4 py-1.5 bg-[#1b1e36] text-orange-400 border border-orange-500/10 hover:bg-[#252a4e] rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                      <Play size={12} fill="currentColor" /> Run
                    </button>
                    <button onClick={handleQuestionSubmit} disabled={isRunning} className="px-4 py-1.5 bg-orange-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-orange-700 transition-all shadow-lg shadow-orange-950/20">
                      <Zap size={12} fill="currentColor" /> Submit
                    </button>
                  </div>
                )}
              </div>

              {/* MOBILE TABS HEADER FOR CODING QUESTIONS */}
              {isMobile && currentQ.type === 'coding' && (
                <div className="flex items-center justify-around bg-[#0a0d16] border-b border-[#1e293b] text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0 select-none">
                  <button
                    onClick={() => setActiveMobileTab('problem')}
                    className={`py-3 flex-1 text-center border-b-2 transition-all ${activeMobileTab === 'problem' ? 'text-orange-500 border-orange-500 bg-white/5' : 'border-transparent'}`}
                  >
                    Problem
                  </button>
                  <button
                    onClick={() => setActiveMobileTab('editor')}
                    className={`py-3 flex-1 text-center border-b-2 transition-all ${activeMobileTab === 'editor' ? 'text-orange-500 border-orange-500 bg-white/5' : 'border-transparent'}`}
                  >
                    Editor
                  </button>
                  <button
                    onClick={() => setActiveMobileTab('console')}
                    className={`py-3 flex-1 text-center border-b-2 transition-all ${activeMobileTab === 'console' ? 'text-orange-500 border-orange-500 bg-white/5' : 'border-transparent'}`}
                  >
                    Console
                  </button>
                </div>
              )}

              {/* WORKSPACE SHELL */}
              <div className="flex-1 overflow-hidden relative pb-20">
                {currentQ.type === 'coding' ? (
                  isMobile ? (
                    <div className="w-full h-full flex flex-col">
                      {activeMobileTab === 'problem' && (
                        <div className="flex-1 overflow-y-auto bg-white">
                          <ProblemPanel problem={currentQ} />
                        </div>
                      )}

                      {activeMobileTab === 'editor' && (
                        <div className="flex-1 flex flex-col overflow-hidden relative">
                          {editorHeaderControls}
                          <div className="flex-1 overflow-hidden relative">
                            <CodeEditor
                              code={currentAns.answer}
                              onChange={handleAnswer}
                              language={currentAns.language}
                              theme={theme}
                              fontSize={fontSize}
                              minimapEnabled={minimapEnabled}
                              onRun={handleRun}
                              onSubmit={handleQuestionSubmit}
                            />
                          </div>
                        </div>
                      )}

                      {activeMobileTab === 'console' && (
                        <div className="flex-1 overflow-hidden">
                          <OutputPanel
                            output={output}
                            verdict={verdict}
                            testCases={testCases}
                            isRunning={isRunning}
                            isSubmitting={isSubmitting}
                            executionMetrics={executionMetrics}
                            complexityEstimate={complexityEstimate}
                            compilerOutput={compilerOutput}
                            customInput={customInput}
                            setCustomInput={setCustomInput}
                            isCustomInputActive={isCustomInputActive}
                            setIsCustomInputActive={setIsCustomInputActive}
                            submissions={submissions}
                            onLoadSubmission={handleAnswer}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <WorkspaceLayout
                      leftPanel={
                        <div className="h-full bg-[#0b0f19] select-none">
                          <ProblemPanel problem={currentQ} />
                        </div>
                      }
                      rightTopPanel={
                        <div className="h-full flex flex-col overflow-hidden">
                          {editorHeaderControls}
                          <div className="flex-1 overflow-hidden relative">
                            <CodeEditor
                              code={currentAns.answer}
                              onChange={handleAnswer}
                              language={currentAns.language}
                              theme={theme}
                              fontSize={fontSize}
                              minimapEnabled={minimapEnabled}
                              onRun={handleRun}
                              onSubmit={handleQuestionSubmit}
                            />
                          </div>
                        </div>
                      }
                      rightBottomPanel={
                        <div className="h-full overflow-hidden">
                          <OutputPanel
                            output={output}
                            verdict={verdict}
                            testCases={testCases}
                            isRunning={isRunning}
                            isSubmitting={isSubmitting}
                            executionMetrics={executionMetrics}
                            complexityEstimate={complexityEstimate}
                            compilerOutput={compilerOutput}
                            customInput={customInput}
                            setCustomInput={setCustomInput}
                            isCustomInputActive={isCustomInputActive}
                            setIsCustomInputActive={setIsCustomInputActive}
                            submissions={submissions}
                            onLoadSubmission={handleAnswer}
                          />
                        </div>
                      }
                      isFullScreen={isFullScreen}
                    />
                  )
                ) : (
                  // MCQ Render View
                  <div className="p-12 max-w-3xl mx-auto space-y-8 overflow-y-auto h-full custom-scrollbar pb-32">
                    <div className="bg-[#0d0f19] rounded-[2.5rem] p-10 border border-[#1e293b] text-left">
                      <h2 className="text-2xl font-black text-white mb-10 leading-tight">{currentQ.title}</h2>
                      <div className="space-y-4">
                        {currentQ.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleAnswer(opt)}
                            className={`w-full p-6 rounded-2xl border text-left flex items-center gap-5 transition-all group ${currentAns.answer === opt
                                ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-950/20'
                                : 'bg-[#111322] text-slate-300 border-[#1e293b] hover:border-slate-700 hover:bg-[#15172b]'
                              }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${currentAns.answer === opt ? 'bg-white/10 text-white' : 'bg-[#1b1e36] text-slate-400 group-hover:text-orange-500'
                              }`}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <span className="font-bold text-sm tracking-tight">{opt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Question Footer Navigation Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-[#090b11] border-t border-[#1e293b] flex items-center justify-between z-30 select-none">
                  <button
                    onClick={handlePrev}
                    disabled={currentIdx === 0}
                    className="px-6 py-2 rounded-xl bg-[#111322] border border-[#1e293b] text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-[#161a30] transition-all disabled:opacity-30 flex items-center gap-2"
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Question {currentIdx + 1} of {questions.length}</span>
                  </div>

                  {currentIdx === questions.length - 1 ? (
                    <button
                      onClick={() => submitAssessment(false)}
                      className="px-8 py-2 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/15"
                    >
                      <CheckCircle2 size={16} /> Submit Assessment
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="px-8 py-2 rounded-xl bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all flex items-center gap-2 shadow-lg shadow-orange-950/25"
                    >
                      Next Question <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sleek Floating Proctoring Status Panel */}
      {proctorStream && (
        <div className="fixed bottom-24 right-6 w-44 h-32 rounded-3xl bg-[#090b11]/80 backdrop-blur-md border border-white/10 overflow-hidden shadow-2xl z-[9999] transition-all hover:scale-105">
          <video
            ref={workspaceVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            onPlay={() => setVideoReady(true)}
            onPause={() => setVideoReady(false)}
          />
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#090b11]/60 backdrop-blur-sm border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
            <span className="text-[8px] font-black uppercase text-slate-300 tracking-wider">AI Proctor Live</span>
          </div>
          {violationCount > 0 && (
            <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-xl bg-red-600/90 text-white text-[8px] font-black uppercase tracking-widest animate-pulse border border-red-500/20">
              {violationCount} Violations
            </div>
          )}
        </div>
      )}
      {showInstructionModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 select-none">
          <div className="w-full max-w-md rounded-[2rem] border border-red-500/20 bg-[#0d0f19] p-8 shadow-2xl shadow-red-950/20 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/50 text-red-500 border border-red-500/20">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-slate-100 mb-4 tracking-tight">Proctoring Rules Agreement</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
              Switching tabs, leaving the window, or stopping screen sharing will be considered a violation. If you exceed the allowed violations, your assessment will be <span className="text-red-400 font-bold">automatically submitted immediately</span>.
            </p>
            <button
              onClick={() => {
                setShowInstructionModal(false);
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
              className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-600/20 transition-all cursor-pointer"
            >
              I Understand & Agree
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OAWorkspace;
