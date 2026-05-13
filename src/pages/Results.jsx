import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { MOCK_RESULTS } from '../data/resultsData';
import { Search, Filter, Trophy, Briefcase, Video, ChevronRight, Calendar } from 'lucide-react';

const Results = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filteredResults = MOCK_RESULTS.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (item.company && item.company.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTab = activeTab === 'All' || 
                      (activeTab === 'Contests' && item.type === 'Contest') ||
                      (activeTab === 'Assessments' && item.type === 'OA') ||
                      (activeTab === 'Interviews' && item.type === 'Interview');
    return matchesSearch && matchesTab;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'Contest': return <Trophy size={18} className="text-amber-500" />;
      case 'OA': return <Briefcase size={18} className="text-blue-500" />;
      case 'Interview': return <Video size={18} className="text-orange-500" />;
      default: return null;
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'Contest': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'OA': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Interview': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-10 pb-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[3rem] bg-[#0B1B3B] p-12 md:p-20 text-white shadow-2xl shadow-navy-900/20">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
              Your Results & <span className="text-orange-400">Reports</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Review your performance across contests, assessments, and AI-powered interviews. Track your growth and download official reports.
            </p>
          </div>
        </div>

        {/* Filters & Tabs */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-orange-900/5 border border-orange-100/50 flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search by title or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500/50 transition-all font-medium text-slate-600"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto custom-scrollbar">
              {['All', 'Contests', 'Assessments', 'Interviews'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-[#0B1B3B] text-white shadow-lg' : 'text-slate-400 hover:text-[#0B1B3B]'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="grid grid-cols-1 gap-6">
          {filteredResults.map((result) => (
            <div 
              key={result.id}
              className="bg-white rounded-[2rem] p-8 shadow-xl shadow-orange-900/5 border border-orange-100/50 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-orange-500/30 transition-all cursor-pointer"
              onClick={() => navigate(`/results/${result.type.toLowerCase()}/${result.id}`)}
            >
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border ${getBadgeStyle(result.type)}`}>
                  {getIcon(result.type)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getBadgeStyle(result.type)}`}>
                      {result.type}
                    </span>
                    {result.company && (
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <Briefcase size={12} /> {result.company}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-[#0B1B3B] group-hover:text-orange-600 transition-colors">{result.title}</h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-12 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-12">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Calendar size={12} /> Date
                  </p>
                  <p className="text-sm font-bold text-[#0B1B3B]">{result.date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Score / Rating</p>
                  <p className="text-sm font-black text-orange-600">{result.score}</p>
                </div>
                {result.rank && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rank / Percentile</p>
                    <p className="text-sm font-black text-blue-600">{result.rank}</p>
                  </div>
                )}
                <div className="ml-auto">
                  <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-50 border border-slate-100 text-[#0B1B3B] text-[10px] font-black uppercase tracking-widest group-hover:bg-[#0B1B3B] group-hover:text-white transition-all">
                    View Report
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredResults.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center mb-6 border border-orange-100">
                <Search size={40} className="text-orange-200" />
              </div>
              <h3 className="text-2xl font-black text-[#0B1B3B] mb-2">No results found</h3>
              <p className="text-slate-500 font-medium">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Results;
