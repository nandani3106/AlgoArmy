import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import DashboardCard from '../components/DashboardCard';
import GradientButton from '../components/GradientButton';
import PermissionChecklist from '../components/PermissionChecklist';
import BrandLogo from '../components/BrandLogo';
import { 
  ChevronLeft, Camera, Mic, Wifi, Volume2, Shield, 
  Brain, Target, MessageSquare, Zap, Briefcase, Loader2, RefreshCw, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { loadTrackingScripts, startFaceTracking } from '../utils/faceTracking';
import { useProctoring } from '../contexts/ProctoringContext';

const CRITERIA = [
  { icon: Brain, label: 'Technical Knowledge', desc: 'DSA, system design, and core concepts' },
  { icon: Briefcase, label: 'Project Explanation', desc: 'Clarity in describing your work' },
  { icon: MessageSquare, label: 'Communication', desc: 'Structured and articulate responses' },
  { icon: Zap, label: 'Problem Solving', desc: 'Analytical thinking and approach' },
];

const API_BASE = 'http://localhost:5000';

const InterviewInstructions = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [preparing, setPreparing] = useState(true);
  const [checking, setChecking] = useState(false);
  const videoRef = useRef(null);
  const consecutiveFramesRef = useRef(0);
  const [stream, setStream] = useState(null);
  const [micStream, setMicStream] = useState(null);
  const [faceStatus, setFaceStatus] = useState('');
  const [videoReady, setVideoReady] = useState(false);

  const {
    cameraStream, setCameraStream,
    micStream: globalMicStream, setMicStream: setGlobalMicStream,
    screenStream, setScreenStream
  } = useProctoring();

  const streamRef = useRef(null);
  const micStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const isProceedingToRoom = useRef(false);

  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  useEffect(() => {
    micStreamRef.current = micStream;
  }, [micStream]);

  useEffect(() => {
    screenStreamRef.current = screenStream;
  }, [screenStream]);

  const [permissions, setPermissions] = useState({
    camera: 'pending',
    mic: 'pending',
    screen: 'pending',
    notifications: 'pending',
    clipboard: 'pending',
    fullscreen: 'pending',
    internet: 'pending',
    tabVisibility: 'pending',
    windowFocus: 'pending'
  });

  useEffect(() => {
    const prepareSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setPreparing(true);
        // 1. Trigger fresh question regeneration for this session
        // This ensures the user gets DIFFERENT questions every time they start
        const regenRes = await fetch(`${API_BASE}/api/interview-ai/regenerate`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        const regenData = await regenRes.json();

        if (regenData.success) {
          localStorage.setItem("generatedQuestions", JSON.stringify(regenData.questions));
        }

        // 2. Sync profile data (skills/projects)
        const profileRes = await fetch(`${API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profileData = await profileRes.json();

        if (profileData.success && profileData.user) {
          localStorage.setItem("extractedSkills", JSON.stringify(profileData.user.skills || []));
          localStorage.setItem("extractedProjects", JSON.stringify(profileData.user.projects || []));
        }
      } catch (err) {
        console.error('Session preparation failed:', err);
        toast.error("Failed to prepare interview session. Please try again.");
      } finally {
        setPreparing(false);
      }
    };

    prepareSession();
  }, [navigate]);

  // Live video preview ref management
  useEffect(() => {
    const setupVideo = async () => {
      if (!stream || !videoRef.current) return;

      videoRef.current.srcObject = stream;

      try {
        await videoRef.current.play();
        setVideoReady(true);
        console.log("Video Ready");
      } catch (err) {
        console.error(err);
      }
    };

    setupVideo();
  }, [stream]);

  // Clean up stream on unmount ONLY if we are NOT proceeding to the room
  useEffect(() => {
    return () => {
      const isGoingToRoom = window.location.pathname.includes('/room') || isProceedingToRoom.current;
      if (!isGoingToRoom) {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
        }
        if (micStreamRef.current) {
          micStreamRef.current.getTracks().forEach(t => t.stop());
        }
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(t => t.stop());
          setScreenStream(null);
        }
        setCameraStream(null);
        setGlobalMicStream(null);
      }
    };
  }, [setScreenStream, setCameraStream, setGlobalMicStream]);

  // Face tracking hook
  useEffect(() => {
    if (!stream || !videoRef.current || !videoReady) return;
    console.log(
      "Face Tracking Started",
      {
        stream: !!stream,
        videoReady
      }
    );

    let trackerInstance = null;
    let isActive = true;

    // Reset stable frames on start
    consecutiveFramesRef.current = 0;

    const runFaceDetection = async () => {
      try {
        setFaceStatus('Loading face detector...');
        await loadTrackingScripts();
        if (!isActive) return;

        setFaceStatus('Looking for face...');
        trackerInstance = startFaceTracking(videoRef.current, (faces) => {
          if (!isActive) return;
          const faceCount = faces.length;
          console.log(`Current face count: ${faceCount}`);

          if (faceCount === 1) {
            consecutiveFramesRef.current += 1;
            const stableCount = consecutiveFramesRef.current;
            console.log(`Stable frame count: ${stableCount}`);

             if (stableCount >= 30) {
              setFaceStatus('Face verified!');
              console.log("Verification success");
              setPermissions(prev => {
                if (prev.camera !== 'granted') {
                  toast.success("Face verified! Camera access granted successfully.");
                  return { ...prev, camera: 'granted' };
                }
                return prev;
              });
            } else {
              setFaceStatus(`Hold still for verification (${stableCount}/30)`);
              setPermissions(prev => {
                if (prev.camera !== 'checking') {
                  return { ...prev, camera: 'checking' };
                }
                return prev;
              });
            }
          } else {
            consecutiveFramesRef.current = 0;
            console.log("Stable frame count: 0");

            if (faceCount === 0) {
              setFaceStatus('No face detected');
            } else {
              setFaceStatus('Multiple faces detected');
            }

            setPermissions(prev => {
              if (prev.camera !== 'checking') {
                return { ...prev, camera: 'checking' };
              }
              return prev;
            });
          }
        });
      } catch (err) {
        console.error("Face detection error:", err);
        setFaceStatus('Detection error');
      }
    };

    runFaceDetection();

    return () => {
      isActive = false;
      if (trackerInstance) {
        trackerInstance.stop();
      }
    };
  }, [stream, videoReady]);

  const handleRequestPermission = async (permId) => {
    if (permId === 'camera') {
      setPermissions(prev => ({ ...prev, camera: 'checking' }));
      setVideoReady(false);
      try {
        if (stream) {
          stream.getVideoTracks().forEach(t => t.stop());
        }
        const str = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(str);
        setCameraStream(str);
        toast.info("Camera active. Align your face to complete verification.");
      } catch (err) {
        setPermissions(prev => ({ ...prev, camera: 'denied' }));
        toast.error("Camera permission was denied.");
      }
    } else if (permId === 'mic') {
      setPermissions(prev => ({ ...prev, mic: 'checking' }));
      try {
        if (micStream) {
          micStream.getAudioTracks().forEach(t => t.stop());
        }
        const str = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicStream(str);
        setGlobalMicStream(str);
        setPermissions(prev => ({ ...prev, mic: 'granted' }));
        toast.success("Microphone permission granted successfully.");
      } catch (err) {
        setPermissions(prev => ({ ...prev, mic: 'denied' }));
        toast.error("Microphone permission was denied.");
      }
    } else if (permId === 'screen') {
      setPermissions(prev => ({ ...prev, screen: 'checking' }));
      try {
        const str = await navigator.mediaDevices.getDisplayMedia({ video: true });
        
        const track = str.getVideoTracks()[0];
        const settings = track ? track.getSettings() : {};
        const displaySurface = settings.displaySurface;

        console.log(`[SCREEN] displaySurface: ${displaySurface}`);

        if (displaySurface !== 'monitor') {
          str.getTracks().forEach(t => t.stop());
          setPermissions(prev => ({ ...prev, screen: 'denied' }));
          toast.error("Please share your entire screen. Browser tabs and application windows are not allowed.");
          return;
        }

        setScreenStream(str);
        setPermissions(prev => ({ ...prev, screen: 'granted' }));
        toast.success("Screen capture sharing granted successfully!");
      } catch (err) {
        setPermissions(prev => ({ ...prev, screen: 'denied' }));
        toast.error("Screen sharing was cancelled or denied.");
      }
    } else if (permId === 'fullscreen') {
      setPermissions(prev => ({ ...prev, fullscreen: 'checking' }));
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
        setPermissions(prev => ({ ...prev, fullscreen: 'granted' }));
        toast.success("Full-screen mode granted!");
      } catch (err) {
        setPermissions(prev => ({ ...prev, fullscreen: 'denied' }));
        toast.error("Failed to request full-screen mode. Please click again.");
      }
    } else if (permId === 'notifications') {
      setPermissions(prev => ({ ...prev, notifications: 'checking' }));
      try {
        const res = await Notification.requestPermission();
        setPermissions(prev => ({ ...prev, notifications: res === 'granted' ? 'granted' : 'denied' }));
        if (res === 'granted') toast.success("Notifications enabled!");
      } catch (err) {
        setPermissions(prev => ({ ...prev, notifications: 'denied' }));
      }
    } else if (permId === 'clipboard') {
      setPermissions(prev => ({ ...prev, clipboard: 'checking' }));
      try {
        await navigator.clipboard.readText();
        setPermissions(prev => ({ ...prev, clipboard: 'granted' }));
        toast.success("Clipboard read verification granted!");
      } catch (err) {
        setPermissions(prev => ({ ...prev, clipboard: 'granted' })); // Optional pass
      }
    } else if (permId === 'internet') {
      setPermissions(prev => ({ ...prev, internet: 'checking' }));
      setTimeout(() => {
        setPermissions(prev => ({ ...prev, internet: navigator.onLine ? 'granted' : 'denied' }));
      }, 600);
    } else if (permId === 'tabVisibility') {
      setPermissions(prev => ({ ...prev, tabVisibility: 'checking' }));
      setTimeout(() => {
        setPermissions(prev => ({ ...prev, tabVisibility: document.visibilityState === 'visible' ? 'granted' : 'denied' }));
      }, 600);
    } else if (permId === 'windowFocus') {
      setPermissions(prev => ({ ...prev, windowFocus: 'checking' }));
      setTimeout(() => {
        setPermissions(prev => ({ ...prev, windowFocus: document.hasFocus() ? 'granted' : 'denied' }));
      }, 600);
    }
  };

  const runChecks = async () => {
    setChecking(true);
    setVideoReady(false);
    // 1. Camera
    try {
      setPermissions(prev => ({ ...prev, camera: 'checking' }));
      if (stream) {
        stream.getVideoTracks().forEach(t => t.stop());
      }
      const str = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(str);
      setCameraStream(str);
    } catch (e) {
      setPermissions(prev => ({ ...prev, camera: 'denied' }));
    }

    // 1b. Mic
    try {
      setPermissions(prev => ({ ...prev, mic: 'checking' }));
      if (micStream) {
        micStream.getAudioTracks().forEach(t => t.stop());
      }
      const str = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(str);
      setGlobalMicStream(str);
      setPermissions(prev => ({ ...prev, mic: 'granted' }));
    } catch (e) {
      setPermissions(prev => ({ ...prev, mic: 'denied' }));
    }

    // 2. Notifications
    try {
      setPermissions(prev => ({ ...prev, notifications: 'checking' }));
      const res = await Notification.requestPermission();
      setPermissions(prev => ({ ...prev, notifications: res === 'granted' ? 'granted' : 'denied' }));
    } catch (e) {
      setPermissions(prev => ({ ...prev, notifications: 'denied' }));
    }

    // 3. Auto passive parameters
    setPermissions(prev => ({
      ...prev,
      internet: navigator.onLine ? 'granted' : 'denied',
      tabVisibility: document.visibilityState === 'visible' ? 'granted' : 'denied',
      windowFocus: document.hasFocus() ? 'granted' : 'denied'
    }));

    // 4. Clipboard read
    try {
      setPermissions(prev => ({ ...prev, clipboard: 'checking' }));
      await navigator.clipboard.readText();
      setPermissions(prev => ({ ...prev, clipboard: 'granted' }));
    } catch (e) {
      setPermissions(prev => ({ ...prev, clipboard: 'granted' }));
    }

    toast.info("Diagnostics initialized. Align your face to complete camera check.");
    setChecking(false);
  };

  const handleStartInterview = () => {
    isProceedingToRoom.current = true;
    if (id && id !== 'instructions') {
      navigate(`/interviews/${id}/room`);
    } else {
      navigate('/interviews/room');
    }
  };

  const mandatoryPassed = 
    permissions.camera === 'granted' &&
    permissions.mic === 'granted' &&
    permissions.screen === 'granted' &&
    permissions.fullscreen === 'granted' &&
    permissions.internet === 'granted';

  const totalChecks = Object.keys(permissions).length;
  const passedChecks = Object.values(permissions).filter(p => p === 'granted').length;
  const progressPercent = Math.round((passedChecks / totalChecks) * 100);

  if (preparing) return (
    <MainLayout>
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-20 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <div className="absolute">
            <BrandLogo size="sm" showText={false} clickable={false} />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black text-[#0B1B3B] uppercase tracking-widest">Preparing Your Session</h2>
          <p className="text-sm text-slate-500 font-medium">AI is generating a unique set of progressive questions for you...</p>
        </div>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-10 pb-12">

        {/* Header */}
        <div className="space-y-2">
          <button onClick={() => navigate('/interviews')} className="flex items-center gap-2 text-slate-500 hover:text-[#0B1B3B] font-bold transition-colors group">
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Interviews
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-[#0B1B3B] tracking-tight">
            Before You Begin
          </h1>
          <p className="text-slate-500 font-medium">Your customized interview session is ready.</p>
        </div>

        {/* Real-time Readiness Checks */}
        <DashboardCard title="System Readiness Diagnostics" icon={Shield}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-orange-600 tracking-wider uppercase">System Diagnostics Check</span>
                <span className="text-xs text-slate-400 font-bold">{passedChecks} of {totalChecks} passed</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <PermissionChecklist 
                permissions={permissions} 
                onRequestPermission={handleRequestPermission}
              />
            </div>
            
            <div className="lg:col-span-5 space-y-6">
              {/* Webcam Live Stream Box */}
              <div className="bg-slate-900 rounded-[2rem] p-4 text-white overflow-hidden shadow-2xl relative border-4 border-slate-950 aspect-video flex flex-col items-center justify-center group">
                {(permissions.camera === 'granted' || permissions.camera === 'checking') && stream ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover rounded-xl absolute inset-0"
                    onPlay={() => setVideoReady(true)}
                    onPause={() => setVideoReady(false)}
                  />
                ) : (
                  <div className="text-center p-4 space-y-2 z-10">
                    <Shield size={24} className="text-slate-500 mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Camera Feed Idle</p>
                  </div>
                )}
                {permissions.camera === 'checking' && faceStatus && (
                  <div className="absolute top-4 right-4 z-20 bg-orange-600/90 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg animate-pulse">
                    {faceStatus}
                  </div>
                )}
                {(permissions.camera === 'granted' || permissions.camera === 'checking') && stream && (
                  <span className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500 text-white text-[8px] font-black uppercase tracking-widest shadow-md">
                    <span className="w-1 h-1 rounded-full bg-white animate-ping" /> Live Preview
                  </span>
                )}
              </div>
              
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                <h4 className="text-xs font-black text-[#0B1B3B] uppercase tracking-wider flex items-center gap-2">
                  <Volume2 size={16} className="text-orange-500" /> Proctor Instructions
                </h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Make sure you have stable internet connection and you are in a quiet, distraction-free environment.
                </p>
                <GradientButton 
                  className="w-full !py-3 flex items-center justify-center gap-2" 
                  onClick={runChecks}
                  disabled={checking}
                >
                  <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
                  {checking ? 'Testing Hardware...' : 'Run Auto Diagnostics'}
                </GradientButton>
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* Evaluation Criteria */}
        <DashboardCard title="Evaluation Criteria" icon={Target}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CRITERIA.map((c, i) => (
              <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <c.icon size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0B1B3B]">{c.label}</p>
                  <p className="text-xs text-slate-500">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Guidelines */}
        <DashboardCard title="Quick Tips">
          <div className="space-y-3">
            {[
              'Speak clearly and at a natural pace.',
              'Structure your answers using the STAR method when applicable.',
              'It\'s okay to take a moment to think before answering.',
              'Be specific about your role and contributions in projects.',
              'The interview will last approximately 20-30 minutes.',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 text-xs font-black mt-0.5">{i + 1}</div>
                <p className="text-sm text-slate-600 font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-4 pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <GradientButton variant="outline" className="!w-auto !px-10" onClick={() => navigate('/interviews')}>
              <ChevronLeft size={18} /> Go Back
            </GradientButton>
            <button
              disabled={!mandatoryPassed}
              onClick={handleStartInterview}
              className={`w-full sm:w-auto px-16 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                mandatoryPassed
                  ? 'bg-[#0B1B3B] text-white hover:bg-slate-800 shadow-xl shadow-navy-900/20' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Start Interview
            </button>
          </div>
          
          {!mandatoryPassed && (
            <div className="flex gap-2 p-3 bg-red-500/5 border border-red-500/10 rounded-2xl max-w-md">
              <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-red-500/80 leading-relaxed text-center">
                Please grant all mandatory permissions (Camera, Mic, Screen sharing, Fullscreen and Internet) to enable the Start Interview trigger.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default InterviewInstructions;
