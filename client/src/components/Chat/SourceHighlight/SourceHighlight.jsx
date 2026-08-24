import React from 'react';
import { Sparkles } from 'lucide-react';

export default function SourceHighlight({ passage, title }) {
  if (!passage) return null;

  return (
    <div className="my-2 rounded-lg border-l-2 border-brand-400 bg-brand-950/30 p-2.5 text-xs text-brand-200">
      <div className="flex items-center gap-1.5 font-semibold text-[11px] text-brand-300 mb-1">
        <Sparkles className="h-3 w-3" />
        <span>Grounded Reference ({title || 'Document'}):</span>
      </div>
      <p className="italic">"{passage}"</p>
    </div>
  );
}
