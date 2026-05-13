import React from 'react';
import { Camera, Mic, Monitor, Wifi, Maximize, CheckCircle2, AlertCircle } from 'lucide-react';

const PermissionChecklist = ({ permissions }) => {
  const items = [
    { id: 'camera', label: 'Camera Access', icon: Camera },
    { id: 'mic', label: 'Microphone Access', icon: Mic },
    { id: 'screen', label: 'Screen Sharing', icon: Monitor },
    { id: 'internet', label: 'Stable Internet', icon: Wifi },
    { id: 'fullscreen', label: 'Full-screen Mode', icon: Maximize },
  ];

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isGranted = permissions[item.id];
        return (
          <div key={item.id} className="bg-white p-5 rounded-3xl border border-orange-100/50 flex items-center justify-between group hover:border-orange-500/30 transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                isGranted ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'
              }`}>
                <item.icon size={24} />
              </div>
              <div>
                <h4 className="font-bold text-[#0B1B3B]">{item.label}</h4>
                <p className="text-xs text-slate-500 font-medium">Required for proctoring</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
              isGranted ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
            }`}>
              {isGranted ? (
                <>
                  <CheckCircle2 size={14} />
                  Granted
                </>
              ) : (
                <>
                  <AlertCircle size={14} />
                  Pending
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PermissionChecklist;
