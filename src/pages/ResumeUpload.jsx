import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, ChevronLeft, FileText, CheckCircle2, Zap, ArrowRight, X, RotateCcw } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import GradientButton from '../components/GradientButton';
import ResumePreview from '../components/ResumePreview';
import { MOCK_RESUME_DATA } from '../data/interviewData';

const ResumeUpload = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(false);

  const handleUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setParsing(true);
      setParsed(false);
      
      // Simulate analysis with progress
      setTimeout(() => {
        setParsing(false);
        setParsed(true);
      }, 2500);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setParsed(false);
    setParsing(false);
  };

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Back Button */}
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
              <h2 className="text-2xl font-black text-[#0B1B3B] mb-4">Upload Resume</h2>
              <p className="text-slate-500 text-sm font-medium mb-8">
                Our AI will analyze your resume to tailor the interview questions specifically to your experience.
              </p>

              {!file ? (
                <div className="relative group">
                  <input 
                    type="file" 
                    onChange={handleUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    accept=".pdf,.docx"
                  />
                  <div className="border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center group-hover:border-orange-500/50 group-hover:bg-orange-50/30 transition-all">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6 transition-transform group-hover:scale-110">
                      <Upload size={32} />
                    </div>
                    <p className="font-bold text-[#0B1B3B] mb-2">Drag & Drop Resume</p>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Supported: PDF, DOCX</p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 relative group animate-in zoom-in duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#0B1B3B] rounded-xl flex items-center justify-center text-white">
                      <FileText size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#0B1B3B] truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    {!parsing && (
                      <button onClick={removeFile} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <X size={20} />
                      </button>
                    )}
                  </div>
                  
                  {parsing && (
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 animate-pulse">Analyzing Content...</span>
                        <span className="text-[10px] font-bold text-slate-400">AlgoAI Parsing</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 animate-progress" />
                      </div>
                    </div>
                  )}

                  {parsed && !parsing && (
                    <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl border border-green-100 animate-in fade-in slide-in-from-top-2">
                      <CheckCircle2 size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Parsing Complete</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-12 pt-8 border-t border-slate-50 space-y-4">
                {parsed && (
                  <button 
                    onClick={() => { setFile(null); setParsed(false); }}
                    className="w-full py-4 rounded-xl border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Re-upload Resume
                  </button>
                )}
                <GradientButton 
                  className="w-full !py-4" 
                  disabled={!parsed}
                  onClick={() => navigate(`/interviews/${id}/instructions`)}
                >
                  Continue to Instructions
                  <ArrowRight size={18} />
                </GradientButton>
              </div>
            </div>

            <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100 flex gap-4 items-start">
              <Zap className="text-orange-600 shrink-0" size={20} />
              <p className="text-xs text-orange-800 font-bold leading-relaxed italic">
                Pro Tip: Ensure your resume highlights the key technologies mentioned in the job description for a more accurate interview simulation.
              </p>
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-7">
            {parsed ? (
              <ResumePreview data={MOCK_RESUME_DATA} />
            ) : (
              <div className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center text-center p-12 text-slate-400 opacity-50 transition-all">
                <FileText size={64} strokeWidth={1} className="mb-6" />
                <h3 className="text-xl font-black uppercase tracking-widest">Resume Preview</h3>
                <p className="text-sm font-medium mt-2">Upload your resume to see the extracted skills and projects here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ResumeUpload;
