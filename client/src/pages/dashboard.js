import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../components/AppShell/AppShell';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { useKnowledgeBaseStore } from '../store/knowledgeBaseStore';
import {
  MessageSquare,
  BookOpen,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  FileText,
  PlusCircle,
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { conversations, loadConversations, startNewChat } = useChatStore();
  const { collections, fetchCollections } = useKnowledgeBaseStore();

  useEffect(() => {
    loadConversations();
    fetchCollections();
  }, [loadConversations, fetchCollections]);

  const handleStartChat = () => {
    startNewChat();
    router.push('/chat');
  };

  const sampleQuickQuestions = [
    { text: 'What is the required attendance to write semester exams?', dept: 'Exam Cell' },
    { text: 'What are the annual tuition fees for engineering programs?', dept: 'Admissions' },
    { text: 'What are the hostel gate curfew and night pass rules?', dept: 'Hostel' },
    { text: 'What is the minimum CGPA required for campus placements?', dept: 'Placements' },
  ];

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="space-y-8 max-w-6xl mx-auto">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-brand-500/20 bg-gradient-to-br from-brand-950/80 via-slate-900/90 to-slate-950 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300 border border-brand-500/20 mb-3">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>College Knowledge Base Active</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold font-display text-white">
                  Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
                </h1>
                <p className="mt-2 text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
                  CampusIQ is your institutional AI knowledge assistant. Ask questions grounded in official notices,
                  academic guidelines, syllabi, fee structures, and campus policies.
                </p>
              </div>

              <div className="flex shrink-0 gap-3">
                <button
                  onClick={handleStartChat}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:from-brand-500 hover:to-cyan-400"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Start New Query</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Questions Grid */}
          <div>
            <h2 className="text-base font-bold font-display text-slate-200 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-400" />
              <span>Frequently Asked Campus Questions</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {sampleQuickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    startNewChat();
                    router.push(`/chat?q=${encodeURIComponent(q.text)}`);
                  }}
                  className="glass-panel glass-panel-hover rounded-2xl p-4 text-left flex flex-col justify-between group"
                >
                  <p className="text-xs font-medium text-slate-200 group-hover:text-brand-300 transition">
                    "{q.text}"
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="rounded bg-slate-800 px-2 py-0.5 font-medium">{q.dept}</span>
                    <ArrowRight className="h-3 w-3 text-slate-500 group-hover:text-brand-400 group-hover:translate-x-0.5 transition" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Two-Column Hub: Recent Conversations & Accessible Knowledge Collections */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Conversations */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>Recent Conversations</span>
                </h3>
                <Link href="/chat" className="text-xs text-brand-400 hover:underline">
                  View All
                </Link>
              </div>

              {conversations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center">
                  <p className="text-xs text-slate-400">No recent conversations yet.</p>
                  <button
                    onClick={handleStartChat}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-400 hover:underline"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Start your first chat</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.slice(0, 5).map((conv) => (
                    <Link
                      key={conv._id}
                      href={`/chat/${conv._id}`}
                      className="flex items-center justify-between rounded-xl bg-slate-900/60 p-3 text-xs transition hover:bg-slate-800 border border-slate-800/80"
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5 text-brand-400 shrink-0" />
                        <span className="truncate font-medium text-slate-200">{conv.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Department Knowledge Collections */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-brand-400" />
                  <span>College Knowledge Bases</span>
                </h3>
                <Link href="/knowledge-bases" className="text-xs text-brand-400 hover:underline">
                  Browse All
                </Link>
              </div>

              <div className="space-y-2.5">
                {collections.slice(0, 4).map((col) => (
                  <div
                    key={col._id}
                    className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 text-xs flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-200">{col.name}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{col.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2 py-0.5 text-[10px] font-semibold text-brand-400 border border-brand-500/20">
                        <FileText className="h-3 w-3" />
                        <span>{col.documentCount || 1} docs</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
