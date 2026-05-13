import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import CustomInput from '../components/CustomInput';
import GradientButton from '../components/GradientButton';

const API_BASE = 'http://localhost:5000';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Candidate');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      // Security check: role mismatch
      const selectedRole = role.toLowerCase();
      if (data.user.role !== selectedRole) {
        setError('Please login using the correct role.');
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
        title="Welcome Back"
        subtitle="Sign in to your AlgoArmy account"
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

          <div className="flex items-center justify-between mb-6 ml-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-3.5 h-3.5 rounded border-orange-200 bg-white text-orange-600 focus:ring-orange-500/20 transition-all cursor-pointer"
              />
              <span className="text-[12px] text-slate-500 group-hover:text-slate-700 transition-colors font-semibold">Remember me</span>
            </label>
            <Link to="#" className="text-[14px] text-orange-600 hover:text-orange-700 hover:underline transition-colors font-bold">
              Forgot Password?
            </Link>
          </div>

          {error && (
            <p className="text-red-500 text-[10px] font-bold tracking-tight mt-1 ml-1 animate-pulse">
              {error}
            </p>
          )}

          <GradientButton type="submit" className="mt-4" disabled={loading}>
            {loading ? 'Signing In...' : (<>Sign In <LogIn size={18} strokeWidth={2.5} /></>)}
          </GradientButton>

          <p className="text-center text-slate-500 text-[14px] mt-6 font-semibold">
            Don't have an account?{' '}
            <Link to="/signup" className="text-orange-600 font-bold hover:underline hover:text-orange-700 transition-all ml-1">
              Sign Up
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
};

export default Login;
