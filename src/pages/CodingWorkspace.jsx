import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Play, Send, Clock, ChevronLeft, ChevronRight, 
  Settings, Maximize2, MessageSquare, Terminal, Zap, CheckCircle
} from 'lucide-react';
import ProblemPanel from '../components/ProblemPanel';
import CodeEditor from '../components/CodeEditor';
import OutputPanel from '../components/OutputPanel';


const MOCK_PROBLEMS = [
  { 
    id: '1', 
    title: 'The Great Expedition', 
    difficulty: 'Easy', 
    points: 100,
    description: 'Given an array of integers representing the distance of each camp from the base, find the maximum distance you can travel if you can only jump between camps that have a distance difference of at most K.',
    examples: [
      { input: 'camps = [1, 5, 8, 12, 15], K = 4', output: '15', explanation: 'You can jump from 1 to 5, 5 to 8, 8 to 12, and 12 to 15.' },
      { input: 'camps = [1, 10, 15], K = 5', output: '1', explanation: 'No camps are within distance 5 from the base camp.' }
    ],
    constraints: ['1 <= camps.length <= 10^5', '1 <= camps[i] <= 10^9', '1 <= K <= 10^9'],
    tags: ['Array', 'Greedy', 'Sorting']
  },
  { 
    id: '2', 
    title: 'Magic Potion Optimization', 
    difficulty: 'Medium', 
    points: 250,
    description: 'You have N ingredients, each with a potency value. A magic potion is created by mixing ingredients such that the sum of their potencies is exactly Target. Find the minimum number of ingredients required.',
    examples: [
      { input: 'ingredients = [1, 5, 10, 25], target = 30', output: '2', explanation: 'Use one 25 and one 5.' }
    ],
    constraints: ['1 <= N <= 100', '1 <= target <= 10^4'],
    tags: ['Dynamic Programming', 'Knapsack']
  }
];

const CodingWorkspace = () => {
  const { contestId, questionId } = useParams();
  const navigate = useNavigate();
  
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [verdict, setVerdict] = useState('');
  const [testCases, setTestCases] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(7200); // 2 hours in seconds

  const currentProblem = MOCK_PROBLEMS.find(p => p.id === questionId) || MOCK_PROBLEMS[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRun = () => {
    setIsRunning(true);
    setOutput('');
    setVerdict('');
    setTestCases(null);
    
    setTimeout(() => {
      setIsRunning(false);
      setOutput('Sample Input: ' + currentProblem.examples[0].input + '\nOutput: ' + currentProblem.examples[0].output + '\n\nExecution successful.');
      setVerdict('Accepted');
      setTestCases([
        { id: 1, passed: true },
        { id: 2, passed: true }
      ]);
    }, 1500);
  };

  const handleSubmit = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      const isAccepted = Math.random() > 0.3;
      setVerdict(isAccepted ? 'Accepted' : 'Wrong Answer');
      setOutput(isAccepted ? 'All test cases passed!' : 'Hidden test case #4 failed.\nExpected: 42\nReceived: 41');
      setTestCases([
        { id: 1, passed: true },
        { id: 2, passed: true },
        { id: 3, passed: true },
        { id: 4, passed: isAccepted },
        { id: 5, passed: isAccepted },
      ]);
    }, 2000);
  };

  return (
    <div className="h-screen w-full bg-[#f8fafc] flex flex-col overflow-hidden">
      {/* Workspace Top Bar */}
      <header className="h-16 bg-[#0B1B3B] border-b border-white/10 px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/contests')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <span className="text-white font-black text-sm">AA</span>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10 mx-2" />
          <div className="flex items-center gap-3">
            <span className="text-white font-black text-sm tracking-tight">Weekly Challenge #12</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
              <Clock size={14} className="text-orange-400" />
              <span className="text-orange-400 font-mono text-xs font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#1e293b] border border-white/10 rounded-xl px-4 py-2 text-white text-xs font-bold outline-none focus:border-orange-500/50 transition-all cursor-pointer"
          >
            <option value="javascript">JavaScript (Node v18)</option>
            <option value="python">Python 3.10</option>
            <option value="cpp">C++ (GCC 11)</option>
            <option value="java">Java 17</option>
          </select>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRun}
              className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Play size={14} fill="currentColor" /> Run
            </button>
            <button 
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl bg-orange-600 text-white text-xs font-black hover:bg-orange-700 transition-all shadow-lg shadow-orange-900/20 flex items-center gap-2"
            >
              <Send size={14} fill="currentColor" /> Submit
            </button>
            <button 
              onClick={() => navigate(`/results/contest/${contestId}`)}
              className="px-5 py-2 rounded-xl bg-green-600 text-white text-xs font-black hover:bg-green-700 transition-all shadow-lg shadow-green-900/20 flex items-center gap-2"
            >
              <CheckCircle size={14} /> Finish
            </button>
          </div>
        </div>
      </header>

      {/* Workspace Content (2 Columns) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Problem Panel */}
        <div className="w-[45%] h-full border-r border-slate-200">
          <ProblemPanel problem={currentProblem} />
        </div>

        {/* Right: Editor & Output Panel */}
        <div className="flex-1 h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            <CodeEditor code={code} onChange={setCode} language={language} />
          </div>
          <div className="h-[35%] border-t border-white/5">
            <OutputPanel 
              output={output} 
              verdict={verdict} 
              testCases={testCases} 
              isRunning={isRunning} 
            />
          </div>
        </div>
      </div>

      {/* Workspace Bottom Bar */}
      <footer className="h-12 bg-white border-t border-slate-200 px-6 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-[#0B1B3B] transition-colors p-2">
            <Settings size={18} />
          </button>
          <button className="text-slate-400 hover:text-[#0B1B3B] transition-colors p-2">
            <MessageSquare size={18} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {MOCK_PROBLEMS.map((p, idx) => {
              const label = String.fromCharCode(65 + idx); // A, B, C...
              const isActive = questionId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => navigate(`/workspace/${contestId}/${p.id}`)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#0B1B3B] text-white' 
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="h-6 w-px bg-slate-200 mx-2" />
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-[#0B1B3B] transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-[#0B1B3B] transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CodingWorkspace;
