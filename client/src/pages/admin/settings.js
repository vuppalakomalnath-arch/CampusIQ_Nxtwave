import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import api from '../../services/api';
import { Sliders, CheckCircle2, AlertCircle, RefreshCw, Cpu, Database, Cloud } from 'lucide-react';

export default function AdminSettingsPage() {
  const [ragHealth, setRagHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/rag/health');
      setRagHealth(res.data.data);
    } catch (err) {
      console.error('Failed to load RAG health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AppShell>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl font-bold font-display text-white">RAG Engine & Infrastructure Health</h1>
              <p className="mt-1 text-xs text-slate-400">
                Diagnostic status of embeddings, vector store, AI providers, and document queues
              </p>
            </div>

            <button
              onClick={fetchHealth}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Vector & Embedding Engine */}
            <div className="glass-panel rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Database className="h-4 w-4 text-brand-400" />
                  <span>Vector Database & Embeddings</span>
                </h3>
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Healthy</span>
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Indexed Chunks:</span>
                  <span className="font-bold text-brand-400">{ragHealth?.totalIndexedChunks || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Embedding Model:</span>
                  <span className="font-medium text-slate-200">{ragHealth?.embeddingModel || 'text-embedding-004'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vector Search Index:</span>
                  <span className="font-mono text-slate-300">{ragHealth?.vectorIndexName || 'college_documents_vector_index'}</span>
                </div>
              </div>
            </div>

            {/* AI Providers */}
            <div className="glass-panel rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-purple-400" />
                  <span>Generative AI Providers</span>
                </h3>
                <span
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    ragHealth?.aiProviderAvailable
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {ragHealth?.aiProviderAvailable ? 'Configured' : 'Dev Standby'}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">OpenRouter (Primary):</span>
                  <span className={ragHealth?.openRouterConfigured ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                    {ragHealth?.openRouterConfigured ? 'Active' : 'Not Set in .env'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Google Gemini (Fallback):</span>
                  <span className={ragHealth?.geminiConfigured ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                    {ragHealth?.geminiConfigured ? 'Active' : 'Not Set in .env'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Storage Provider:</span>
                  <span className="font-medium text-slate-200">{ragHealth?.storageProvider || 'local'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
