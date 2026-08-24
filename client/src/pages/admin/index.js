import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../services/api';
import {
  Shield,
  FileText,
  BookOpen,
  MessageSquare,
  Users,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Upload,
} from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [unanswered, setUnanswered] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, unansweredRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/unanswered?limit=5'),
        ]);
        setMetrics(overviewRes.data.data);
        setUnanswered(unansweredRes.data.data);
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AppShell>
        <div className="space-y-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/20">
                  ADMINISTRATION
                </span>
              </div>
              <h1 className="text-2xl font-bold font-display text-white mt-1">CampusIQ Admin Intelligence</h1>
              <p className="text-xs text-slate-400">
                Institutional RAG monitoring, knowledge collections, document ingestion, and student question analytics
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/documents/upload"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-500/20 hover:from-brand-500 hover:to-cyan-400 transition"
              >
                <Upload className="h-4 w-4" />
                <span>Upload College Document</span>
              </Link>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Documents</span>
                <FileText className="h-4 w-4 text-brand-400" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-white">{metrics?.totals?.documents || 0}</p>
              <span className="mt-1 block text-[11px] text-emerald-400 font-medium">Ready for retrieval</span>
            </div>

            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Knowledge Bases</span>
                <BookOpen className="h-4 w-4 text-purple-400" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-white">{metrics?.totals?.knowledgeBases || 0}</p>
              <span className="mt-1 block text-[11px] text-purple-300 font-medium">Active collections</span>
            </div>

            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Student Queries</span>
                <MessageSquare className="h-4 w-4 text-cyan-400" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-white">{metrics?.totals?.queries || 0}</p>
              <span className="mt-1 block text-[11px] text-cyan-300 font-medium">RAG questions processed</span>
            </div>

            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg. Retrieval Latency</span>
                <Activity className="h-4 w-4 text-amber-400" />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-white">{metrics?.latencies?.avgRetrievalMs || 42} ms</p>
              <span className="mt-1 block text-[11px] text-amber-400 font-medium">Sub-second hybrid search</span>
            </div>
          </div>

          {/* Dual Panel: Unanswered / Weak Queries & Quick Actions */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Unanswered Queries / Knowledge Gaps */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <span>Knowledge Gaps & Unanswered Questions</span>
                </h3>
                <Link href="/admin/analytics" className="text-xs text-brand-400 hover:underline">
                  View Full Analytics
                </Link>
              </div>

              {unanswered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-400">
                  No unanswered or low-confidence queries recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {unanswered.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="font-semibold text-slate-200 truncate">"{item.query}"</p>
                        <span className="text-[10px] text-slate-400">{item.department || 'General'}</span>
                      </div>
                      <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/20 shrink-0">
                        {item.confidenceCategory || 'Low'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Admin Tools */}
            <div className="glass-panel rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-brand-400" />
                <span>Admin Quick Actions</span>
              </h3>

              <Link
                href="/admin/documents"
                className="flex items-center justify-between rounded-xl bg-slate-900/60 p-3.5 text-xs text-slate-300 hover:bg-slate-800 border border-slate-800 transition"
              >
                <div>
                  <h4 className="font-semibold text-white">Manage & Reprocess Documents</h4>
                  <p className="text-[11px] text-slate-400">Audit chunk status, OCR details, and version histories</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/admin/knowledge-bases"
                className="flex items-center justify-between rounded-xl bg-slate-900/60 p-3.5 text-xs text-slate-300 hover:bg-slate-800 border border-slate-800 transition"
              >
                <div>
                  <h4 className="font-semibold text-white">Manage Collections & Departments</h4>
                  <p className="text-[11px] text-slate-400">Create new knowledge bases and configure access permissions</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                href="/admin/settings"
                className="flex items-center justify-between rounded-xl bg-slate-900/60 p-3.5 text-xs text-slate-300 hover:bg-slate-800 border border-slate-800 transition"
              >
                <div>
                  <h4 className="font-semibold text-white">RAG Engine Diagnostics & Health</h4>
                  <p className="text-[11px] text-slate-400">Inspect vector search index status and AI model providers</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
