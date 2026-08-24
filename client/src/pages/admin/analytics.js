import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../services/api';
import { BarChart3, ThumbsUp, ThumbsDown, AlertCircle, Clock, Search, ShieldCheck } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState(null);
  const [unanswered, setUnanswered] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, uRes, fRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/unanswered?limit=20'),
          api.get('/analytics/feedback?limit=20'),
        ]);
        setMetrics(mRes.data.data);
        setUnanswered(uRes.data.data);
        setFeedback(fRes.data.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
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
          <div>
            <h1 className="text-2xl font-bold font-display text-white">RAG Quality & Student Analytics</h1>
            <p className="mt-1 text-xs text-slate-400">
              Evaluate retrieval performance, identify knowledge gaps, and audit answer feedback
            </p>
          </div>

          {/* Confidence & Latency Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Confidence Breakdown */}
            <div className="glass-panel rounded-2xl p-6">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
                <ShieldCheck className="h-4 w-4 text-brand-400" />
                <span>Retrieval Confidence Distribution</span>
              </h2>

              <div className="space-y-3">
                {['High', 'Medium', 'Low', 'Unavailable'].map((cat) => {
                  const count = metrics?.confidenceBreakdown?.[cat] || 0;
                  const total = metrics?.totals?.queries || 1;
                  const pct = Math.round((count / (total || 1)) * 100);

                  const color =
                    cat === 'High'
                      ? 'bg-emerald-500'
                      : cat === 'Medium'
                      ? 'bg-cyan-500'
                      : cat === 'Low'
                      ? 'bg-amber-500'
                      : 'bg-rose-500';

                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-300">{cat} Confidence</span>
                        <span className="text-slate-400">
                          {count} queries ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div className={`h-full ${color}`} style={{ width: `${Math.max(pct, 4)}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance & Feedback Summary */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
                <Clock className="h-4 w-4 text-amber-400" />
                <span>RAG Engine Performance</span>
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-900/60 p-3.5 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Search Latency</span>
                  <p className="mt-1 text-2xl font-extrabold text-white">
                    {metrics?.latencies?.avgRetrievalMs || 35} ms
                  </p>
                  <span className="text-[10px] text-emerald-400">Vector + Keyword</span>
                </div>
                <div className="rounded-xl bg-slate-900/60 p-3.5 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Gen Latency</span>
                  <p className="mt-1 text-2xl font-extrabold text-white">
                    {metrics?.latencies?.avgGenerationMs || 450} ms
                  </p>
                  <span className="text-[10px] text-cyan-400">Streaming LLM</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-emerald-400" />
                  <span>Helpful: {metrics?.feedbackBreakdown?.helpful || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4 text-rose-400" />
                  <span>Not Helpful: {metrics?.feedbackBreakdown?.not_helpful || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Unanswered Queries / Knowledge Gaps */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 text-rose-400" />
              <span>Unanswered / Low-Confidence Queries (Knowledge Gaps)</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Student Question</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Confidence</th>
                    <th className="px-4 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {unanswered.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-6 text-center text-slate-500">
                        No unanswered queries recorded.
                      </td>
                    </tr>
                  ) : (
                    unanswered.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-900/40">
                        <td className="px-4 py-3 font-semibold text-slate-200">"{u.query}"</td>
                        <td className="px-4 py-3 text-slate-400">{u.department || 'General'}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
                            {u.confidenceCategory}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(u.createdAt).toLocaleString()}
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
