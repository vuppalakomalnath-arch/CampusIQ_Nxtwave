import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDropzone } from 'react-dropzone';
import ProtectedRoute from '../../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../../components/AppShell/AppShell';
import api from '../../../services/api';
import { useKnowledgeBaseStore } from '../../../store/knowledgeBaseStore';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function DocumentUploadPage() {
  const router = useRouter();
  const { collections, fetchCollections, isLoading, error: storeError } = useKnowledgeBaseStore();

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [knowledgeBaseId, setKnowledgeBaseId] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Quick Create Modal state
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickKbData, setQuickKbData] = useState({
    name: '',
    department: 'Admissions',
    description: '',
    type: 'global',
    allowedRoles: ['student', 'faculty', 'admin'],
  });
  const [creatingKb, setCreatingKb] = useState(false);
  const [quickKbError, setQuickKbError] = useState('');

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    if (collections.length > 0) {
      if (!knowledgeBaseId || !collections.some((c) => c._id === knowledgeBaseId)) {
        setKnowledgeBaseId(collections[0]._id);
        setDepartment(collections[0].department || 'General');
      }
    }
  }, [collections, knowledgeBaseId]);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
  });

  const handleQuickCreateKb = async (e) => {
    e.preventDefault();
    if (!quickKbData.name.trim()) {
      setQuickKbError('Please enter a collection name');
      return;
    }
    setCreatingKb(true);
    setQuickKbError('');
    try {
      const res = await api.post('/admin/knowledge-bases', quickKbData);
      const newKb = res.data.data;
      await fetchCollections();
      if (newKb && newKb._id) {
        setKnowledgeBaseId(newKb._id);
        setDepartment(newKb.department || 'General');
      }
      setShowQuickCreate(false);
      setQuickKbData({
        name: '',
        department: 'Admissions',
        description: '',
        type: 'global',
        allowedRoles: ['student', 'faculty', 'admin'],
      });
    } catch (err) {
      setQuickKbError(err.response?.data?.message || 'Failed to create knowledge base');
    } finally {
      setCreatingKb(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a document file to upload');
      return;
    }
    if (!knowledgeBaseId) {
      setError('Please choose a target knowledge base (or create one first)');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('knowledgeBaseId', knowledgeBaseId);
    formData.append('department', department);

    try {
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
      setTimeout(() => {
        router.push(`/admin/documents/${res.data.data._id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document.');
      setUploading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'faculty']}>
      <AppShell>
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
            <Link
              href="/admin/documents"
              className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold font-display text-white">Upload College Document</h1>
              <p className="mt-0.5 text-xs text-slate-400">
                PDF, DOCX, TXT, and Markdown files will be parsed, chunked, and vector indexed automatically
              </p>
            </div>
          </div>

          {storeError && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Failed to load knowledge bases: {storeError}</span>
              </div>
              <button
                type="button"
                onClick={() => fetchCollections()}
                className="flex items-center gap-1 rounded-lg bg-rose-500/20 px-2.5 py-1 text-xs font-medium hover:bg-rose-500/30 transition text-rose-200"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {!isLoading && collections.length === 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
              <div className="flex items-start sm:items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5 sm:mt-0" />
                <div>
                  <p className="font-semibold text-amber-300">No Knowledge Base Collections Found</p>
                  <p className="text-[11px] text-amber-200/80 mt-0.5">
                    Documents require a target collection to be categorized and indexed for RAG queries.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowQuickCreate(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition shadow"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Knowledge Base</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Document uploaded successfully! Redirecting to processing monitor...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
                isDragActive
                  ? 'border-brand-400 bg-brand-950/20'
                  : file
                  ? 'border-emerald-500/50 bg-emerald-950/10'
                  : 'border-slate-800 bg-slate-900/40 hover:border-brand-500/40'
              }`}
            >
              <input {...getInputProps()} />
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 mb-3">
                <Upload className="h-7 w-7" />
              </div>

              {file ? (
                <div>
                  <p className="text-sm font-bold text-emerald-400">{file.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <span className="mt-2 inline-block rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                    Click or drag another file to replace
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Drag and drop your college document here, or click to browse
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500">Supported formats: PDF, DOCX, TXT, MD (Max 20MB)</p>
                </div>
              )}
            </div>

            {/* Metadata Fields */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. B.Tech Academic Regulations 2026-2027"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Target Knowledge Base
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowQuickCreate(true)}
                      className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition"
                    >
                      <Plus className="h-3 w-3" />
                      <span>New Collection</span>
                    </button>
                  </div>
                  <select
                    value={knowledgeBaseId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setKnowledgeBaseId(val);
                      const selected = collections.find((c) => c._id === val);
                      if (selected) setDepartment(selected.department || 'General');
                    }}
                    disabled={isLoading || collections.length === 0}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-slate-100 focus:border-brand-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading ? (
                      <option value="" disabled className="bg-slate-900 text-slate-400">
                        Loading knowledge bases...
                      </option>
                    ) : collections.length === 0 ? (
                      <option value="" disabled className="bg-slate-900 text-slate-400">
                        No knowledge bases found — Click + New Collection
                      </option>
                    ) : (
                      <>
                        <option value="" disabled className="bg-slate-900 text-slate-400">
                          -- Select Knowledge Base --
                        </option>
                        {collections.map((c) => (
                          <option key={c._id} value={c._id} className="bg-slate-900 text-slate-100 py-1.5">
                            {c.name} ({c.department})
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Department Scope
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science, Admissions, General"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs text-slate-200 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading || !file || collections.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:from-brand-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Uploading & Triggering RAG Ingestion...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Upload & Index Document</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Create Knowledge Base Modal */}
          {showQuickCreate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white">Create Knowledge Base</h3>
                  <button
                    type="button"
                    onClick={() => setShowQuickCreate(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {quickKbError && (
                  <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{quickKbError}</span>
                  </div>
                )}

                <form onSubmit={handleQuickCreateKb} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Collection Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Admissions & Scholarships"
                      value={quickKbData.name}
                      onChange={(e) => setQuickKbData({ ...quickKbData, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Admissions, Computer Science"
                      value={quickKbData.department}
                      onChange={(e) => setQuickKbData({ ...quickKbData, department: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                      Description
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Brief summary of documents in this collection..."
                      value={quickKbData.description}
                      onChange={(e) => setQuickKbData({ ...quickKbData, description: e.target.value })}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-brand-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowQuickCreate(false)}
                      className="rounded-xl px-4 py-2 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingKb}
                      className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
                    >
                      {creatingKb ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                      <span>{creatingKb ? 'Creating...' : 'Create & Select'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
