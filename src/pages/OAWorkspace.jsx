import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, Send, ChevronLeft, ChevronRight, 
  Settings, MessageSquare, AlertTriangle, Building2,
  CheckCircle, Bookmark, Maximize2, Loader2
} from 'lucide-react';
import QuestionNavigator from '../components/QuestionNavigator';
import ProctoringPanel from '../components/ProctoringPanel';
import GradientButton from '../components/GradientButton';

const API_BASE = 'http://localhost:5000';

const OAWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [oa, setOa] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // Stores questionId -> answer
  const [timeLeft, setTimeLeft] = useState(0);
  const [warnings, setWarnings] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch Test Info
        const oaRes = await fetch(`${API_BASE}/api/oa/${id}`);
        const oaData = await oaRes.json();
        if (oaData.success) {
          setOa(oaData.data);
          setTimeLeft((oaData.data.durationMinutes || 45) * 60);
        }

        // Fetch Questions
        const qRes = await fetch(`${API_BASE}/api/oa/${id}/questions`);
        const qData = await qRes.json();
        if (qData.success) {
          setQuestions(qData.data);
        }
      } catch (err) {
        console.error('Workspace fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle auto-submit when time is up
  useEffect(() => {
    if (timeLeft === 0 && !loading && questions.length > 0 && !submitting) {
      submitAssessment(true);
    }
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (val) => {
    const questionId = questions[currentIdx]._id;
    setAnswers({ ...answers, [questionId]: val });
  };

  const submitAssessment = async (isAuto = false) => {
    if (!isAuto && !window.confirm('Are you sure you want to submit your assessment?')) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        answers: Object.entries(answers).map(([qId, ans]) => ({
          questionId: qId,
          answer: ans
        }))
      };

      const res = await fetch(`${API_BASE}/api/oa/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("oaSubmission", JSON.stringify(data.data));
        navigate(`/oa/${id}/submitted`);
      } else {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          alert(data.message || 'Submission failed');
        }
      }
    } catch (err) {
      alert('Network error during submission. Your progress might be lost.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-slate-50">
        <Loader2 className="text-orange-500 animate-spin" size={48} />
        <p className="text-slate-500 font-bold">Initializing Workspace...</p>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex flex-col overflow-hidden font-sans">
      {/* Workspace Header */}
      <header className="h-16 bg-[#0B1B3B] border-b border-white/10 px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10 p-1.5">
              <Building2 className="text-orange-400" size={18} />
            </div>
            <div className="h-4 w-px bg-white/20 mx-1" />
            <span className="text-white font-black text-sm tracking-tight">{oa?.title || 'Online Assessment'}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <Clock size={14} className="text-orange-400" />
            <span className={`font-mono text-sm font-black ${timeLeft < 300 ? 'text-red-400' : 'text-orange-400'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          
          <button 
            onClick={() => submitAssessment(false)}
            disabled={submitting}
            className="px-6 py-2 rounded-xl bg-orange-600 text-white text-xs font-black hover:bg-orange-700 transition-all shadow-lg shadow-orange-900/20 flex items-center gap-2 uppercase tracking-widest disabled:opacity-50"
          >
            {submitting ? <Loader2 className="animate-spin" size={14} /> : 'Submit Assessment'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Question & Navigator */}
        <div className="w-1/4 h-full border-r border-slate-200 bg-white flex flex-col p-6 space-y-8 overflow-y-auto custom-scrollbar">
          <QuestionNavigator 
            questions={questions} 
            currentIdx={currentIdx} 
            onSelect={setCurrentIdx}
            answers={answers}
            isApiMode={true}
          />
          
          <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex gap-4 items-start">
            <AlertTriangle className="text-orange-600 shrink-0" size={20} />
            <p className="text-[10px] text-orange-800 font-bold leading-relaxed uppercase tracking-tight">
              Avoid switching tabs. System records all tab changes.
            </p>
          </div>
        </div>

        {/* Center: Workspace Area */}
        <div className="flex-1 h-full flex flex-col bg-slate-50 p-8 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto w-full space-y-8">
            {/* Question Header */}
            {currentQ && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-[#0B1B3B] text-white text-[10px] font-black uppercase tracking-widest">
                      Question {currentIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {currentQ.type.toUpperCase()} • {currentQ.points} Points
                    </span>
                  </div>
                  <button className="text-slate-400 hover:text-orange-500 transition-colors">
                    <Bookmark size={20} />
                  </button>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-orange-900/5 border border-orange-100/50">
                  <h2 className="text-2xl font-black text-[#0B1B3B] mb-8 leading-tight">
                    {currentQ.title}
                  </h2>

                  {currentQ.type === 'mcq' ? (
                    <div className="space-y-4">
                      {currentQ.options.map((option, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(option)}
                          className={`w-full p-6 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                            answers[currentQ._id] === option 
                              ? 'bg-[#0B1B3B] border-navy-900 text-white' 
                              : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-orange-200'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                              answers[currentQ._id] === option ? 'bg-white/10' : 'bg-white'
                            }`}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <span className="font-bold">{option}</span>
                          </div>
                          {answers[currentQ._id] === option && <CheckCircle size={20} className="text-orange-400" />}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <p className="text-slate-500 font-medium leading-relaxed bg-slate-50 p-6 rounded-2xl whitespace-pre-wrap">
                        {currentQ.statement}
                      </p>
                      <div className="relative pt-8">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Solution Editor</p>
                        <textarea 
                          className="w-full h-64 bg-slate-900 text-slate-300 font-mono text-sm p-8 rounded-3xl outline-none focus:ring-2 focus:ring-orange-500/20 transition-all custom-scrollbar resize-none"
                          placeholder="// Write your code here..."
                          value={answers[currentQ._id] || ''}
                          onChange={(e) => handleAnswer(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <button 
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx(prev => prev - 1)}
                    className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      currentIdx === 0 ? 'text-slate-300' : 'text-slate-600 hover:bg-white'
                    }`}
                  >
                    <ChevronLeft size={20} />
                    Previous
                  </button>
                  <button 
                    onClick={() => {
                      if (currentIdx < questions.length - 1) {
                        setCurrentIdx(prev => prev + 1);
                      } else {
                        submitAssessment(false);
                      }
                    }}
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#0B1B3B] text-white font-black text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-navy-900/20 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      currentIdx < questions.length - 1 ? 'Next Question' : 'Finish Test'
                    )}
                    {!submitting && <ChevronRight size={20} />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Proctoring Panel */}
        <div className="w-1/5 h-full border-l border-slate-200">
          <ProctoringPanel warnings={warnings} />
        </div>
      </div>
    </div>
  );
};

export default OAWorkspace;
