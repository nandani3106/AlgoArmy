import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Upload,
  ChevronLeft,
  FileText,
  CheckCircle2,
  Zap,
  ArrowRight,
  X,
  RotateCcw
} from 'lucide-react';

import MainLayout from '../components/MainLayout';
import GradientButton from '../components/GradientButton';
import ResumePreview from '../components/ResumePreview';

const API_BASE = 'http://localhost:5000';

const ResumeUpload = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(false);

  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeData, setResumeData] = useState({
    skills: [],
    projects: [],
    questions: [],
  });

  const [error, setError] = useState('');

  useEffect(() => {
    const savedSkills = JSON.parse(localStorage.getItem('extractedSkills') || '[]');
    const savedProjects = JSON.parse(localStorage.getItem('extractedProjects') || '[]');
    const savedQuestions = JSON.parse(localStorage.getItem('generatedQuestions') || '[]');
    const savedResumeUrl = localStorage.getItem('resumeUrl') || '';

    if (savedSkills.length || savedProjects.length) {
      setResumeData({
        skills: savedSkills,
        projects: savedProjects,
        questions: savedQuestions,
      });
      setResumeUrl(savedResumeUrl);
      if (questions.length === 0) {
        throw new Error('No interview questions were generated.');
      }

      setParsed(true);
    }
  }, []);

  const handleUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setParsing(true);
    setParsed(false);
    setError('');

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      // STEP 1: Upload Resume
      const formData = new FormData();
      formData.append('resume', uploadedFile);

      const uploadResponse = await fetch(`${API_BASE}/api/resume/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadData.success) {
        throw new Error(uploadData.message || 'Resume upload failed');
      }

      const uploadedResumeUrl = uploadData.resumeUrl;
      setResumeUrl(uploadedResumeUrl);
      localStorage.setItem('resumeUrl', uploadedResumeUrl);

      // STEP 2: Parse Resume + Generate Questions
      const parseResponse = await fetch(`${API_BASE}/api/interview-ai/generate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const parseData = await parseResponse.json();

      if (!parseResponse.ok || !parseData.success) {
        throw new Error(parseData.message || 'AI analysis failed');
      }

      const skills = parseData.skills || [];
      const projects = parseData.projects || [];
      const questions = parseData.questions || [];
      console.log('Questions from API:', parseData.questions);

      setResumeData({
        skills,
        projects,
        questions,
      });

      // Save to localStorage
      localStorage.setItem('extractedSkills', JSON.stringify(skills));
      localStorage.setItem('extractedProjects', JSON.stringify(projects));
      localStorage.setItem('generatedQuestions', JSON.stringify(questions));
      console.log('Generated Questions:', questions);

      setParsed(true);
    } catch (err) {
      console.error('Resume Processing Error:', err);
      setError(err.message || 'Something went wrong');
      setParsed(false);
    } finally {
      setParsing(false);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();

    setFile(null);
    setParsed(false);
    setParsing(false);
    setError('');
    setResumeUrl('');
    setResumeData({
      skills: [],
      projects: [],
      questions: [],
    });

    localStorage.removeItem('resumeUrl');
    localStorage.removeItem('extractedSkills');
    localStorage.removeItem('extractedProjects');
    localStorage.removeItem('generatedQuestions');
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <button
          onClick={() => navigate('/interviews')}
          className="flex items-center gap-2 text-slate-500 hover:text-[#0B1B3B] font-bold transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Interviews
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Upload Section */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-orange-900/5 border border-orange-100/50">
              <h2 className="text-2xl font-black text-[#0B1B3B] mb-4">
                Upload Resume
              </h2>

              <p className="text-slate-500 text-sm font-medium mb-8">
                Upload your real resume and extract actual skills and projects.
              </p>

              {!file ? (
                <div className="relative group">
                  <input
                    type="file"
                    onChange={handleUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept=".pdf"
                  />
                  <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center group-hover:border-orange-500/50 group-hover:bg-orange-50/30 transition-all">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
                      <Upload size={32} />
                    </div>
                    <p className="font-bold text-[#0B1B3B] mb-2">
                      Drag & Drop Resume
                    </p>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
                      Supported: PDF
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 relative">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0B1B3B] rounded-xl flex items-center justify-center text-white">
                      <FileText size={24} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#0B1B3B] truncate">
                        {file.name}
                      </p>
                    </div>

                    {!parsing && (
                      <button onClick={removeFile}>
                        <X size={20} />
                      </button>
                    )}
                  </div>

                  {parsing && (
                    <div className="mt-4 text-orange-600 font-bold">
                      Analyzing your resume...
                    </div>
                  )}

                  {parsed && !parsing && (
                    <div className="mt-4 flex items-center gap-2 text-green-600 font-bold">
                      <CheckCircle2 size={16} />
                      Resume analyzed successfully
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 text-red-600 font-bold text-sm">
                      {error}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-12 pt-8 border-t border-slate-50 space-y-4">
                {parsed && (
                  <button
                    onClick={() => {
                      setFile(null);
                      setParsed(false);
                    }}
                    className="w-full py-4 rounded-xl border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest"
                  >
                    <RotateCcw size={16} className="inline mr-2" />
                    Re-upload Resume
                  </button>
                )}

                <GradientButton
                  className="w-full !py-4"
                  disabled={!parsed}
                  onClick={() =>
                    navigate(`/interviews/${id}/instructions`)
                  }
                >
                  Continue to Instructions
                  <ArrowRight size={18} />
                </GradientButton>
              </div>
            </div>

            <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 flex gap-4 items-start">
              <Zap className="text-orange-600 shrink-0" size={20} />
              <p className="text-xs text-orange-800 font-bold leading-relaxed italic">
                Real skills and projects will be extracted directly from your uploaded resume.
              </p>
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-7">
            {parsed ? (
              <ResumePreview
                data={resumeData}
                resumeUrl={resumeUrl}
              />
            ) : (
              <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-center p-12 text-slate-400 opacity-50">
                <FileText size={64} strokeWidth={1} className="mb-6" />
                <h3 className="text-xl font-black uppercase tracking-widest">
                  Resume Preview
                </h3>
                <p className="text-sm font-medium mt-2">
                  Upload your resume to extract real skills and projects.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ResumeUpload;