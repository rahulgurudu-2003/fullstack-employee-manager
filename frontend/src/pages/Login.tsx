import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Eye, EyeOff, Loader2, Users, Shield, UserCheck, User } from 'lucide-react';
import homePageImg from '../assets/HomePage.png';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-white flex overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col justify-center relative p-6 sm:p-12 lg:p-16 bg-white h-full overflow-y-auto">
        <div className="w-full max-w-sm mx-auto space-y-6 py-10">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-blue-50 text-[#2563EB] rounded-[20px] mb-2 flex items-center justify-center shadow-sm">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-[#2563EB] tracking-widest">EMS</h2>
            <p className="text-xs font-bold text-[#64748B] mt-1">Employee Management System</p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#0F172A]">Welcome back!</h3>
            <p className="text-xs font-bold text-[#64748B]">Please sign in to your account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-[#DC2626] text-xs font-bold px-3.5 py-2 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-sm text-[#0F172A] placeholder-gray-450 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all bg-gray-55/10"
                />
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400">
                  <Mail className="w-4 h-4" />
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-sm text-[#0F172A] placeholder-gray-450 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all bg-gray-55/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-450 hover:text-[#0F172A] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-[#64748B] pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 border-gray-300 rounded text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Demo Accounts default passwords are: Admin@123 / HRManager@123 / Employee@123')}
                className="text-[#2563EB] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <div className="text-center pt-1">
            <span className="text-xs text-[#64748B] font-bold">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => alert('Please contact the IT System Administrator to register new employee credentials.')}
                className="text-[#2563EB] hover:underline font-bold"
              >
                Contact administrator
              </button>
            </span>
          </div>

          <div className="bg-slate-50/50 border border-slate-100/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 mt-2">
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@ems.com');
                  setPassword('Admin@123');
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-blue-100/60 bg-white hover:bg-blue-50/50 hover:border-blue-300 transition-all duration-200 group text-center cursor-pointer shadow-sm hover:shadow active:scale-95"
              >
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform duration-200 mb-1.5">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-800">Admin</span>
                <span className="text-[8px] text-slate-500 font-medium">Full Access</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('hr@ems.com');
                  setPassword('HRManager@123');
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-indigo-100/60 bg-white hover:bg-indigo-50/50 hover:border-indigo-300 transition-all duration-200 group text-center cursor-pointer shadow-sm hover:shadow active:scale-95"
              >
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform duration-200 mb-1.5">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-800">HR Manager</span>
                <span className="text-[8px] text-slate-500 font-medium">HR Control</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('employee@ems.com');
                  setPassword('Employee@123');
                }}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-emerald-100/60 bg-white hover:bg-emerald-50/50 hover:border-emerald-300 transition-all duration-200 group text-center cursor-pointer shadow-sm hover:shadow active:scale-95"
              >
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-200 mb-1.5">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-slate-800">Employee</span>
                <span className="text-[8px] text-slate-500 font-medium">Self-Portal</span>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-8 text-[10px] font-bold text-[#64748B] tracking-wide">
          © 2026 EMS. All rights reserved.
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-[#F5F8FF] relative items-center justify-center border-l border-gray-100 overflow-hidden h-full p-8 lg:p-16">
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-blue-200/10 blur-[95px] pointer-events-none"></div>

        <img
          src={homePageImg}
          alt="EMS Illustration"
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const fallback = parent.querySelector('.fallback-box');
              if (fallback) fallback.classList.remove('hidden');
            }
          }}
        />

        <div className="fallback-box hidden w-full max-w-sm bg-white p-8 rounded-3xl border border-gray-150 shadow-lg space-y-6 text-center">
          <div className="flex justify-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
            <span className="w-3 h-3 rounded-full bg-slate-400"></span>
          </div>
          <div className="h-4 bg-gray-50 rounded-lg w-3/4 mx-auto animate-pulse"></div>
          <div className="w-full bg-[#2563EB] h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold">
            Dashboard Overview
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
