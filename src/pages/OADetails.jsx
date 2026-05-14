import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, BookOpen, Calendar, Shield, AlertCircle, 
  ChevronLeft, Building2, Layout, Zap, CheckCircle, Loader2
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import GradientButton from '../components/GradientButton';
import DashboardCard from '../components/DashboardCard';

const API_BASE = 'http://localhost:5000';

const OADetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [oa, setOa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchOADetails = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/oa/${id}`);
        const data = await response.json();
        
        if (data.success) {
          setOa(data.data);
        } else {
          setError(data.message || 'Failed to fetch assessment details');
        }
      } catch (err) {
        setError('Network error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOADetails();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="text-orange-500 animate-spin" size={48} />
          <p className="text-slate-500 font-bold animate-pulse">Loading Assessment Details...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !oa) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center border border-red-100">
            <AlertCircle size={40} className="text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-[#0B1B3B]">Unable to load details</h3>
            <p className="text-slate-500 font-medium max-w-md">{error || 'Assessment not found'}</p>
          </div>
          <button 
            onClick={() => navigate('/oa')}
            className="px-8 py-3 bg-[#0B1B3B] text-white rounded-xl font-bold hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/10"
          >
            Back to List
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/oa')}
          className="flex items-center gap-2 text-slate-500 hover:text-[#0B1B3B] font-bold transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Assessments
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-orange-900/5 border border-orange-100/50">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100">
                  <Building2 size={14} className="text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#0B1B3B]">
                    {oa.company || 'TechNova Solutions'}
                  </span>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${
                  oa.status === 'live' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                }`}>
                  {oa.status}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-[#0B1B3B] mb-6 leading-tight">
                {oa.title}
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed mb-10">
                {oa.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</p>
                  <p className="font-bold text-[#0B1B3B]">{oa.durationMinutes} Mins</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Questions</p>
                  <p className="font-bold text-[#0B1B3B]">{oa.totalQuestions || 'Multiple'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Difficulty</p>
                  <p className="font-bold text-[#0B1B3B]">{oa.difficulty}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</p>
                  <p className="font-black text-orange-600">Company OA</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <DashboardCard title="Instructions & Rules" icon={Shield}>
              <div className="prose prose-slate max-w-none">
                <div className="whitespace-pre-line text-slate-600 font-medium leading-relaxed">
                  {oa.instructions || "1. Ensure a stable internet connection.\n2. Once started, the timer cannot be paused.\n3. Each MCQ carries specified points.\n4. Read each question carefully before answering."}
                </div>
              </div>
              <div className="mt-8 p-6 bg-orange-50 rounded-2xl flex gap-4 items-center border border-orange-100">
                <AlertCircle className="text-orange-600 shrink-0" size={24} />
                <p className="text-xs text-orange-800 font-bold leading-relaxed">
                  Proctoring is enabled for this assessment. Ensure your camera and microphone are working correctly before starting.
                </p>
              </div>
            </DashboardCard>
          </div>

          {/* Sidebar Action Column */}
          <div className="lg:col-span-4 space-y-8">
            <DashboardCard className="!p-8 bg-[#0B1B3B] text-white">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20">
                  <Shield size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-black mb-2">Proctored Assessment</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Before you begin, we need to verify your system and permissions.
                </p>
                <div className="w-full space-y-3">
                  <GradientButton 
                    className="w-full !py-4 shadow-xl shadow-orange-500/20" 
                    onClick={() => navigate(`/oa/${id}/permissions`)}
                    disabled={oa.status !== 'live'}
                  >
                    {oa.status === 'live' ? 'Check Permissions' : 'Test Not Live'}
                  </GradientButton>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-4">
                    Est. Duration: {oa.durationMinutes} Mins
                  </p>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Recruiter Notes" icon={Building2}>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                "We are looking for candidates with strong fundamental knowledge and practical problem-solving skills. Please explain your logic clearly in the coding section."
              </p>
            </DashboardCard>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OADetails;
