import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { GraduationCap, Lock, Mail, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;
      setAuth(user, token);

      const redirectPath = (router.query.redirect && decodeURIComponent(router.query.redirect)) || (user.role === 'admin' ? '/admin' : '/dashboard');
      router.push(redirectPath);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
      setLoading(false);
    }
  };

  const handleQuickFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 shadow-xl shadow-brand-500/25 mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">Sign In to CampusIQ</h2>
          <p className="mt-1.5 text-xs text-slate-400">Access college knowledge bases and AI assistant</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              College Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="student@campusiq.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:from-brand-500 hover:to-cyan-400 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="border-t border-slate-800 pt-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Quick Fill Demo Accounts:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@campusiq.edu', 'Password123!')}
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-[11px] font-medium text-amber-300 hover:bg-amber-500/20"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('faculty@campusiq.edu', 'Password123!')}
              className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-2 py-1.5 text-[11px] font-medium text-purple-300 hover:bg-purple-500/20"
            >
              Faculty
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('student@campusiq.edu', 'Password123!')}
              className="rounded-lg border border-brand-500/30 bg-brand-500/10 px-2 py-1.5 text-[11px] font-medium text-brand-300 hover:bg-brand-500/20"
            >
              Student
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-brand-400 hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
