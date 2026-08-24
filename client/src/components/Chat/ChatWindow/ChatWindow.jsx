import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../../store/chatStore';
import { useKnowledgeBaseStore } from '../../../store/knowledgeBaseStore';
import { sendStreamChat } from '../../../services/chatStream';
import MessageBubble from '../MessageBubble/MessageBubble';
import SuggestedQuestions from '../SuggestedQuestions/SuggestedQuestions';
import VoiceControls from '../VoiceControls/VoiceControls';
import { Send, Sparkles, Filter, Loader2, Download, Trash2, Bot } from 'lucide-react';
import api from '../../../services/api';

export default function ChatWindow() {
  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef(null);

  const {
    currentConversationId,
    messages,
    isGenerating,
    streamBuffer,
    selectedKBIds,
    departmentFilter,
    setDepartmentFilter,
    setSelectedKBIds,
    appendUserMessage,
    appendStreamToken,
    finalizeAssistantMessage,
    setGeneratingFailed,
    submitFeedback,
    deleteConversation,
  } = useChatStore();

  const { collections, fetchCollections } = useKnowledgeBaseStore();

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamBuffer]);

  const handleSendMessage = async (queryText) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isGenerating) return;

    setInputQuery('');
    appendUserMessage(textToSend);

    await sendStreamChat({
      conversationId: currentConversationId,
      message: textToSend,
      knowledgeBaseIds: selectedKBIds,
      department: departmentFilter,
      onToken: (token) => {
        appendStreamToken(token);
      },
      onComplete: (payload) => {
        finalizeAssistantMessage(payload);
      },
      onError: (err) => {
        console.error('Chat Stream Error:', err);
        setGeneratingFailed(err.message || 'Failed to generate answer.');
      },
    });
  };

  const handleVoiceInput = (transcript, isFinal) => {
    setInputQuery(transcript);
    if (isFinal) {
      handleSendMessage(transcript);
    }
  };

  const handleExport = async (format) => {
    if (!currentConversationId) return;
    try {
      const res = await api.get(`/conversations/${currentConversationId}/export?format=${format}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `campusiq-chat-${currentConversationId}.${format === 'json' ? 'json' : 'md'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === 'assistant');
  const suggestedQuestions = lastAssistantMessage?.suggestedFollowUps || [
    'What are the eligibility criteria for admissions?',
    'What is the minimum attendance required for exams?',
    'What are the campus hostel gate curfew timings?',
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Scope Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-slate-300 border border-slate-800">
            <Filter className="h-3.5 w-3.5 text-brand-400" />
            <span className="text-slate-400">Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-200 outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Departments</option>
              <option value="Admissions" className="bg-slate-900">Admissions</option>
              <option value="Examination Cell" className="bg-slate-900">Examination Cell</option>
              <option value="Computer Science" className="bg-slate-900">Computer Science</option>
              <option value="Hostel & Student Affairs" className="bg-slate-900">Hostel & Student Affairs</option>
              <option value="Placements" className="bg-slate-900">Placements</option>
            </select>
          </div>
        </div>

        {/* Conversation Actions */}
        {currentConversationId && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('markdown')}
              className="flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-800 border border-slate-800 transition"
              title="Export as Markdown"
            >
              <Download className="h-3.5 w-3.5 text-brand-400" />
              <span>Export</span>
            </button>
            <button
              onClick={() => deleteConversation(currentConversationId)}
              className="rounded-lg bg-slate-900 p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-slate-800 transition"
              title="Delete conversation"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 shadow-xl shadow-brand-500/20 mb-4">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold font-display text-white">Ask CampusIQ Anything</h2>
            <p className="mt-2 max-w-md text-xs text-slate-400 leading-relaxed">
              CampusIQ is grounded on official college circulars, policies, fees, calendars, and department regulations.
            </p>

            <div className="mt-8 w-full max-w-lg">
              <SuggestedQuestions
                questions={suggestedQuestions}
                onSelectQuestion={(q) => handleSendMessage(q)}
              />
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg._id}
                message={msg}
                onFeedback={submitFeedback}
                onSelectQuestion={(q) => handleSendMessage(q)}
              />
            ))}

            {/* Live Streaming Delta Bubble */}
            {isGenerating && (
              <div className="flex gap-3.5 mb-6 group animate-fade-in">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-brand-600 text-white shadow-md">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex max-w-[85%] md:max-w-[75%] flex-col items-start">
                  <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <span>CampusIQ Assistant</span>
                    <span className="flex items-center gap-1 text-[11px] text-brand-400">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Retrieving & generating...</span>
                    </span>
                  </div>
                  <div className="glass-panel rounded-2xl rounded-tl-none p-4 text-sm text-slate-100 shadow-lg">
                    {streamBuffer ? (
                      <div className="markdown-content">
                        <p className="whitespace-pre-wrap">{streamBuffer}</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 py-1">
                        <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce"></span>
                        <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce delay-100"></span>
                        <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce delay-200"></span>
                        <span className="text-xs text-slate-400 ml-1">Searching knowledge bases...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!isGenerating && messages.length > 0 && (
              <SuggestedQuestions
                questions={suggestedQuestions}
                onSelectQuestion={(q) => handleSendMessage(q)}
              />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="mt-4 pt-2 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/90 p-2 shadow-xl focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500"
        >
          <VoiceControls onSpeechInput={handleVoiceInput} />

          <textarea
            rows="1"
            placeholder="Ask a question about admissions, exams, hostel, curriculum..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 bg-transparent px-2 py-1.5 text-sm text-slate-100 placeholder-slate-500 outline-none resize-none"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isGenerating}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/30 transition hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
