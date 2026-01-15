import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import PageWrapper, { THEME, SPRING_CONFIG } from '../components/layout/PageWrapper';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await register(formData.username, formData.email, formData.password);
    if (success) {
      navigate('/marketplace');
    }
    setLoading(false);
  };

  return (
    <PageWrapper className="flex items-center justify-center min-h-screen px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={SPRING_CONFIG}
        className={`w-full max-w-md p-8 rounded-[32px] ${THEME.glass} relative overflow-hidden`}
      >
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-300/20 blur-[50px] -z-10" />

        <div className="mb-8 text-center">
          <h2 className={`text-3xl font-black tracking-tight ${THEME.textMain} mb-2`}>Join the Circle</h2>
          <p className={THEME.textSec}>Start trading sustainably today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-2">Username</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/40 group-focus-within:text-emerald-700 transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                className="w-full bg-white/40 border border-white/60 focus:border-emerald-500/50 rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-emerald-900 placeholder:text-emerald-900/30"
                placeholder="NatureLover23"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-2">Email</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/40 group-focus-within:text-emerald-700 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                className="w-full bg-white/40 border border-white/60 focus:border-emerald-500/50 rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-emerald-900 placeholder:text-emerald-900/30"
                placeholder="you@swapit.io"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-900/60 ml-2">Password</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-900/40 group-focus-within:text-emerald-700 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                className="w-full bg-white/40 border border-white/60 focus:border-emerald-500/50 rounded-2xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-emerald-900 placeholder:text-emerald-900/30"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-4 mt-4 bg-emerald-900 text-[#F7F5E6] rounded-2xl font-bold text-lg shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 hover:bg-emerald-800 transition-colors disabled:opacity-70"
          >
            {loading ? 'Creating Profile...' : 'Create Account'}
            {!loading && <ArrowRight size={20} />}
          </motion.button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-emerald-800/60">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-800 underline decoration-2 underline-offset-2 hover:text-emerald-950">
            Open Vault (Login)
          </Link>
        </div>
      </motion.div>
    </PageWrapper>
  );
};

export default Register;