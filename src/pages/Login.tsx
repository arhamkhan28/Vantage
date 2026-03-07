import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Github, Chrome, Phone, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [mode, setMode] = useState<'email' | 'otp' | 'admin'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        toast.success('Welcome back!');
        navigate('/');
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error('Login failed');
    }
  };

  const handleMockLogin = async (provider: string) => {
    const mockUser = {
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      email: `${provider}_${Date.now()}@example.com`,
      provider
    };
    try {
      const res = await fetch('/api/auth/mock-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockUser)
      });
      const data = await res.json();
      login(data.token, data.user);
      toast.success(`Logged in with ${provider}`);
      navigate('/');
    } catch (e) {
      toast.error('Mock login failed');
    }
  };

  const handleOTPLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '123456') {
      handleMockLogin('otp');
    } else {
      toast.error('Invalid OTP. Use 123456');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretCode: adminCode })
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        toast.success('Admin access granted');
        navigate('/admin');
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error('Admin login failed');
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-zinc-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white italic tracking-tighter mb-2">VANTAGE</h1>
          <p className="text-white/40 text-sm font-bold tracking-widest uppercase">
            {mode === 'admin' ? 'ADMIN ACCESS' : 'WELCOME BACK'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-black/40 p-1 rounded-xl mb-8">
          <button
            onClick={() => setMode('email')}
            className={`flex-1 py-2 text-[10px] font-black tracking-widest rounded-lg transition-all ${mode === 'email' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
          >
            EMAIL
          </button>
          <button
            onClick={() => setMode('otp')}
            className={`flex-1 py-2 text-[10px] font-black tracking-widest rounded-lg transition-all ${mode === 'otp' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
          >
            OTP
          </button>
          <button
            onClick={() => setMode('admin')}
            className={`flex-1 py-2 text-[10px] font-black tracking-widest rounded-lg transition-all ${mode === 'admin' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
          >
            ADMIN
          </button>
        </div>

        {mode === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm font-bold focus:border-white/40 transition-all outline-none"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm font-bold focus:border-white/40 transition-all outline-none"
                required
              />
            </div>
            <button className="w-full py-4 bg-white text-black rounded-xl font-black tracking-widest hover:bg-white/90 transition-all">
              SIGN IN
            </button>
          </form>
        )}

        {mode === 'otp' && (
          <form onSubmit={handleOTPLogin} className="space-y-4">
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                type="tel"
                placeholder="MOBILE NUMBER"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm font-bold focus:border-white/40 transition-all outline-none"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                type="text"
                placeholder="OTP (USE 123456)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm font-bold focus:border-white/40 transition-all outline-none"
                required
              />
            </div>
            <button className="w-full py-4 bg-white text-black rounded-xl font-black tracking-widest hover:bg-white/90 transition-all">
              VERIFY & LOGIN
            </button>
          </form>
        )}

        {mode === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="relative">
              <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                type="password"
                placeholder="ADMIN SECRET CODE"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm font-bold focus:border-white/40 transition-all outline-none"
                required
              />
            </div>
            <button className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black tracking-widest hover:bg-emerald-400 transition-all">
              ACCESS DASHBOARD
            </button>
          </form>
        )}

        {mode !== 'admin' && (
          <>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-[10px] font-black tracking-widest"><span className="bg-zinc-900 px-4 text-white/20">OR CONTINUE WITH</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleMockLogin('google')} className="flex items-center justify-center space-x-2 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                <Chrome className="w-4 h-4 text-white" />
                <span className="text-[10px] font-black text-white tracking-widest">GOOGLE</span>
              </button>
              <button onClick={() => handleMockLogin('github')} className="flex items-center justify-center space-x-2 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                <Github className="w-4 h-4 text-white" />
                <span className="text-[10px] font-black text-white tracking-widest">GITHUB</span>
              </button>
            </div>
          </>
        )}

        <p className="mt-8 text-center text-xs text-white/40 font-bold tracking-widest">
          DON'T HAVE AN ACCOUNT? <Link to="/register" className="text-white hover:underline">SIGN UP</Link>
        </p>
      </motion.div>
    </div>
  );
}
