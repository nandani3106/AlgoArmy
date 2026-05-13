import React from 'react';
import { Camera, Mic, Monitor, Shield, AlertTriangle } from 'lucide-react';

const ProctoringPanel = ({ warnings = 0 }) => {
  return (
    <div className="h-full bg-slate-900 text-white flex flex-col font-sans">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <Shield size={18} className="text-orange-400" />
          <span className="font-black uppercase tracking-widest text-[10px] text-slate-400">Proctoring Active</span>
        </div>

        {/* Webcam Placeholder */}
        <div className="aspect-video bg-black/40 rounded-2xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
          <Camera size={32} className="text-white/20 group-hover:text-orange-500/40 transition-all" />
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Live</span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <Mic size={16} className="text-green-400" />
              <span className="text-xs font-bold">Microphone</span>
            </div>
            <span className="text-[10px] font-black uppercase text-green-400">On</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-3">
              <Monitor size={16} className="text-green-400" />
              <span className="text-xs font-bold">Screen Share</span>
            </div>
            <span className="text-[10px] font-black uppercase text-green-400">Active</span>
          </div>
        </div>

        {/* Warnings Section */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-red-500" />
            <h4 className="text-xs font-black uppercase tracking-widest text-red-500">Activity Warnings</h4>
          </div>
          <div className={`p-6 rounded-2xl border text-center transition-all ${
            warnings > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/10'
          }`}>
            <p className="text-3xl font-black mb-1">{warnings}</p>
            <p className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Total Infractions</p>
          </div>
          <p className="text-[10px] text-slate-500 mt-4 leading-relaxed italic text-center">
            Multiple warnings may lead to automatic disqualification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProctoringPanel;
