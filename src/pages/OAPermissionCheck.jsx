import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, ChevronLeft, Building2, Play } from 'lucide-react';
import MainLayout from '../components/MainLayout';
import GradientButton from '../components/GradientButton';
import PermissionChecklist from '../components/PermissionChecklist';
import { MOCK_OA } from '../data/oaData';

const OAPermissionCheck = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [permissions, setPermissions] = useState({
    camera: false,
    mic: false,
    screen: false,
    internet: false,
    fullscreen: false
  });

  const oa = MOCK_OA.find(item => item.id === id) || MOCK_OA[0];

  const runChecks = () => {
    setChecking(true);
    // Simulate checking permissions one by one
    const keys = Object.keys(permissions);
    keys.forEach((key, index) => {
      setTimeout(() => {
        setPermissions(prev => ({ ...prev, [key]: true }));
        if (index === keys.length - 1) setChecking(false);
      }, (index + 1) * 800);
    });
  };

  const allGranted = Object.values(permissions).every(p => p === true);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Back Button */}
        <button 
          onClick={() => navigate(`/oa/${id}`)}
          className="flex items-center gap-2 text-slate-500 hover:text-[#0B1B3B] font-bold transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Instructions
        </button>

        <div className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-orange-900/5 border border-orange-100/50">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-orange-100">
              <Shield size={40} className="text-orange-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#0B1B3B] mb-4">
              System Permission Check
            </h1>
            <p className="text-slate-500 font-medium">
              We need to verify your hardware and environment settings to ensure a fair assessment for <span className="text-[#0B1B3B] font-bold">{oa.company}</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <h3 className="text-lg font-black text-[#0B1B3B] uppercase tracking-widest flex items-center gap-2">
                Verification Progress
              </h3>
              <PermissionChecklist permissions={permissions} />
            </div>

            <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 space-y-8">
              <div className="space-y-4">
                <h4 className="text-sm font-black text-[#0B1B3B] uppercase tracking-tighter">Why is this required?</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  To maintain the integrity of the assessment, we use AI-driven proctoring that monitors eye movement, background noise, and screen activity.
                </p>
              </div>

              <div className="space-y-4 pt-8 border-t border-slate-200">
                <GradientButton 
                  className="w-full !py-4" 
                  onClick={runChecks}
                  disabled={checking}
                >
                  {checking ? 'Running Diagnostics...' : 'Run All Checks'}
                </GradientButton>
                
                <button 
                  disabled={!allGranted || checking}
                  onClick={() => navigate(`/oa/${id}/workspace`)}
                  className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    allGranted && !checking
                      ? 'bg-[#0B1B3B] text-white shadow-xl shadow-navy-900/20' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Play size={16} fill="currentColor" />
                  Start Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OAPermissionCheck;
