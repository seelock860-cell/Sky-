import React, { useState } from 'react';
import { Logo } from '../components/Logo';
import { adminLogin } from '../lib/api';
import { UserProfile } from '../types';
import { Lock, User, AlertCircle, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: (profile: UserProfile) => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  const [username, setUsername] = useState('sky');
  const [password, setPassword] = useState('sky123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await adminLogin(username, password);
      onLoginSuccess(res.profile);
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#061413] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div onClick={onNavigateHome} className="inline-block cursor-pointer mb-6">
          <Logo size="lg" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
          SkyHome Admin Portal
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          Authorized executive portal for managing properties, customer enquiries, and website configuration.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-[#071C1A] border border-[#143330] py-8 px-6 sm:px-10 rounded-2xl shadow-2xl space-y-6">
          {/* Temporary Credentials Information notice */}
          <div className="p-3.5 rounded-xl bg-[#0A2220] border border-[#E8AA35]/30 text-xs text-slate-300 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-[#E8AA35]">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Owner Temporary Access Credentials</span>
            </div>
            <p className="text-slate-400">
              Username: <code className="text-white font-mono bg-black/40 px-1 py-0.5 rounded">sky</code> · 
              Password: <code className="text-white font-mono bg-black/40 px-1 py-0.5 rounded">sky123</code>
            </p>
            <p className="text-[11px] text-amber-200/70">
              Note: Cryptographically hashed on server. You will be prompted to update this password after logging in.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-950/60 border border-rose-900 rounded-lg text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#0A2220] text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0A2220] text-slate-200 text-sm rounded-lg pl-10 pr-4 py-2.5 border border-[#143330] focus:border-[#E8AA35] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#E8AA35] hover:bg-[#F7CB75] text-black font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#E8AA35]/15"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-[#143330] text-center">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-xs text-slate-400 hover:text-[#E8AA35] transition-colors"
            >
              Return to Public Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
