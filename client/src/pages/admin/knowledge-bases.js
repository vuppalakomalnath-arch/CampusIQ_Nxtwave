import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../services/api';
import { BookOpen, Plus, FileText, CheckCircle2, Archive, Shield, AlertCircle } from 'lucide-react';

export default function AdminKnowledgeBasesPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    department: 'General',
    type: 'global',
    description: '',
    allowedRoles: ['student', 'faculty', 'admin'],
  });
  const [error, setError] = useState('');

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await api.get('/knowledge-bases');
      setCollections(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/knowledge-bases', formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        slug: '',
        department: 'General',
        type: 'global',
        description: '',
        allowedRoles: ['student', 'faculty', 'admin'],
      });
      fetchCollections();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create knowledge base');
    }
  };

  const handleToggleStatus = async (kb) => {
    const action = kb.status === 'active' ? 'archive' : 'activate';
    try {
      await api.post(`/admin/knowledge-bases/${kb._id}/${action}`);
      fetchCollections();
    } catch (err) {
      console.error('Status toggle failed:', err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AppShell>
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl font-bold font-display text-white">Knowledge Bases & Collections</h1>
              <p className="mt-1 text-xs text-slate-400">
                Organize institutional documents by departments, schools, and access tiers
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 hover:from-brand-500 hover:to-cyan-400 transition"
            >
              <Plus className="h-4 w-4" />
              <span>New Knowledge Base</span>
            </button>
          </div>

          {/* Create Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white">Create Knowledge Base</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Collection Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Electrical Engineering"
                      value={formData.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        setFormData({ ...formData, name, slug });
                      }}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-brand-500 focus:outline-none cursor-pointer"
                      >
                        <option value="global" className="bg-slate-900 text-slate-100">Global Campus</option>
                        <option value="department" className="bg-slate-900 text-slate-100">Department-Specific</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Description
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Summary of documents contained in this knowledge base..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-500"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Collections Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((kb) => (
              <div key={kb._id} className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300 uppercase">
                      {kb.department}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        kb.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {kb.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{kb.name}</h3>
                  <p className="mt-1.5 text-xs text-slate-400 line-clamp-2">{kb.description}</p>

                  <div className="mt-4 flex items-center gap-2 text-xs text-brand-400 font-semibold">
                    <FileText className="h-3.5 w-3.5" />
                    <span>{kb.documentCount || 0} Indexed Documents</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 uppercase">{kb.type}</span>
                  <button
                    onClick={() => handleToggleStatus(kb)}
                    className="rounded-lg bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:bg-slate-800 border border-slate-800"
                  >
                    {kb.status === 'active' ? 'Archive' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
