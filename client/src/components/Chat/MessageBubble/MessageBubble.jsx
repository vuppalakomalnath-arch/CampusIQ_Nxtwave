import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Sparkles, AlertCircle, ShieldCheck, HelpCircle } from 'lucide-react';
import SourceCard from '../SourceCard/SourceCard';
import FeedbackControls from '../FeedbackControls/FeedbackControls';
import VoiceControls from '../VoiceControls/VoiceControls';

export default function MessageBubble({ message, onFeedback, onSelectQuestion }) {
  const isUser = message.role === 'user';
  const isUnavailable = message.answerStatus === 'UNAVAILABLE';
  const confidence = message.retrievalMetadata?.confidenceCategory || 'Unavailable';
  const relevancePct = Math.round((message.retrievalMetadata?.topRelevanceScore || 0) * 100);

  return (
    <div className={`flex gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-6 group animate-fade-in`}>
      {/* Avatar */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold shadow-md ${
          isUser
            ? 'bg-gradient-to-tr from-brand-600 to-indigo-500 text-white'
            : isUnavailable
            ? 'bg-slate-800 text-amber-400 border border-slate-700'
            : 'bg-gradient-to-tr from-cyan-500 to-brand-600 text-white'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Body */}
      <div className={`flex max-w-[85%] md:max-w-[75%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Header with confidence & status */}
        {!isUser && (
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">CampusIQ Assistant</span>
            
            {/* Confidence Badge */}
            {confidence !== 'Unavailable' ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  confidence === 'High'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : confidence === 'Medium'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
                title={`Retrieval Relevance Score: ${relevancePct}%`}
              >
                <ShieldCheck className="h-3 w-3" />
                <span>{confidence} Confidence ({relevancePct}%)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-amber-400/80 border border-slate-700">
                <AlertCircle className="h-3 w-3" />
                <span>No Grounded Match</span>
              </span>
            )}
          </div>
        )}

        {/* Content Box */}
        <div
          className={`rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${
            isUser
              ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-tr-none'
              : isUnavailable
              ? 'bg-slate-900/90 text-slate-200 border border-amber-500/20 rounded-tl-none'
              : 'glass-panel text-slate-100 rounded-tl-none'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )}

          {/* Sources Section */}
          {!isUser && message.sourceReferences && message.sourceReferences.length > 0 && (
            <div className="mt-4 border-t border-slate-800/80 pt-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-400">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Verified Source Documents ({message.sourceReferences.length})</span>
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {message.sourceReferences.map((source, idx) => (
                  <SourceCard key={idx} source={source} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Assistant Bottom Controls (Feedback, Voice, Timestamps) */}
        {!isUser && (
          <div className="mt-1 flex w-full items-center justify-between px-1">
            <FeedbackControls
              messageId={message._id}
              onFeedback={onFeedback}
              submittedFeedback={message.feedbackSubmitted}
            />
            <div className="flex items-center gap-2">
              <VoiceControls textToSpeak={message.content} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
