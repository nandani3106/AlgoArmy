import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Shield, ChevronLeft, Play, Loader2, Award, Info, RefreshCw, AlertTriangle
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import GradientButton from '../components/GradientButton';
import PermissionChecklist from '../components/PermissionChecklist';
import BrandLogo from '../components/BrandLogo';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000';

const OAPermissionCheck = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const [checking, setChecking] = useState(false);
  const [oa, setOa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stream, setStream] = useState(null);

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
    const fetchOA = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/oa/${id}`);
        const data = await response.json();
        if (data.success) {
          setOa(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch OA info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOA();
  }, [id]);

  // Live video preview ref management
  useEffect(() => {
    if (permissions.camera === 'granted') {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(str => {
          setStream(str);
          if (videoRef.current) {
            videoRef.current.srcObject = str;
          }
        })
        .catch(err => {
          console.error("Camera preview load error:", err);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [permissions.camera]);

  const handleRequestPermission = async (permId) => {
    if (permId === 'camera' || permId === 'mic') {
      setPermissions(prev => ({ ...prev, camera: 'checking', mic: 'checking' }));
      try {
        const str = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        str.getTracks().forEach(t => t.stop());
        setPermissions(prev => ({ ...prev, camera: 'granted', mic: 'granted' }));
        toast.success("Camera and Microphone access granted successfully!");
      } catch (err) {
        setPermissions(prev => ({ ...prev, camera: 'denied', mic: 'denied' }));
        toast.error("Camera or Microphone permission was denied.");
      }
    } else if (permId === 'screen') {
      setPermissions(prev => ({ ...prev, screen: 'checking' }));
      try {
        const str = await navigator.mediaDevices.getDisplayMedia({ video: true });
        str.getTracks().forEach(t => t.stop());
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
    // 1. Camera & Mic
    try {
      setPermissions(prev => ({ ...prev, camera: 'checking', mic: 'checking' }));
      const str = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      str.getTracks().forEach(t => t.stop());
      setPermissions(prev => ({ ...prev, camera: 'granted', mic: 'granted' }));
    } catch (e) {
      setPermissions(prev => ({ ...prev, camera: 'denied', mic: 'denied' }));
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

    toast.info("Media diagnostics completed. Please grant Screen Sharing and Fullscreen permissions manually using the checklist actions.");
    setChecking(false);
  };

  const getBrowserAndOS = () => {
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    let os = "Unknown OS";

    if (ua.indexOf("Firefox") > -1) browser = "Firefox";
    else if (ua.indexOf("Chrome") > -1) browser = "Chrome";
    else if (ua.indexOf("Safari") > -1) browser = "Safari";
    else if (ua.indexOf("Edge") > -1) browser = "Edge";

    if (ua.indexOf("Windows") > -1) os = "Windows";
    else if (ua.indexOf("Mac") > -1) os = "macOS";
    else if (ua.indexOf("Linux") > -1) os = "Linux";
    else if (ua.indexOf("Android") > -1) os = "Android";
    else if (ua.indexOf("iPhone") > -1) os = "iOS";

    return { browser, os };
  };

  const handleStartAssessment = async () => {
    const { browser, os } = getBrowserAndOS();
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/oa/${id}/log-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          permissions,
          browser,
          os,
          timestamp: new Date()
        })
      });
      navigate(`/oa/${id}/workspace`);
    } catch (err) {
      console.error("Failed to log setup verification:", err);
      navigate(`/oa/${id}/workspace`);
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

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
            <div className="absolute">
              <BrandLogo size="sm" showText={false} clickable={false} />
            </div>
          </div>
          <p className="text-slate-500 font-bold animate-pulse text-xs uppercase tracking-widest mt-2">Initializing System Check...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Back Button */}
        <button 
          onClick={() => navigate(`/oa/${id}`)}
          className="flex items-center gap-2 text-slate-500 hover:text-[#0B1B3B] font-bold transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Instructions
        </button>

        <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-orange-900/5 border border-orange-100/50">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-orange-100">
              <Shield size={40} className="text-orange-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#0B1B3B] mb-4">
              System Permission Check
            </h1>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              We need to verify your hardware and environment settings to ensure a fair assessment for <span className="text-[#0B1B3B] font-bold">{oa?.company || 'Recruiter'}</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Diagnostics checklist */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-md font-black text-[#0B1B3B] uppercase tracking-widest">
                  Device Checklist
                </h3>
                <div className="text-right">
                  <span className="text-xs font-black text-orange-600 block">{progressPercent}% Completed</span>
                  <span className="text-[10px] text-slate-400 font-bold block">{passedChecks} of {totalChecks} checks verified</span>
                </div>
              </div>
              
              {/* Progress Bar */}
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

            {/* Right Column: Camera feedback, troubleshooting, buttons */}
            <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-8">
              {/* Live Webcam Box */}
              <div className="bg-slate-900 rounded-[2.5rem] p-4 text-white overflow-hidden shadow-2xl relative border-4 border-slate-950 aspect-video flex flex-col items-center justify-center group">
                {permissions.camera === 'granted' ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover rounded-2xl absolute inset-0"
                  />
                ) : (
                  <div className="text-center p-6 space-y-3 z-10">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2 text-slate-400">
                      <Shield size={24} />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-300">Camera Feed Off</p>
                    <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                      Your live video stream will render here once camera permission is granted.
                    </p>
                  </div>
                )}
                {permissions.camera === 'granted' && (
                  <span className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500 text-white text-[9px] font-black uppercase tracking-widest shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> Live Preview
                  </span>
                )}
              </div>

              {/* Troubleshooting Tips */}
              <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 space-y-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-[#0B1B3B] uppercase tracking-wider flex items-center gap-2">
                    <Info size={16} className="text-orange-500" /> Troubleshooting Tips
                  </h4>
                  <ul className="text-[11px] text-slate-500 leading-relaxed font-medium space-y-3 pl-1">
                    <li className="flex gap-2">
                      <span className="text-orange-500 font-bold">•</span>
                      <span>If access fails, verify that other webapps (Zoom, Meets) are completely closed.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500 font-bold">•</span>
                      <span>Allow notifications to prompt to receive live assessment synchronization warnings.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-orange-500 font-bold">•</span>
                      <span>Chrome or Microsoft Edge browser is highly recommended for complete proctoring compatibility.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <GradientButton 
                    className="w-full !py-4 flex items-center justify-center gap-2" 
                    onClick={runChecks}
                    disabled={checking}
                  >
                    <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
                    {checking ? 'Running Diagnostics...' : 'Run Auto-Checks'}
                  </GradientButton>
                  
                  <button 
                    disabled={!mandatoryPassed}
                    onClick={handleStartAssessment}
                    className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      mandatoryPassed
                        ? 'bg-[#0B1B3B] text-white hover:bg-slate-800 shadow-xl shadow-navy-900/20' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Play size={14} fill="currentColor" />
                    Start Assessment
                  </button>
                  
                  {!mandatoryPassed && (
                    <div className="flex gap-2 p-3 bg-red-500/5 border border-red-500/10 rounded-2xl">
                      <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold text-red-500/80 leading-relaxed">
                        Please grant all mandatory permissions (Camera, Mic, Screen sharing, Fullscreen and Internet) to enable the Start Assessment trigger.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OAPermissionCheck;
