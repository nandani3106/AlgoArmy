import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import DashboardCard from '../components/DashboardCard';
import GradientButton from '../components/GradientButton';
import {
  Upload, FileText, X, CheckCircle, ChevronRight,
  Code2, Briefcase, Target, Zap, Brain, Trash2, RefreshCw,
  ExternalLink, AlertCircle, Loader2
} from 'lucide-react';

const API_BASE = 'http://localhost:5000';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const MOCK_SKILLS = ['C++', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'SQL', 'Python', 'Tailwind CSS', 'Git', 'Docker'];
const MOCK_PROJECTS = [
  { title: 'AlgoArmy', desc: 'Recruitment platform with AI interviews and coding contests' },
  { title: 'Traveloop', desc: 'AI-powered travel planning with real-time booking' },
  { title: 'Expense Tracker', desc: 'Finance dashboard with receipt OCR and budgeting' },
];
const MOCK_FOCUS = ['Data Structures & Algorithms', 'Full Stack Development', 'Project Architecture', 'Database Design'];

const InterviewList = () => {
  const navigate = useNavigate();

  // Resume state
  const [file, setFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [fetchingResume, setFetchingResume] = useState(true);

  // Extracted data state
  const [skills, setSkills] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('extractedSkills') || '[]');
    } catch {
      return [];
    }
  });
  const [projects, setProjects] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('extractedProjects') || '[]');
    } catch {
      return [];
    }
  });

  // Helper — handle 401/403 by clearing auth and redirecting
  const handleAuthError = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Helper — get token or redirect
  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return null;
    }
    return token;
  };

  // ── On mount: fetch existing resume ──────────────────────────
  useEffect(() => {
    const fetchResume = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/api/resume`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 403) {
          handleAuthError();
          return;
        }

        const data = await res.json();
        if (data.success && data.resumeUrl) {
          setResumeUrl(data.resumeUrl);
          setUploaded(true);
        }
      } catch (err) {
        console.error('Failed to fetch resume:', err);
      } finally {
        setFetchingResume(false);
      }
    };

    fetchResume();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── File selection handler ───────────────────────────────────
  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setError('');

    // Validate PDF only
    if (f.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      return;
    }

    // Validate size
    if (f.size > MAX_FILE_SIZE) {
      setError('File size must be under 5 MB.');
      return;
    }

    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;

    setError('');

    if (f.type !== 'application/pdf') {
      setError('Only PDF files are accepted.');
      return;
    }

    if (f.size > MAX_FILE_SIZE) {
      setError('File size must be under 5 MB.');
      return;
    }

    setFile(f);
  };

  // ── Upload resume ───────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;

    const token = getToken();
    if (!token) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch(`${API_BASE}/api/resume/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.status === 401 || res.status === 403) {
        handleAuthError();
        return;
      }

      const data = await res.json();

      if (data.success) {
        setResumeUrl(data.resumeUrl);
        setUploaded(true);
        setFile(null);

        // Update localStorage user object with latest data
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        // Trigger AI analysis after successful upload
        await handleAnalyze(token);
      } else {
        setError(data.message || 'Upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setUploading(false);
    }
  };

  // ── AI Analysis ─────────────────────────────────────────────
  const handleAnalyze = async (token) => {
    setAnalyzing(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/interview-ai/generate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        const extractedSkills = data.skills || [];
        const extractedProjects = data.projects || [];
        const questions = data.questions || [];

        setSkills(extractedSkills);
        setProjects(extractedProjects);

        localStorage.setItem('extractedSkills', JSON.stringify(extractedSkills));
        localStorage.setItem('extractedProjects', JSON.stringify(extractedProjects));
        localStorage.setItem('generatedQuestions', JSON.stringify(questions));
      } else {
        setError(data.message || 'AI extraction failed, but your resume is saved.');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze resume. Please try again or continue with default settings.');
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Delete resume ───────────────────────────────────────────
  const handleDelete = async () => {
    const token = getToken();
    if (!token) return;

    setDeleting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/resume`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        handleAuthError();
        return;
      }

      const data = await res.json();

      if (data.success) {
        setResumeUrl('');
        setUploaded(false);
        setFile(null);
        setSkills([]);
        setProjects([]);
        localStorage.removeItem('extractedSkills');
        localStorage.removeItem('extractedProjects');
        localStorage.removeItem('generatedQuestions');

        // Clear resumeUrl from localStorage user
        try {
          const storedUser = JSON.parse(localStorage.getItem('user'));
          if (storedUser) {
            storedUser.resumeUrl = '';
            localStorage.setItem('user', JSON.stringify(storedUser));
          }
        } catch (_) { /* ignore parse errors */ }
      } else {
        setError(data.message || 'Delete failed. Please try again.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setDeleting(false);
    }
  };

  // ── Reset file selection (before upload) ────────────────────
  const resetFile = () => {
    setFile(null);
    setError('');
  };

  // Whether the "Start Interview" button should be enabled
  const canStartInterview = !!resumeUrl;

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

        {/* Loading state while fetching resume on mount */}
        {fetchingResume && (
          <div className="flex items-center justify-center gap-3 p-8">
            <Loader2 size={24} className="text-orange-500 animate-spin" />
            <span className="text-sm font-bold text-slate-500">Checking for existing resume...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100">
            <AlertCircle size={20} className="text-red-500 shrink-0" />
            <span className="text-sm font-bold text-red-700">{error}</span>
            <button onClick={() => setError('')} className="ml-auto p-1 text-red-400 hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        )}

        {/* ── Already uploaded: show resume status ───────────── */}
        {!fetchingResume && uploaded && resumeUrl && !file && (
          <DashboardCard className="!p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                  <CheckCircle size={28} />
                </div>
                <div>
                  <p className="font-bold text-[#0B1B3B]">Resume uploaded successfully</p>
                  <p className="text-xs text-slate-500">Your resume is ready for the AI interview</p>
                </div>
              </div>
              <a
                href={`${API_BASE}${resumeUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1B3B] text-white text-xs font-bold hover:bg-[#050d1d] transition-all"
              >
                <ExternalLink size={14} /> View Resume
              </a>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => { setUploaded(false); setResumeUrl(''); }}
                disabled={deleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all"
              >
                <RefreshCw size={14} /> Replace Resume
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100 transition-all"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleting ? 'Deleting...' : 'Delete Resume'}
              </button>
            </div>
          </DashboardCard>
        )}

        {/* ── Upload Area (no resume yet, or replacing) ──────── */}
        {!fetchingResume && !uploaded && !file && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="relative border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center bg-white shadow-xl shadow-orange-900/5 hover:border-orange-400 transition-all group cursor-pointer"
          >
            <input type="file" accept=".pdf" onChange={handleFile} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload size={36} className="text-orange-500" />
              </div>
              <h3 className="text-xl font-black text-[#0B1B3B] mb-2">Drop your resume here</h3>
              <p className="text-sm text-slate-500 mb-6">or click to browse • PDF only (max 5 MB)</p>
              <div className="flex items-center gap-4">
                <span className="px-4 py-1.5 rounded-full bg-slate-50 text-xs font-bold text-slate-400 border border-slate-100">PDF</span>
              </div>
            </div>
          </div>
        )}

        {/* ── File selected, ready to upload ──────────────────── */}
        {!fetchingResume && file && (
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
              {!uploading && (
                <button onClick={resetFile} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all">
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-3">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full animate-progress"></div>
                </div>
                <p className="text-xs text-slate-500 font-bold text-center">Uploading resume...</p>
              </div>
            )}

            {/* Upload Button */}
            {!uploading && (
              <div className="flex items-center gap-3">
                <GradientButton className="!w-auto !px-10 !py-3 !text-sm" onClick={handleUpload}>
                  <Upload size={16} /> Upload Resume
                </GradientButton>
                <span className="text-xs text-slate-400">PDF only • Max 5 MB</span>
              </div>
            )}
          </DashboardCard>
        )}

        {/* Analysis Results — shown when resume is uploaded or if we have cached data */}
        {!fetchingResume && (uploaded || skills.length > 0 || projects.length > 0) && (
          <div className="space-y-8">
            {/* Skills */}
            <DashboardCard title="Extracted Skills" icon={Code2}>
              {analyzing ? (
                <div className="flex items-center gap-3 py-4">
                  <Loader2 size={18} className="text-orange-500 animate-spin" />
                  <span className="text-sm font-bold text-slate-500">Analyzing your resume and extracting skills...</span>
                </div>
              ) : skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span key={i} className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                      i % 3 === 0 ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      i % 3 === 1 ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      'bg-green-50 text-green-600 border-green-100'
                    }`}>{skill}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic font-medium">Upload your resume to see extracted skills and projects.</p>
              )}
            </DashboardCard>

            {/* Projects */}
            <DashboardCard title="Extracted Projects" icon={Briefcase}>
              {analyzing ? (
                <div className="flex items-center gap-3 py-4">
                  <Loader2 size={18} className="text-orange-500 animate-spin" />
                  <span className="text-sm font-bold text-slate-500">Analyzing your resume and extracting skills...</span>
                </div>
              ) : projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {projects.map((proj, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                      <h4 className="font-bold text-[#0B1B3B] mb-1">{proj}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">Project identified from your resume</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic font-medium">Upload your resume to see extracted skills and projects.</p>
              )}
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
              <GradientButton
                className="!w-auto !px-16 !py-5 !text-base"
                disabled={!canStartInterview || analyzing}
                onClick={() => navigate('/interviews/instructions')}
              >
                {analyzing ? 'Analyzing Resume...' : 'Start AI Interview'} <ChevronRight size={20} />
              </GradientButton>
            </div>
          </div>
        )}

        {/* CTA (disabled) when no resume is uploaded and no cached results */}
        {!fetchingResume && !uploaded && skills.length === 0 && projects.length === 0 && (
          <div className="flex justify-center pt-4">
            <GradientButton
              className="!w-auto !px-16 !py-5 !text-base"
              disabled={true}
            >
              Start AI Interview <ChevronRight size={20} />
            </GradientButton>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default InterviewList;
