import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import DashboardCard from '../components/DashboardCard';
import GradientButton from '../components/GradientButton';
import { MOCK_PROFILE } from '../data/profileData';
import {
  ChevronLeft, Save, X, User, Briefcase, GraduationCap,
  Globe, GitBranch, Link2, Code2, Upload, Plus, Trash2
} from 'lucide-react';

const EditProfile = () => {
  const navigate = useNavigate();
  const p = MOCK_PROFILE;

  const [form, setForm] = useState({
    name: p.name,
    headline: p.headline,
    bio: p.bio,
    location: p.location,
    phone: p.phone,
    college: p.college,
    degree: p.degree,
    gradYear: p.gradYear,
    github: p.social.github,
    linkedin: p.social.linkedin,
    portfolio: p.social.portfolio,
    leetcode: p.social.leetcode,
  });

  const [skills, setSkills] = useState([...p.skills.languages, ...p.skills.frameworks, ...p.skills.databases, ...p.skills.tools]);
  const [newSkill, setNewSkill] = useState('');
  const [projects, setProjects] = useState(p.projects.map(proj => ({ ...proj })));
  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  const updateProject = (idx, field, value) => {
    setProjects(prev => prev.map((proj, i) => i === idx ? { ...proj, [field]: value } : proj));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      navigate('/profile');
    }, 1500);
  };

  const inputClass = "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500/50 transition-all font-medium text-slate-700 text-sm";
  const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block";

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-slate-500 hover:text-[#0B1B3B] font-bold transition-colors group">
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              Back to Profile
            </button>
            <h1 className="text-3xl md:text-4xl font-black text-[#0B1B3B] tracking-tight">Edit Profile</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/profile')} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
              <X size={16} /> Cancel
            </button>
            <GradientButton className="!py-3 !px-8" onClick={handleSave}>
              <Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}
            </GradientButton>
          </div>
        </div>

        {/* Basic Info */}
        <DashboardCard title="Basic Information" icon={User}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Full Name</label>
              <input className={inputClass} value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Headline / Role</label>
              <input className={inputClass} value={form.headline} onChange={(e) => handleChange('headline', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Bio</label>
              <textarea className={`${inputClass} min-h-[120px] resize-none`} value={form.bio} onChange={(e) => handleChange('bio', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input className={inputClass} value={form.location} onChange={(e) => handleChange('location', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input className={inputClass} value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
            </div>
          </div>
        </DashboardCard>

        {/* Education */}
        <DashboardCard title="Education" icon={GraduationCap}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>College Name</label>
              <input className={inputClass} value={form.college} onChange={(e) => handleChange('college', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Degree</label>
              <input className={inputClass} value={form.degree} onChange={(e) => handleChange('degree', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Graduation Year</label>
              <input className={inputClass} value={form.gradYear} onChange={(e) => handleChange('gradYear', e.target.value)} />
            </div>
          </div>
        </DashboardCard>

        {/* Skills */}
        <DashboardCard title="Skills" icon={Code2}>
          <div className="flex flex-wrap gap-2 mb-6">
            {skills.map((skill, idx) => (
              <span key={idx} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-sm font-bold text-slate-600 group hover:border-red-200 transition-all">
                {skill}
                <button onClick={() => removeSkill(skill)} className="text-slate-300 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-3">
            <input
              className={`${inputClass} flex-1`}
              placeholder="Add a new skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
            />
            <button onClick={addSkill} className="px-6 py-4 rounded-2xl bg-[#0B1B3B] text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
              <Plus size={16} /> Add
            </button>
          </div>
        </DashboardCard>

        {/* Projects */}
        <DashboardCard title="Projects" icon={Briefcase}>
          <div className="space-y-6">
            {projects.map((proj, idx) => (
              <div key={idx} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Project {idx + 1}</p>
                  <button onClick={() => setProjects(prev => prev.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Title</label>
                    <input className={inputClass} value={proj.title} onChange={(e) => updateProject(idx, 'title', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Tech Stack (comma-separated)</label>
                    <input className={inputClass} value={proj.tech.join(', ')} onChange={(e) => updateProject(idx, 'tech', e.target.value.split(',').map(s => s.trim()))} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Description</label>
                    <textarea className={`${inputClass} min-h-[80px] resize-none`} value={proj.description} onChange={(e) => updateProject(idx, 'description', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => setProjects(prev => [...prev, { title: '', description: '', tech: [], github: '#', live: '#' }])}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-black uppercase tracking-widest hover:border-orange-500/50 hover:text-orange-500 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Project
            </button>
          </div>
        </DashboardCard>

        {/* Social Links */}
        <DashboardCard title="Social Links" icon={Globe}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: GitBranch, label: 'GitHub URL', field: 'github' },
              { icon: Link2, label: 'LinkedIn URL', field: 'linkedin' },
              { icon: Globe, label: 'Portfolio URL', field: 'portfolio' },
              { icon: Code2, label: 'LeetCode URL', field: 'leetcode' },
            ].map((link, i) => (
              <div key={i}>
                <label className={labelClass}>{link.label}</label>
                <div className="relative">
                  <link.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input className={`${inputClass} pl-12`} value={form[link.field]} onChange={(e) => handleChange(link.field, e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Resume Upload */}
        <DashboardCard title="Resume" icon={Upload}>
          <div className="relative group">
            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".pdf,.docx" />
            <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center group-hover:border-orange-500/50 group-hover:bg-orange-50/30 transition-all">
              <Upload size={40} className="text-slate-300 mb-4 group-hover:text-orange-500 transition-colors" />
              <p className="font-bold text-[#0B1B3B] mb-1">Replace Resume</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Current: {p.resume.name}</p>
            </div>
          </div>
        </DashboardCard>

        {/* Bottom Save */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
          <button onClick={() => navigate('/profile')} className="px-8 py-4 rounded-xl border border-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <GradientButton className="!py-4 !px-12" onClick={handleSave}>
            <Save size={18} /> {saved ? 'Changes Saved!' : 'Save All Changes'}
          </GradientButton>
        </div>
      </div>
    </MainLayout>
  );
};

export default EditProfile;
