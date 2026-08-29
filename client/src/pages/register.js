import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { GraduationCap, Lock, Mail, User, Building, Loader2, ArrowRight, AlertCircle } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: 'Computer Science',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      const { user, token } = response.data.data;
      setAuth(user, token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 shadow-xl shadow-brand-500/25 mb-4">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">Create Your CampusIQ Account</h2>
          <p className="mt-1.5 text-xs text-slate-400">Join the campus knowledge network</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                placeholder="Alex Johnson"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              College Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="alex.johnson@campusiq.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 px-3 text-xs text-slate-200 focus:border-brand-500 focus:outline-none cursor-pointer"
              >
                <option value="student" className="bg-slate-900 text-slate-100">Student</option>
                <option value="faculty" className="bg-slate-900 text-slate-100">Faculty</option>
                <option value="admin" className="bg-slate-900 text-slate-100">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 px-3 text-xs text-slate-200 focus:border-brand-500 focus:outline-none cursor-pointer"
              >
                <option value="Computer Science" className="bg-slate-900 text-slate-100">Computer Science</option>
                <option value="Admissions" className="bg-slate-900 text-slate-100">Admissions</option>
                <option value="Examination Cell" className="bg-slate-900 text-slate-100">Examination Cell</option>
                <option value="Hostel & Student Affairs" className="bg-slate-900 text-slate-100">Hostel & Student Affairs</option>
                <option value="Placements" className="bg-slate-900 text-slate-100">Placements</option>
                <option value="General" className="bg-slate-900 text-slate-100">General / All</option>
              </select>
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
                <span>Complete Registration</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-400 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
