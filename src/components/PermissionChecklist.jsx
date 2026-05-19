import React from 'react';
import { 
  Camera, Mic, Monitor, Wifi, Maximize, Bell, Clipboard, Eye, AppWindow,
  CheckCircle2, AlertTriangle, HelpCircle, RefreshCw, XCircle
} from 'lucide-react';

const PermissionChecklist = ({ permissions, onRequestPermission }) => {
  const items = [
    { 
      id: 'camera', 
      label: 'Camera Access', 
      description: 'Used to verify face presence and identity during the assessment.',
      icon: Camera, 
      mandatory: true,
      actionLabel: 'Allow Camera'
    },
    { 
      id: 'mic', 
      label: 'Microphone Access', 
      description: 'Monitors audio environments to verify noise boundaries.',
      icon: Mic, 
      mandatory: true,
      actionLabel: 'Allow Microphone'
    },
    { 
      id: 'screen', 
      label: 'Screen Sharing', 
      description: 'Monitors screen output and secondary display boundaries.',
      icon: Monitor, 
      mandatory: true,
      actionLabel: 'Share Screen'
    },
    { 
      id: 'fullscreen', 
      label: 'Full-screen Mode', 
      description: 'Maintains focus inside the browser assessment view.',
      icon: Maximize, 
      mandatory: true,
      actionLabel: 'Enter Fullscreen'
    },
    { 
      id: 'internet', 
      label: 'Stable Internet', 
      description: 'Ensures live submission streaming and sync reliability.',
      icon: Wifi, 
      mandatory: true,
      actionLabel: 'Verify Link'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      description: 'Required to issue live alert pings.',
      icon: Bell, 
      mandatory: false,
      actionLabel: 'Enable Alert'
    },
    { 
      id: 'clipboard', 
      label: 'Clipboard Access', 
      description: 'Checks copy-paste security violations.',
      icon: Clipboard, 
      mandatory: false,
      actionLabel: 'Enable Clipboard'
    },
    { 
      id: 'tabVisibility', 
      label: 'Tab Visibility', 
      description: 'Ensures you stay on the active browser tab.',
      icon: Eye, 
      mandatory: false,
      actionLabel: 'Verify Tab'
    },
    { 
      id: 'windowFocus', 
      label: 'Window Focus', 
      description: 'Ensures you stay focused on the assessment workspace.',
      icon: AppWindow, 
      mandatory: false,
      actionLabel: 'Verify Focus'
    }
  ];

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const status = permissions[item.id] || 'pending';
        
        let statusBadge = (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider">
            <HelpCircle size={12} /> Pending
          </span>
        );
        if (status === 'checking') {
          statusBadge = (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider animate-pulse">
              <RefreshCw size={12} className="animate-spin" /> Checking
            </span>
          );
        } else if (status === 'granted') {
          statusBadge = (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-wider">
              <CheckCircle2 size={12} /> Granted
            </span>
          );
        } else if (status === 'denied') {
          statusBadge = (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider">
              <XCircle size={12} /> Denied
            </span>
          );
        }

        return (
          <div key={item.id} className={`bg-white p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md ${
            status === 'granted' ? 'border-green-100 hover:border-green-300' :
            status === 'denied' ? 'border-red-100 hover:border-red-300' : 'border-slate-100 hover:border-orange-100'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                status === 'granted' ? 'bg-green-50 text-green-600' :
                status === 'denied' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'
              }`}>
                <item.icon size={24} />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[#0B1B3B] text-sm">{item.label}</h4>
                  {item.mandatory && (
                    <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/10">Required</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-sm">{item.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:self-center shrink-0">
              {status !== 'granted' && (
                <button
                  onClick={() => onRequestPermission(item.id)}
                  disabled={status === 'checking'}
                  className="px-3.5 py-1.5 rounded-xl border border-orange-200 text-orange-500 hover:bg-orange-50 disabled:opacity-50 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  {status === 'checking' ? 'Testing...' : item.actionLabel}
                </button>
              )}
              {statusBadge}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PermissionChecklist;
