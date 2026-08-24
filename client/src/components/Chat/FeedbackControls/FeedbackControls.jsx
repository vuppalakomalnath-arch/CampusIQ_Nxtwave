import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check, MessageSquare } from 'lucide-react';

export default function FeedbackControls({ messageId, onFeedback, submittedFeedback }) {
  const [activeRating, setActiveRating] = useState(submittedFeedback || null);
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(Boolean(submittedFeedback));

  const handleVote = async (rating) => {
    setActiveRating(rating);
    if (rating === 'not_helpful') {
      setShowReasonInput(true);
    } else {
      if (onFeedback) onFeedback(messageId, rating, '');
      setSubmitted(true);
    }
  };

  const handleReasonSubmit = (e) => {
    e.preventDefault();
    if (onFeedback) onFeedback(messageId, activeRating, reason);
    setShowReasonInput(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium pt-1">
        <Check className="h-3.5 w-3.5" />
        <span>Thank you for your feedback!</span>
      </div>
    );
  }

  return (
    <div className="pt-2">
      <div className="flex items-center gap-2 text-slate-400">
        <span className="text-[11px]">Was this answer accurate?</span>
        <button
          onClick={() => handleVote('helpful')}
          className={`flex items-center gap-1 rounded-lg p-1.5 text-xs transition ${
            activeRating === 'helpful'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'hover:bg-slate-800 hover:text-slate-200'
          }`}
          title="Helpful & Grounded"
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => handleVote('not_helpful')}
          className={`flex items-center gap-1 rounded-lg p-1.5 text-xs transition ${
            activeRating === 'not_helpful'
              ? 'bg-rose-500/20 text-rose-400'
              : 'hover:bg-slate-800 hover:text-slate-200'
          }`}
          title="Not Grounded / Inaccurate"
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {showReasonInput && (
        <form onSubmit={handleReasonSubmit} className="mt-2 flex gap-2">
          <input
            type="text"
            placeholder="Tell us what was missing or incorrect..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-medium text-white hover:bg-brand-500"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
}
