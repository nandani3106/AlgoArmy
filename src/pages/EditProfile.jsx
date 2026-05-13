import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import DashboardCard from '../components/DashboardCard';
import GradientButton from '../components/GradientButton';
import {
  ChevronLeft, Save, X, User, Briefcase, GraduationCap,
  Globe, GitBranch, Link2, Code2, Upload, Plus, Trash2, Loader2
} from 'lucide-react';

const API_BASE = 'http://localhost:5000';

const EditProfile = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    bio: '',
    college: '',
    branch: '',
    graduationYear: '',
    github: '',
    linkedin: '',
    leetcode: '',
    codeforces: '',
    resumeUrl: '',
    profileImage: '',
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Fetch existing profile on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }

        const data = await res.json();
        if (data.success) {
          const u = data.user;
          setForm({
            fullName: u.fullName || '',
            bio: u.bio || '',
            college: u.college || '',
            branch: u.branch || '',
            graduationYear: u.graduationYear || '',
            github: u.github || '',
            linkedin: u.linkedin || '',
            leetcode: u.leetcode || '',
            codeforces: u.codeforces || '',
            resumeUrl: u.resumeUrl || '',
            profileImage: u.profileImage || '',
          });
          setSkills(u.skills || []);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
    if (saved) setSaved(false);
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

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: form.fullName,
          bio: form.bio,
          college: form.college,
          branch: form.branch,
          graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
          skills,
          github: form.github,
          linkedin: form.linkedin,
          leetcode: form.leetcode,
          codeforces: form.codeforces,
          resumeUrl: form.resumeUrl,
          profileImage: form.profileImage,
        }),
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      const data = await res.json();

      if (data.success) {
        // Update localStorage user
        localStorage.setItem('user', JSON.stringify(data.user));
        setSaved(true);
        setTimeout(() => {
          navigate('/profile');
        }, 1200);
      } else {
        setError(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError('Server not reachable. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-orange-500/50 transition-all font-medium text-slate-700 text-sm";
  const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block";

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="animate-spin text-orange-500" />
            <p className="text-slate-500 font-bold text-sm">Loading profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

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
            <GradientButton className="!py-3 !px-8" onClick={handleSave} disabled={saving}>
              <Save size={16} /> {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
            </GradientButton>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold">
            {error}
          </div>
        )}

        {saved && (
          <div className="p-4 rounded-2xl bg-green-50 border border-green-100 text-green-600 text-sm font-bold">
            Profile updated successfully! Redirecting...
          </div>
        )}

        {/* Basic Info */}
        <DashboardCard title="Basic Information" icon={User}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Full Name</label>
              <input className={inputClass} value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Profile Image URL</label>
              <input className={inputClass} value={form.profileImage} onChange={(e) => handleChange('profileImage', e.target.value)} placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Bio</label>
              <textarea className={`${inputClass} min-h-[120px] resize-none`} value={form.bio} onChange={(e) => handleChange('bio', e.target.value)} />
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
              <label className={labelClass}>Branch / Degree</label>
              <input className={inputClass} value={form.branch} onChange={(e) => handleChange('branch', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Graduation Year</label>
              <input className={inputClass} type="number" value={form.graduationYear} onChange={(e) => handleChange('graduationYear', e.target.value)} />
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

        {/* Social Links */}
        <DashboardCard title="Social Links" icon={Globe}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: GitBranch, label: 'GitHub URL', field: 'github' },
              { icon: Link2, label: 'LinkedIn URL', field: 'linkedin' },
              { icon: Code2, label: 'LeetCode URL', field: 'leetcode' },
              { icon: Code2, label: 'Codeforces URL', field: 'codeforces' },
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

        {/* Resume URL */}
        <DashboardCard title="Resume" icon={Upload}>
          <div>
            <label className={labelClass}>Resume URL</label>
            <input className={inputClass} value={form.resumeUrl} onChange={(e) => handleChange('resumeUrl', e.target.value)} placeholder="https://drive.google.com/..." />
            <p className="text-xs text-slate-400 mt-2 ml-1">Paste a link to your resume (Google Drive, Dropbox, etc.)</p>
          </div>
        </DashboardCard>

        {/* Bottom Save */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
          <button onClick={() => navigate('/profile')} className="px-8 py-4 rounded-xl border border-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            Cancel
          </button>
          <GradientButton className="!py-4 !px-12" onClick={handleSave} disabled={saving}>
            <Save size={18} /> {saved ? 'Changes Saved!' : saving ? 'Saving...' : 'Save All Changes'}
          </GradientButton>
        </div>
      </div>
    </MainLayout>
  );
};

export default EditProfile;
