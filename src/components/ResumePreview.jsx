import React from 'react';
import { CheckCircle2, FileText, Code2, Briefcase, ExternalLink } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const ResumePreview = ({ data, resumeUrl }) => {
  // Use real data from localStorage if data prop is not provided
  const skills = data?.skills || JSON.parse(localStorage.getItem('extractedSkills') || '[]');
  const projects = data?.projects || JSON.parse(localStorage.getItem('extractedProjects') || '[]');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Resume Link / Status */}
      {resumeUrl ? (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-orange-900/5 border border-orange-100/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
              <FileText size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-[#0B1B3B] uppercase tracking-widest">Resume Uploaded</h4>
              <p className="text-xs text-slate-400 font-medium tracking-tighter uppercase font-black">Ready for AI Analysis</p>
            </div>
            <a
              href={`${API_BASE}${resumeUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1B3B] text-white text-xs font-bold hover:bg-[#050d1d] transition-all"
            >
              <ExternalLink size={14} /> View Resume
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-orange-900/5 border border-orange-100/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
              <FileText size={24} />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#0B1B3B] uppercase tracking-widest">No Resume Uploaded</h4>
              <p className="text-xs text-slate-400 font-medium">Upload your resume to get started.</p>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Skills — only shown when data is available */}
      {skills.length > 0 && (
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
            {skills.map((skill, idx) => (
              <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 group hover:border-orange-200 transition-all">
                <CheckCircle2 size={14} className="text-green-500" />
                <span className="text-sm font-bold text-slate-600">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Projects — only shown when data is available */}
      {projects.length > 0 && (
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
            {projects.map((project, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all">
                <h5 className="font-bold text-[#0B1B3B] mb-1">{typeof project === 'string' ? project : project.name}</h5>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {typeof project === 'string' ? 'Project identified from your resume' : project.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
