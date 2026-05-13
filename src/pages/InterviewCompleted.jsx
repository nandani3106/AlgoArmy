import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import GradientButton from '../components/GradientButton';
import { CheckCircle, ChevronRight, Clock, MessageSquare, BarChart3 } from 'lucide-react';

const InterviewCompleted = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto text-center py-20 space-y-10">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-3xl bg-green-50 flex items-center justify-center border border-green-100">
            <CheckCircle size={48} className="text-green-600" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-[#0B1B3B] tracking-tight">
            Interview <span className="gradient-text-warm">Completed!</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-md mx-auto leading-relaxed">
            Great work! Your AI interview has been recorded and analyzed. Your detailed report is ready.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-5 shadow-xl shadow-orange-900/5 border border-orange-100/50">
            <Clock size={20} className="text-orange-500 mx-auto mb-2" />
            <p className="text-lg font-black text-[#0B1B3B]">18:42</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-xl shadow-orange-900/5 border border-orange-100/50">
            <MessageSquare size={20} className="text-blue-500 mx-auto mb-2" />
            <p className="text-lg font-black text-[#0B1B3B]">6</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Questions</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-xl shadow-orange-900/5 border border-orange-100/50">
            <BarChart3 size={20} className="text-green-500 mx-auto mb-2" />
            <p className="text-lg font-black text-[#0B1B3B]">A+</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rating</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <GradientButton className="!w-auto !px-12" onClick={() => navigate('/results/interview/1')}>
            View Full Report <ChevronRight size={18} />
          </GradientButton>
          <GradientButton variant="outline" className="!w-auto !px-10" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </GradientButton>
        </div>
      </div>
    </MainLayout>
  );
};

export default InterviewCompleted;
