import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import AppShell from '../../components/AppShell/AppShell';
import ChatWindow from '../../components/Chat/ChatWindow/ChatWindow';
import { useChatStore } from '../../store/chatStore';
import { MessageSquare, Plus, Trash2, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const router = useRouter();
  const { conversations, loadConversations, startNewChat, currentConversationId, deleteConversation } = useChatStore();

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (router.query.q) {
      startNewChat();
    }
  }, [router.query.q, startNewChat]);

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="flex h-[calc(100vh-8rem)] gap-6">
          {/* Conversation History Left Sidebar */}
          <aside className="hidden lg:flex w-72 flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl">
            <button
              onClick={() => {
                startNewChat();
                router.push('/chat');
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600/20 border border-brand-500/30 py-2 px-3 text-xs font-semibold text-brand-300 hover:bg-brand-600/30 transition mb-4"
            >
              <Plus className="h-4 w-4" />
              <span>New Conversation</span>
            </button>

            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Past Chats</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {conversations.length === 0 ? (
                <p className="text-[11px] text-slate-500 text-center py-6">No chat history yet</p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv._id}
                    className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                      currentConversationId === conv._id
                        ? 'bg-brand-500/20 text-brand-200 border border-brand-500/30 font-medium'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Link href={`/chat/${conv._id}`} className="truncate flex-1 flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-brand-400" />
                      <span className="truncate">{conv.title}</span>
                    </Link>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition"
                      title="Delete chat"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* Primary Chat Window */}
          <main className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-6 backdrop-blur-xl flex flex-col min-w-0">
            <ChatWindow />
          </main>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
