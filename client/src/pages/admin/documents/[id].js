import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ProtectedRoute from '../../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../../components/AppShell/AppShell';
import api from '../../../services/api';
import {
  FileText,
  ArrowLeft,
  RefreshCw,
  History,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Upload,
  Layers,
} from 'lucide-react';

export default function DocumentDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [doc, setDoc] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reprocessing, setReprocessing] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [docRes, verRes] = await Promise.all([
        api.get(`/documents/${id}`),
        api.get(`/documents/${id}/versions`),
      ]);
      setDoc(docRes.data.data);
      setVersions(verRes.data.data || []);
    } catch (err) {
      console.error('Failed to load document details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleReprocess = async () => {
    setReprocessing(true);
    try {
      await api.post(`/documents/${id}/reprocess`);
      await fetchDetails();
    } catch (err) {
      console.error('Reprocess failed:', err);
    } finally {
      setReprocessing(false);
    }
  };

  const handleRestore = async (versionNum) => {
    if (!confirm(`Restore document to version ${versionNum}?`)) return;
    try {
      await api.post(`/documents/${id}/restore/${versionNum}`);
      fetchDetails();
    } catch (err) {
      console.error('Version restore failed:', err);
    }
  };

  if (loading || !doc) {
    return (
      <ProtectedRoute allowedRoles={['admin', 'faculty']}>
        <AppShell>
          <div className="p-8 text-center text-slate-400">Loading document details...</div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin', 'faculty']}>
      <AppShell>
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/documents"
                className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-brand-500/10 px-2 py-0.5 text-[10px] font-bold text-brand-400 border border-brand-500/20">
                    Version {doc.currentVersion}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      doc.status === 'READY'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
                <h1 className="text-xl font-bold font-display text-white mt-1">{doc.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReprocess}
                disabled={reprocessing}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${reprocessing ? 'animate-spin' : ''}`} />
                <span>Reprocess Chunks</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="glass-panel rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Indexed Chunks</span>
              <p className="mt-1 text-2xl font-extrabold text-brand-400">{doc.chunkCount || 0}</p>
            </div>
            <div className="glass-panel rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Words Extracted</span>
              <p className="mt-1 text-2xl font-extrabold text-slate-100">
                {doc.extractedTextMetadata?.wordCount?.toLocaleString() || 0}
              </p>
            </div>
            <div className="glass-panel rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">OCR Status</span>
              <p className="mt-1 text-base font-bold text-slate-200">{doc.ocrStatus || 'NOT_REQUIRED'}</p>
            </div>
            <div className="glass-panel rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 uppercase font-semibold">Department Scope</span>
              <p className="mt-1 text-base font-bold text-slate-200">{doc.department}</p>
            </div>
          </div>

          {/* AI Executive Summary Card */}
          {doc.summary && (
            <div className="glass-panel rounded-2xl p-6">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>AI Executive Summary</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                {doc.summary}
              </p>
            </div>
          )}

          {/* AI Generated FAQs */}
          {doc.faqList && doc.faqList.length > 0 && (
            <div className="glass-panel rounded-2xl p-6">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-3">
                <HelpCircle className="h-4 w-4 text-brand-400" />
                <span>Extracted FAQs ({doc.faqList.length})</span>
              </h2>
              <div className="space-y-3">
                {doc.faqList.map((faq, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs">
                    <p className="font-semibold text-slate-200">Q: {faq.question}</p>
                    <p className="mt-1 text-slate-400 leading-relaxed">A: {faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Version History */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
              <History className="h-4 w-4 text-purple-400" />
              <span>Version History & Audit Trail</span>
            </h2>

            <div className="space-y-2.5">
              {versions.map((ver) => (
                <div
                  key={ver._id}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-200">v{ver.versionNumber}</span>
                    <span className="text-slate-400">{ver.changeNotes || 'Document upload'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-500">
                      {new Date(ver.createdAt).toLocaleDateString()}
                    </span>
                    {ver.versionNumber !== doc.currentVersion && (
                      <button
                        onClick={() => handleRestore(ver.versionNumber)}
                        className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-brand-300 hover:bg-slate-700"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
