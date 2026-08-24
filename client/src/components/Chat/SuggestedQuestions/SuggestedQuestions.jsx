import React from 'react';
import { HelpCircle, ArrowRight } from 'lucide-react';

export default function SuggestedQuestions({ questions = [], onSelectQuestion }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <HelpCircle className="h-3.5 w-3.5 text-brand-400" />
        <span>Suggested Questions</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(q)}
            className="group flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs text-slate-300 transition hover:border-brand-500/50 hover:bg-slate-800 hover:text-white"
          >
            <span>{q}</span>
            <ArrowRight className="h-3 w-3 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-brand-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
