import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, BookOpen, Calendar, Shield, AlertCircle, 
  ChevronLeft, Building2, Layout, Zap, CheckCircle
} from 'lucide-react';
import MainLayout from '../components/MainLayout';
import GradientButton from '../components/GradientButton';
import DashboardCard from '../components/DashboardCard';
import { MOCK_OA } from '../data/oaData';

const OADetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const oa = MOCK_OA.find(item => item.id === id) || MOCK_OA[0];

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
                    {oa.company}
                  </span>
                </div>
                <span className="px-4 py-1.5 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-[0.2em]">
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
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deadline</p>
                  <p className="font-bold text-[#0B1B3B]">{oa.deadline}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</p>
                  <p className="font-bold text-[#0B1B3B]">{oa.duration}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Questions</p>
                  <p className="font-bold text-[#0B1B3B]">{oa.questions}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</p>
                  <p className="font-black text-orange-600">Company OA</p>
                </div>
              </div>
            </div>

            {/* Sections Overview */}
            <section className="space-y-6">
              <h2 className="text-2xl font-black text-[#0B1B3B] flex items-center gap-3">
                <Layout size={24} className="text-orange-500" />
                Assessment Sections
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {oa.sections.map((section, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-orange-100/50 hover:border-orange-500/30 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-orange-600 mb-4 group-hover:bg-orange-600 group-hover:text-white transition-all">
                      <Zap size={18} />
                    </div>
                    <h4 className="font-bold text-[#0B1B3B] mb-1">{section.name}</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">{section.count} {section.type} Questions</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Instructions */}
            <DashboardCard title="Instructions & Rules" icon={Shield}>
              <ul className="space-y-4">
                {oa.rules.map((rule, idx) => (
                  <li key={idx} className="flex gap-4 items-start text-slate-600 font-medium leading-relaxed">
                    <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                    {rule}
                  </li>
                ))}
              </ul>
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
                  >
                    Check Permissions
                  </GradientButton>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-4">
                    Est. Duration: {oa.duration}
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
