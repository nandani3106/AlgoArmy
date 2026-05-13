import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import DashboardCard from '../components/DashboardCard';
import GradientButton from '../components/GradientButton';
import {
  Upload, FileText, X, CheckCircle, ChevronRight,
  Code2, Briefcase, Target, Zap, Brain
} from 'lucide-react';

const MOCK_SKILLS = ['C++', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'SQL', 'Python', 'Tailwind CSS', 'Git', 'Docker'];
const MOCK_PROJECTS = [
  { title: 'AlgoArmy', desc: 'Recruitment platform with AI interviews and coding contests' },
  { title: 'Traveloop', desc: 'AI-powered travel planning with real-time booking' },
  { title: 'Expense Tracker', desc: 'Finance dashboard with receipt OCR and budgeting' },
];
const MOCK_FOCUS = ['Data Structures & Algorithms', 'Full Stack Development', 'Project Architecture', 'Database Design'];

const InterviewList = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setParsing(true);
      setParsed(false);
      setTimeout(() => { setParsing(false); setParsed(true); }, 2500);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      setParsing(true);
      setParsed(false);
      setTimeout(() => { setParsing(false); setParsed(true); }, 2500);
    }
  };

  const resetFile = () => { setFile(null); setParsing(false); setParsed(false); };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-10 pb-12">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0B1B3B] p-10 md:p-16 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Brain size={22} className="text-orange-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-orange-400">AI-Powered</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
              AI Interview Based on <span className="text-orange-400">Your Resume</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Upload your resume and get interview questions tailored to your skills, projects, and experience. Our AI analyzes your background to create a personalized mock interview.
            </p>
          </div>
        </div>

        {/* Upload Area */}
        {!file ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="relative border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center bg-white shadow-xl shadow-orange-900/5 hover:border-orange-400 transition-all group cursor-pointer"
          >
            <input type="file" accept=".pdf,.docx" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload size={36} className="text-orange-500" />
              </div>
              <h3 className="text-xl font-black text-[#0B1B3B] mb-2">Drop your resume here</h3>
              <p className="text-sm text-slate-500 mb-6">or click to browse • PDF, DOCX supported</p>
              <div className="flex items-center gap-4">
                <span className="px-4 py-1.5 rounded-full bg-slate-50 text-xs font-bold text-slate-400 border border-slate-100">PDF</span>
                <span className="px-4 py-1.5 rounded-full bg-slate-50 text-xs font-bold text-slate-400 border border-slate-100">DOCX</span>
              </div>
            </div>
          </div>
        ) : (
          <DashboardCard className="!p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#0B1B3B] flex items-center justify-center text-white">
                  <FileText size={28} />
                </div>
                <div>
                  <p className="font-bold text-[#0B1B3B]">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button onClick={resetFile} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Progress Bar */}
            {parsing && (
              <div className="space-y-3">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full animate-progress"></div>
                </div>
                <p className="text-xs text-slate-500 font-bold text-center">Analyzing resume with AI...</p>
              </div>
            )}

            {parsed && (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-100">
                <CheckCircle size={20} className="text-green-600" />
                <span className="text-sm font-bold text-green-700">Resume analyzed successfully!</span>
              </div>
            )}
          </DashboardCard>
        )}

        {/* Analysis Results */}
        {parsed && (
          <div className="space-y-8">
            {/* Skills */}
            <DashboardCard title="Extracted Skills" icon={Code2}>
              <div className="flex flex-wrap gap-2">
                {MOCK_SKILLS.map((skill, i) => (
                  <span key={i} className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                    i % 3 === 0 ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    i % 3 === 1 ? 'bg-orange-50 text-orange-600 border-orange-100' :
                    'bg-green-50 text-green-600 border-green-100'
                  }`}>{skill}</span>
                ))}
              </div>
            </DashboardCard>

            {/* Projects */}
            <DashboardCard title="Detected Projects" icon={Briefcase}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MOCK_PROJECTS.map((proj, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <h4 className="font-bold text-[#0B1B3B] mb-1">{proj.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{proj.desc}</p>
                  </div>
                ))}
              </div>
            </DashboardCard>

            {/* Focus Areas */}
            <DashboardCard title="Suggested Interview Focus" icon={Target}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_FOCUS.map((area, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                      <Zap size={16} />
                    </div>
                    <span className="text-sm font-bold text-[#0B1B3B]">{area}</span>
                  </div>
                ))}
              </div>
            </DashboardCard>

            {/* CTA */}
            <div className="flex justify-center pt-4">
              <GradientButton className="!w-auto !px-16 !py-5 !text-base" onClick={() => navigate('/interviews/instructions')}>
                Start AI Interview <ChevronRight size={20} />
              </GradientButton>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default InterviewList;
