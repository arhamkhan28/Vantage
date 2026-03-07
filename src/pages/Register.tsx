import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Account created! Please login.');
        navigate('/login');
      } else {
        toast.error(data.error);
      }
    } catch (e) {
      toast.error('Registration failed');
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
          <p className="text-white/40 text-sm font-bold tracking-widest uppercase">JOIN THE MOVEMENT</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
            <input
              type="text"
              placeholder="FULL NAME"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm font-bold focus:border-white/40 transition-all outline-none"
              required
            />
          </div>
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
            CREATE ACCOUNT
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-white/40 font-bold tracking-widest">
          ALREADY HAVE AN ACCOUNT? <Link to="/login" className="text-white hover:underline">SIGN IN</Link>
        </p>
      </motion.div>
    </div>
  );
}
