import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import DashboardCard from '../components/DashboardCard';
import GradientButton from '../components/GradientButton';
import { MOCK_PROFILE } from '../data/profileData';
import {
  User, Edit3, Download, ExternalLink, Mail, Phone, Calendar,
  MapPin, GraduationCap, Code2, Briefcase, GitBranch, Link2,
  Globe, Trophy, Target, Zap, Flame, ChevronRight, FileText,
  Award, BarChart3, Star
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const p = MOCK_PROFILE;

  return (
    <MainLayout>
      <div className="space-y-10 pb-12">

        {/* Hero Profile Header */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0B1B3B] p-10 md:p-16 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
            <div className="w-32 h-32 rounded-3xl border-4 border-white/20 overflow-hidden shadow-2xl shrink-0">
              <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-4">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">{p.name}</h1>
                <span className="px-4 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-black uppercase tracking-widest border border-green-500/20">Verified</span>
              </div>
              <p className="text-orange-400 font-black text-sm uppercase tracking-widest mb-3">{p.headline}</p>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl mb-6">{p.bio}</p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-400 text-xs font-bold">
                <span className="flex items-center gap-2"><MapPin size={14} /> {p.location}</span>
                <span className="flex items-center gap-2"><GraduationCap size={14} /> {p.college}</span>
                <span className="flex items-center gap-2"><Calendar size={14} /> Class of {p.gradYear}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 shrink-0">
              <GradientButton className="!py-3 !px-8" onClick={() => navigate('/profile/edit')}>
                <Edit3 size={16} /> Edit Profile
              </GradientButton>
              <button className="flex items-center justify-center gap-2 py-3 px-8 rounded-xl border border-white/10 text-white/80 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                <Download size={16} /> Resume
              </button>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-orange-900/5 border border-orange-100/50 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-blue-500 bg-blue-50"><Target size={24} /></div>
            <h4 className="text-2xl font-black text-[#0B1B3B]">{p.stats.problemsSolved}</h4>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">Problems Solved</p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-orange-900/5 border border-orange-100/50 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-amber-500 bg-amber-50"><Trophy size={24} /></div>
            <h4 className="text-2xl font-black text-[#0B1B3B]">#{p.stats.globalRank}</h4>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">Global Rank</p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-orange-900/5 border border-orange-100/50 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-green-500 bg-green-50"><Award size={24} /></div>
            <h4 className="text-2xl font-black text-[#0B1B3B]">{p.stats.contestWins}</h4>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">Contest Wins</p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-orange-900/5 border border-orange-100/50 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-orange-500 bg-orange-50"><Zap size={24} /></div>
            <h4 className="text-2xl font-black text-[#0B1B3B]">{p.stats.accuracy}</h4>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">Accuracy</p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-orange-900/5 border border-orange-100/50 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-red-500 bg-red-50"><Flame size={24} /></div>
            <h4 className="text-2xl font-black text-[#0B1B3B]">{p.stats.streak} Days</h4>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-1">Streak</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-8">

            {/* Skills */}
            <DashboardCard title="Skills & Technologies" icon={Code2}>
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {p.skills.languages.map((skill, idx) => (
                      <span key={idx} className="px-4 py-2 rounded-xl text-xs font-bold border bg-blue-50 text-blue-600 border-blue-100">{skill}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Frameworks</p>
                  <div className="flex flex-wrap gap-2">
                    {p.skills.frameworks.map((skill, idx) => (
                      <span key={idx} className="px-4 py-2 rounded-xl text-xs font-bold border bg-orange-50 text-orange-600 border-orange-100">{skill}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Databases</p>
                  <div className="flex flex-wrap gap-2">
                    {p.skills.databases.map((skill, idx) => (
                      <span key={idx} className="px-4 py-2 rounded-xl text-xs font-bold border bg-green-50 text-green-600 border-green-100">{skill}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Tools</p>
                  <div className="flex flex-wrap gap-2">
                    {p.skills.tools.map((skill, idx) => (
                      <span key={idx} className="px-4 py-2 rounded-xl text-xs font-bold border bg-purple-50 text-purple-600 border-purple-100">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </DashboardCard>

            {/* Projects */}
            <DashboardCard title="Projects" icon={Briefcase}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {p.projects.map((proj, idx) => (
                  <div key={idx} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all group">
                    <h4 className="text-lg font-black text-[#0B1B3B] mb-2 group-hover:text-orange-600 transition-colors">{proj.title}</h4>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{proj.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {proj.tech.map((t, i) => (
                        <span key={i} className="px-3 py-1 rounded-lg bg-white text-xs font-bold text-slate-500 border border-slate-100 uppercase tracking-tighter">{t}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1B3B] text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                        <GitBranch size={14} /> GitHub
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                        <ExternalLink size={14} /> Live Demo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>

            {/* Recent Activity */}
            <DashboardCard title="Recent Activity" icon={BarChart3}>
              <div className="space-y-4">
                {p.recentActivity.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        a.type === 'Contest' ? 'bg-amber-50 text-amber-600' :
                        a.type === 'OA' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {a.type === 'Contest' && <Trophy size={18} />}
                        {a.type === 'OA' && <FileText size={18} />}
                        {a.type === 'Interview' && <Star size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0B1B3B]">{a.title}</p>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">{a.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black text-orange-600">{a.result}</span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-orange-500 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-8">

            {/* Contact Info */}
            <DashboardCard title="Contact Info" icon={User}>
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100"><Mail size={18} /></div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Email</p>
                    <p className="text-sm font-bold text-[#0B1B3B]">{p.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100"><Phone size={18} /></div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Phone</p>
                    <p className="text-sm font-bold text-[#0B1B3B]">{p.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100"><Calendar size={18} /></div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Date of Birth</p>
                    <p className="text-sm font-bold text-[#0B1B3B]">{p.dob}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100"><GraduationCap size={18} /></div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Degree</p>
                    <p className="text-sm font-bold text-[#0B1B3B]">{p.degree}</p>
                  </div>
                </div>
              </div>
            </DashboardCard>

            {/* Resume */}
            <DashboardCard title="Resume" icon={FileText}>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#0B1B3B] rounded-xl flex items-center justify-center text-white">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0B1B3B]">{p.resume.name}</p>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Uploaded {p.resume.uploadDate}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 py-3 rounded-xl bg-[#0B1B3B] text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                    <Download size={14} /> Download
                  </button>
                  <button onClick={() => navigate('/profile/edit')} className="flex-1 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    Replace
                  </button>
                </div>
              </div>
            </DashboardCard>

            {/* Social Links */}
            <DashboardCard title="Social Links" icon={Globe}>
              <div className="space-y-3">
                <a href={p.social.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all group">
                  <div className="flex items-center gap-3">
                    <GitBranch size={18} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
                    <span className="text-sm font-bold text-[#0B1B3B]">GitHub</span>
                  </div>
                  <ExternalLink size={14} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
                </a>
                <a href={p.social.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all group">
                  <div className="flex items-center gap-3">
                    <Link2 size={18} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
                    <span className="text-sm font-bold text-[#0B1B3B]">LinkedIn</span>
                  </div>
                  <ExternalLink size={14} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
                </a>
                <a href={p.social.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all group">
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
                    <span className="text-sm font-bold text-[#0B1B3B]">Portfolio</span>
                  </div>
                  <ExternalLink size={14} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
                </a>
                <a href={p.social.leetcode} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all group">
                  <div className="flex items-center gap-3">
                    <Code2 size={18} className="text-slate-400 group-hover:text-orange-600 transition-colors" />
                    <span className="text-sm font-bold text-[#0B1B3B]">LeetCode</span>
                  </div>
                  <ExternalLink size={14} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
                </a>
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
