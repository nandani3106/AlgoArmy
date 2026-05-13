import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import CustomInput from '../components/CustomInput';
import GradientButton from '../components/GradientButton';

const API_BASE = 'http://localhost:5000';

const Signup = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Candidate');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      const parsed = JSON.parse(user);
      if (parsed.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields required
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: role.toLowerCase(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Signup failed');
        setLoading(false);
        return;
      }

      // Save to localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Server not reachable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Create Account"
        subtitle="Join AlgoArmy and start your journey"
      >
        <form onSubmit={handleSubmit} className="space-y-1">
          {/* Role Selection */}
          <div className="flex p-1 bg-slate-50 rounded-xl mb-4 border border-orange-100/50 shadow-sm">
            {['Candidate', 'Admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${role === r
                    ? 'bg-[#0B1B3B] text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          <CustomInput
            icon={User}
            label="Full Name"
            name="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <CustomInput
            icon={Mail}
            label="Email Address"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <CustomInput
            icon={Lock}
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <CustomInput
            icon={Lock}
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          {error && (
            <p className="text-red-500 text-[10px] font-bold tracking-tight mt-1 ml-1 animate-pulse">
              {error}
            </p>
          )}

          <GradientButton type="submit" className="mt-6" disabled={loading}>
            {loading ? 'Creating Account...' : (<>Create Account <UserPlus size={18} strokeWidth={2.5} /></>)}
          </GradientButton>

          <p className="text-center text-slate-500 text-[14px] mt-6 font-semibold">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 font-bold hover:underline hover:text-orange-700 transition-all ml-1">
              Sign In
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default Signup;
