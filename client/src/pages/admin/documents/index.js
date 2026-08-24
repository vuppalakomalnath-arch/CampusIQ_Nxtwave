import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../../components/AppShell/AppShell';
import api from '../../../services/api';
import { FileText, Upload, Search, RefreshCw, Eye, Trash2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'All') params.append('status', statusFilter);

      const res = await api.get(`/documents?${params.toString()}`);
      setDocuments(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [statusFilter]);

  const handleReprocess = async (id) => {
    try {
      await api.post(`/documents/${id}/reprocess`);
      fetchDocuments();
    } catch (err) {
      console.error('Reprocess failed:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to archive this document?')) return;
    try {
      await api.delete(`/documents/${id}`);
      fetchDocuments();
    } catch (err) {
      console.error('Archive failed:', err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'faculty']}>
      <AppShell>
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl font-bold font-display text-white">Institutional Document Store</h1>
              <p className="mt-1 text-xs text-slate-400">
                Manage, audit, and re-index college circulars, handbooks, syllabi, and guidelines
              </p>
            </div>

            <Link
              href="/admin/documents/upload"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 hover:from-brand-500 hover:to-cyan-400 transition"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Document</span>
            </Link>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 glass-panel rounded-2xl p-3.5">
            <div className="flex flex-1 items-center gap-2 min-w-[240px] rounded-xl bg-slate-900 px-3 py-1.5 border border-slate-800">
              <Search className="h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search documents by title or filename..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchDocuments()}
                className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="READY">Ready</option>
                <option value="PROCESSING">Processing</option>
                <option value="FAILED">Failed</option>
                <option value="ARCHIVED">Archived</option>
              </select>

              <button
                onClick={fetchDocuments}
                className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-slate-200"
                title="Refresh list"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Documents Table */}
          <div className="glass-panel overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-3.5">Document Title</th>
                    <th className="px-5 py-3.5">Knowledge Base</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Version</th>
                    <th className="px-5 py-3.5">Chunks</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {documents.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-5 py-8 text-center text-slate-500">
                        {loading ? 'Loading documents...' : 'No documents found.'}
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc._id} className="hover:bg-slate-900/50 transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
                              <FileText className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/admin/documents/${doc._id}`}
                                className="font-semibold text-slate-200 hover:text-brand-300 transition truncate block"
                              >
                                {doc.title}
                              </Link>
                              <span className="text-[10px] text-slate-500 truncate block">
                                {doc.originalFilename}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 font-medium text-slate-300">
                          {doc.knowledgeBase?.name || 'General'}
                        </td>

                        <td className="px-5 py-3.5 text-slate-400">{doc.department}</td>

                        <td className="px-5 py-3.5 font-semibold text-slate-300">v{doc.currentVersion || 1}</td>

                        <td className="px-5 py-3.5 font-semibold text-brand-400">{doc.chunkCount || 0}</td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              doc.status === 'READY'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : doc.status === 'PROCESSING'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                                : doc.status === 'FAILED'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleReprocess(doc._id)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                              title="Reprocess Document"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                            <Link
                              href={`/admin/documents/${doc._id}`}
                              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-brand-400"
                              title="View Document Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(doc._id)}
                              className="rounded p-1 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                              title="Archive Document"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
