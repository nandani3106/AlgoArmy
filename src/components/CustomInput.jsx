import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const CustomInput = ({ 
  icon: Icon, 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  name, 
  required = false 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="mb-4 w-full">
      {label && <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">{label}</label>}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0B1B3B]/70 group-focus-within:text-orange-600 transition-colors duration-300">
            <Icon size={16} strokeWidth={2.5} />
          </div>
        )}
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-white border border-orange-100/80 rounded-xl py-3.5 ${Icon ? 'pl-11' : 'pl-4'} pr-12 text-[#0B1B3B] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/40 transition-all duration-300 font-medium`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0B1B3B] transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomInput;
