import { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { User, Volume2, Globe, Shield, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || 'General',
    preferredLanguage: user?.preferredLanguage || 'en',
    voicePreferences: {
      enabled: user?.voicePreferences?.enabled ?? true,
      rate: user?.voicePreferences?.rate || 1.0,
      pitch: user?.voicePreferences?.pitch || 1.0,
    },
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      const res = await api.put('/auth/profile', formData);
      updateUser(res.data.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold font-display text-white">Account & System Settings</h1>
            <p className="mt-1 text-xs text-slate-400">
              Manage your personal preferences, voice assistant settings, and language
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Profile Card */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                <User className="h-4 w-4 text-brand-400" />
                <span>Profile Information</span>
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none cursor-pointer"
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
            </div>

            {/* Language & Voice Settings */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Volume2 className="h-4 w-4 text-brand-400" />
                <span>Voice & Multilingual Preferences</span>
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Preferred Query Language
                  </label>
                  <select
                    value={formData.preferredLanguage}
                    onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none cursor-pointer"
                  >
                    <option value="en" className="bg-slate-900 text-slate-100">English (Default)</option>
                    <option value="hi" className="bg-slate-900 text-slate-100">Hindi (हिंदी)</option>
                    <option value="es" className="bg-slate-900 text-slate-100">Spanish (Español)</option>
                    <option value="ta" className="bg-slate-900 text-slate-100">Tamil (தமிழ்)</option>
                    <option value="te" className="bg-slate-900 text-slate-100">Telugu (తెలుగు)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Speech Playback Rate ({formData.voicePreferences.rate}x)
                  </label>
                  <input
                    type="range"
                    min="0.75"
                    max="1.5"
                    step="0.05"
                    value={formData.voicePreferences.rate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        voicePreferences: {
                          ...formData.voicePreferences,
                          rate: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-brand-500 mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between">
              {saved ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Check className="h-4 w-4" />
                  <span>Settings saved successfully</span>
                </div>
              ) : (
                <div></div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 hover:from-brand-500 hover:to-cyan-400 transition disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
