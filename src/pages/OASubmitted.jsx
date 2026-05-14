import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, BarChart3, LayoutDashboard, AlertCircle } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import GradientButton from '../components/GradientButton';

const OASubmitted = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("oaSubmission");
    if (stored) {
      try {
        setSubmission(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse submission info");
      }
    }
  }, []);

  // Resolve assessmentId based on priority requirements
  const assessmentId = id || 
                       submission?.submission?.oaTest || 
                       submission?.oaTest || 
                       submission?.submission?.oaTest?._id || 
                       submission?.oaTest?._id;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-20 flex flex-col items-center text-center space-y-8">
        <div className="relative">
          <div className="w-32 h-32 bg-green-50 rounded-[3rem] flex items-center justify-center border border-green-100 animate-in zoom-in duration-700">
            <CheckCircle2 size={64} className="text-green-500" />
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg animate-bounce">
            <span className="font-black">✓</span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-[#0B1B3B] tracking-tight">
            Assessment Submitted!
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-lg mx-auto leading-relaxed">
            Congratulations! Your assessment has been successfully received and is now being evaluated by our systems.
          </p>
        </div>

        {!assessmentId && (
          <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-center gap-4 text-red-600">
            <AlertCircle size={24} />
            <p className="font-bold">Assessment ID is missing.</p>
          </div>
        )}

        <div className="bg-orange-50 p-8 rounded-[2.5rem] border border-orange-100 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Submission Details</span>
            <span className="text-[10px] font-bold text-orange-600 uppercase">
              ID: #{submission?.submission?._id?.slice(-6) || submission?._id?.slice(-6) || 'N/A'}
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">Status</span>
              <span className="text-sm font-black text-green-600">
                Evaluation Complete
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">Score Earned</span>
              <span className="text-sm font-black text-[#0B1B3B]">
                {submission?.submission?.score ?? submission?.score ?? 0} Points
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">Proctoring</span>
              <span className="text-sm font-black text-blue-600">Verified ✅</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
          <GradientButton 
            className={`w-full !py-4 ${!assessmentId ? 'opacity-50 cursor-not-allowed' : ''}`} 
            onClick={() => assessmentId && navigate(`/oa/${assessmentId}/report`)}
            disabled={!assessmentId}
          >
            <BarChart3 size={18} />
            View Performance Report
          </GradientButton>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 rounded-xl border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <LayoutDashboard size={18} />
            Back to Dashboard
          </button>
        </div>

        <p className="text-xs text-slate-400 font-medium italic">
          Your official report has been generated and added to your performance dashboard.
        </p>
      </div>
    </MainLayout>
  );
};

export default OASubmitted;
