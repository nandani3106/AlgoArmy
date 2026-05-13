import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import CustomInput from '../components/CustomInput';
import GradientButton from '../components/GradientButton';

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Candidate');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login Data:', { ...formData, role });

    if (role === 'Admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
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
                onClick={() => setRole(r)}
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

          <GradientButton type="submit" className="mt-4">
            Sign In <LogIn size={18} strokeWidth={2.5} />
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
