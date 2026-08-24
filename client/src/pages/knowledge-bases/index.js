import { useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import { useKnowledgeBaseStore } from '../../store/knowledgeBaseStore';
import { useChatStore } from '../../store/chatStore';
import { BookOpen, FileText, ArrowRight, Sparkles, Building, Layers } from 'lucide-react';
import { useRouter } from 'next/router';

export default function KnowledgeBasesPage() {
  const router = useRouter();
  const { collections, fetchCollections, isLoading } = useKnowledgeBaseStore();
  const { setSelectedKBIds, startNewChat } = useChatStore();

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleQueryCollection = (kb) => {
    startNewChat();
    setSelectedKBIds([kb._id]);
    router.push('/chat');
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl font-bold font-display text-white">College Knowledge Bases</h1>
              <p className="mt-1 text-xs text-slate-400">
                Browse verified departmental document collections indexed by CampusIQ
              </p>
            </div>

            <button
              onClick={() => router.push('/chat')}
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-brand-500 transition shadow-md shadow-brand-500/20"
            >
              <Sparkles className="h-4 w-4" />
              <span>Ask Across All KBs</span>
            </button>
          </div>

          {/* Collections Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((kb) => (
              <div
                key={kb._id}
                className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300 uppercase tracking-wider border border-slate-700">
                      {kb.department || 'General'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100">{kb.name}</h3>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed min-h-[36px] line-clamp-2">
                    {kb.description || 'Verified institutional documents and policy circulars.'}
                  </p>

                  {/* Document count */}
                  <div className="mt-4 flex items-center gap-2 text-xs text-brand-400 font-medium">
                    <FileText className="h-3.5 w-3.5" />
                    <span>{kb.documentCount || 0} active indexed documents</span>
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => handleQueryCollection(kb)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-300 hover:text-white transition group"
                  >
                    <span>Query this collection</span>
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
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
