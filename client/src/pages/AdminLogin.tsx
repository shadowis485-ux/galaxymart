import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Shield, X } from 'lucide-react';
import { authApi } from '../lib/api';
import { useLocation } from 'wouter';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [, navigate] = useLocation();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError('');
    if (!password) { setError('Please enter the admin password'); return; }
    setLoading(true);
    try {
      const { token, email }: any = await authApi.login({ password });
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_email', email);
      toast.success('Welcome, Admin!');
      navigate('/admin');
    } catch (err: any) {
      const msg = err.message || 'Wrong admin password';
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="text-6xl mb-4 block select-none">🐉</motion.div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">Admin <span className="gold-text">Access</span></h1>
          <p className="text-gray-500 text-sm">DragonzStore control panel</p>
        </div>

        <div className="glass-card p-7">
          <div className="flex items-center gap-2 mb-6 p-3 bg-neon-500/5 border border-neon-500/15 rounded-lg">
            <Shield size={15} className="text-neon-500 flex-shrink-0" />
            <p className="text-gray-400 text-xs">Protected area — authorized access only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Admin Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter admin password"
                  className={`input-gold w-full pl-10 pr-11 py-3.5 text-sm ${error ? 'border-red-500/50' : ''}`}
                  autoFocus
                  data-testid="input-admin-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mt-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <X size={13} className="text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-xs font-medium">{error}</p>
                </motion.div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2" data-testid="button-admin-login">
              {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Lock size={15} />}
              {loading ? 'Authenticating...' : 'Access Admin Panel'}
            </button>
          </form>
        </div>

        <button onClick={() => navigate('/')} className="w-full mt-4 text-gray-600 hover:text-gray-300 text-sm transition-colors text-center">
          ← Back to Store
        </button>
      </motion.div>
    </div>
  );
}
