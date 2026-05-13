import React, { useState } from 'react';
import MainLayout from '../components/MainLayout';
import OACard from '../components/OACard';
import { MOCK_OA } from '../data/oaData';
import { Search, Filter, Briefcase, LayoutGrid, List as ListIcon } from 'lucide-react';

const OAList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('All');
  const [viewMode, setViewMode] = useState('grid');

  const companies = ['All', ...new Set(MOCK_OA.map(oa => oa.company))];

  const filteredOA = MOCK_OA.filter(oa => {
    const matchesSearch = oa.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         oa.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCompany = filterCompany === 'All' || oa.company === filterCompany;
    return matchesSearch && matchesCompany;
  });

  return (
    <MainLayout>
      <div className="space-y-10 pb-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[3rem] bg-[#0B1B3B] p-12 md:p-20 text-white shadow-2xl shadow-navy-900/20">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
              Online Assessments
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed mb-8">
              Complete official company assessments and screening tests in a proctored environment.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/5">
                <Briefcase size={20} className="text-orange-400" />
                <span className="font-bold text-sm">{MOCK_OA.length} Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-orange-900/5 border border-orange-100/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search assessment or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500/50 transition-all font-medium text-slate-600"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-1.5 rounded-2xl">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[#0B1B3B] text-white shadow-lg' : 'text-slate-400 hover:text-[#0B1B3B]'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-[#0B1B3B] text-white shadow-lg' : 'text-slate-400 hover:text-[#0B1B3B]'}`}
              >
                <ListIcon size={18} />
              </button>
            </div>

            <select 
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="flex-1 md:flex-none pl-4 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500/50 transition-all font-bold text-[#0B1B3B] appearance-none cursor-pointer"
            >
              {companies.map(c => <option key={c} value={c}>{c === 'All' ? 'All Companies' : c}</option>)}
            </select>
          </div>
        </div>

        {/* Assessment Grid */}
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
          {filteredOA.map(oa => (
            <OACard key={oa.id} oa={oa} />
          ))}
        </div>

        {filteredOA.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center mb-6 border border-orange-100">
              <Filter size={40} className="text-orange-200" />
            </div>
            <h3 className="text-2xl font-black text-[#0B1B3B] mb-2">No assessments found</h3>
            <p className="text-slate-500 font-medium">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default OAList;
