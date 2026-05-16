import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import DashboardCard from '../components/DashboardCard';
import GradientButton from '../components/GradientButton';
import { 
  ChevronLeft, Camera, Mic, Wifi, Volume2, Shield, 
  Brain, Target, MessageSquare, Zap, Briefcase, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const CRITERIA = [
  { icon: Brain, label: 'Technical Knowledge', desc: 'DSA, system design, and core concepts' },
  { icon: Briefcase, label: 'Project Explanation', desc: 'Clarity in describing your work' },
  { icon: MessageSquare, label: 'Communication', desc: 'Structured and articulate responses' },
  { icon: Zap, label: 'Problem Solving', desc: 'Analytical thinking and approach' },
];

const API_BASE = 'http://localhost:5000';

const InterviewInstructions = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [preparing, setPreparing] = useState(true);

  React.useEffect(() => {
    const prepareSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setPreparing(true);
        // 1. Trigger fresh question regeneration for this session
        // This ensures the user gets DIFFERENT questions every time they start
        const regenRes = await fetch(`${API_BASE}/api/interview-ai/regenerate`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        const regenData = await regenRes.json();

        if (regenData.success) {
          localStorage.setItem("generatedQuestions", JSON.stringify(regenData.questions));
        }

        // 2. Sync profile data (skills/projects)
        const profileRes = await fetch(`${API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const profileData = await profileRes.json();

        if (profileData.success && profileData.user) {
          localStorage.setItem("extractedSkills", JSON.stringify(profileData.user.skills || []));
          localStorage.setItem("extractedProjects", JSON.stringify(profileData.user.projects || []));
        }
      } catch (err) {
        console.error('Session preparation failed:', err);
        toast.error("Failed to prepare interview session. Please try again.");
      } finally {
        setPreparing(false);
      }
    };

    prepareSession();
  }, [navigate]);

  const handleStartInterview = () => {
    if (id && id !== 'instructions') {
      navigate(`/interviews/${id}/room`);
    } else {
      navigate('/interviews/room');
    }
  };

  if (preparing) return (
    <MainLayout>
      <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <Brain className="absolute inset-0 m-auto text-orange-500" size={32} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black text-[#0B1B3B] uppercase tracking-widest">Preparing Your Session</h2>
          <p className="text-sm text-slate-500 font-medium">AI is generating a unique set of progressive questions for you...</p>
        </div>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-10 pb-12">

        {/* Header */}
        <div className="space-y-2">
          <button onClick={() => navigate('/interviews')} className="flex items-center gap-2 text-slate-500 hover:text-[#0B1B3B] font-bold transition-colors group">
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Interviews
          </button>
          <h1 className="text-3xl md:text-4xl font-black text-[#0B1B3B] tracking-tight">
            Before You Begin
          </h1>
          <p className="text-slate-500 font-medium">Your customized interview session is ready.</p>
        </div>

        {/* Readiness Checks */}
        <DashboardCard title="System Readiness" icon={Shield}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: Camera, label: 'Camera Access', desc: 'Enable your webcam for proctoring', status: 'Ready' },
              { icon: Mic, label: 'Microphone Access', desc: 'Required for voice responses', status: 'Ready' },
              { icon: Wifi, label: 'Internet Connection', desc: 'Stable connection recommended', status: 'Strong' },
              { icon: Volume2, label: 'Quiet Environment', desc: 'Find a distraction-free space', status: 'Check' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <item.icon size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#0B1B3B]">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest border border-green-100">{item.status}</span>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Evaluation Criteria */}
        <DashboardCard title="Evaluation Criteria" icon={Target}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CRITERIA.map((c, i) => (
              <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <c.icon size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0B1B3B]">{c.label}</p>
                  <p className="text-xs text-slate-500">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Guidelines */}
        <DashboardCard title="Quick Tips">
          <div className="space-y-3">
            {[
              'Speak clearly and at a natural pace.',
              'Structure your answers using the STAR method when applicable.',
              'It\'s okay to take a moment to think before answering.',
              'Be specific about your role and contributions in projects.',
              'The interview will last approximately 20-30 minutes.',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 text-xs font-black mt-0.5">{i + 1}</div>
                <p className="text-sm text-slate-600 font-medium">{tip}</p>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <GradientButton variant="outline" className="!w-auto !px-10" onClick={() => navigate('/interviews')}>
            <ChevronLeft size={18} /> Go Back
          </GradientButton>
          <GradientButton
            className="!w-auto !px-16 !py-5 !text-base"
            onClick={handleStartInterview}
          >
            Start Interview
          </GradientButton>
        </div>
      </div>
    </MainLayout>
  );
};

export default InterviewInstructions;
