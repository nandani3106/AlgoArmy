import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, Send, ChevronLeft, ChevronRight, 
  Settings, MessageSquare, AlertTriangle, Building2,
  CheckCircle, Bookmark, Maximize2
} from 'lucide-react';
import QuestionNavigator from '../components/QuestionNavigator';
import ProctoringPanel from '../components/ProctoringPanel';
import GradientButton from '../components/GradientButton';
import { MOCK_OA } from '../data/oaData';

const OAWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const oa = MOCK_OA.find(item => item.id === id) || MOCK_OA[0];
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(5400); // 90 mins
  const [warnings, setWarnings] = useState(0);

  // Mock questions
  const questions = [
    { 
      type: 'MCQ', 
      title: 'What is the time complexity of searching an element in a balanced Binary Search Tree (BST)?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      points: 5
    },
    { 
      type: 'Programming', 
      title: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
      points: 50
    },
    { 
      type: 'MCQ', 
      title: 'Which of the following is NOT a fundamental principle of Object-Oriented Programming?',
      options: ['Inheritance', 'Encapsulation', 'Polymorphism', 'Compilation'],
      points: 5
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (val) => {
    setAnswers({ ...answers, [currentIdx]: val });
  };

  const submitAssessment = () => {
    if (window.confirm('Are you sure you want to submit your assessment?')) {
      navigate(`/oa/${id}/submitted`);
    }
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex flex-col overflow-hidden font-sans">
      {/* Workspace Header */}
      <header className="h-16 bg-[#0B1B3B] border-b border-white/10 px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10 p-1.5">
              <img src={oa.logo} alt={oa.company} className="w-full h-full object-contain" />
            </div>
            <div className="h-4 w-px bg-white/20 mx-1" />
            <span className="text-white font-black text-sm tracking-tight">{oa.title}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <Clock size={14} className="text-orange-400" />
            <span className="text-orange-400 font-mono text-sm font-black">{formatTime(timeLeft)}</span>
          </div>
          
          <button 
            onClick={submitAssessment}
            className="px-6 py-2 rounded-xl bg-orange-600 text-white text-xs font-black hover:bg-orange-700 transition-all shadow-lg shadow-orange-900/20 flex items-center gap-2 uppercase tracking-widest"
          >
            Submit Assessment
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#0B1B3B] text-white text-[10px] font-black uppercase tracking-widest">
                  Question {currentIdx + 1}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {currentQ.type} • {currentQ.points} Points
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

              {currentQ.type === 'MCQ' ? (
                <div className="space-y-4">
                  {currentQ.options.map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(option)}
                      className={`w-full p-6 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                        answers[currentIdx] === option 
                          ? 'bg-[#0B1B3B] border-navy-900 text-white' 
                          : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-orange-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          answers[currentIdx] === option ? 'bg-white/10' : 'bg-white'
                        }`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="font-bold">{option}</span>
                      </div>
                      {answers[currentIdx] === option && <CheckCircle size={20} className="text-orange-400" />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-slate-500 font-medium leading-relaxed bg-slate-50 p-6 rounded-2xl">
                    {currentQ.description}
                  </p>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Constraints</p>
                    <ul className="space-y-2">
                      {currentQ.constraints.map((c, i) => (
                        <li key={i} className="flex items-center gap-3 text-xs text-slate-500 font-bold">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="relative pt-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Solution Editor</p>
                    <textarea 
                      className="w-full h-64 bg-slate-900 text-slate-300 font-mono text-sm p-8 rounded-3xl outline-none focus:ring-2 focus:ring-orange-500/20 transition-all custom-scrollbar resize-none"
                      placeholder="// Write your code here..."
                      value={answers[currentIdx] || ''}
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
                    submitAssessment();
                  }
                }}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#0B1B3B] text-white font-black text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-navy-900/20 transition-all"
              >
                {currentIdx < questions.length - 1 ? 'Next Question' : 'Finish Test'}
                <ChevronRight size={20} />
              </button>
            </div>
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
