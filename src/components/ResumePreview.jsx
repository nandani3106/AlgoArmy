import React from 'react';
import { CheckCircle2, FileText, Code2, Briefcase } from 'lucide-react';

const ResumePreview = ({ data }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-orange-900/5 border border-orange-100/50">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
            <Code2 size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black text-[#0B1B3B] uppercase tracking-widest">Extracted Skills</h4>
            <p className="text-xs text-slate-400 font-medium tracking-tighter uppercase font-black">Identified by AlgoAI</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {data.skills.map((skill, idx) => (
            <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 group hover:border-orange-200 transition-all">
              <CheckCircle2 size={14} className="text-green-500" />
              <span className="text-sm font-bold text-slate-600">{skill}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-orange-900/5 border border-orange-100/50">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Briefcase size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black text-[#0B1B3B] uppercase tracking-widest">Extracted Projects</h4>
            <p className="text-xs text-slate-400 font-medium tracking-tighter uppercase font-black">Professional Experience</p>
          </div>
        </div>

        <div className="space-y-4">
          {data.projects.map((project, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all">
              <h5 className="font-bold text-[#0B1B3B] mb-1">{project.name}</h5>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">{project.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
