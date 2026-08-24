import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, ExternalLink, Award } from 'lucide-react';

export default function SourceCard({ source }) {
  const [expanded, setExpanded] = useState(false);

  const relevancePct = Math.round((source.relevanceScore || 0) * 100);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 text-xs transition hover:border-brand-500/40">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h4 className="truncate font-semibold text-slate-200">{source.documentTitle || 'College Document'}</h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>{source.department || 'General'}</span>
              <span>•</span>
              <span>Page {source.pageNumber || 1}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              relevancePct >= 70
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : relevancePct >= 50
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {relevancePct}% match
          </span>

          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 border-t border-slate-800 pt-2 text-slate-300">
          <p className="text-[11px] leading-relaxed italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            "{source.snippet || source.highlightPassage}"
          </p>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>Collection: {source.collectionName || 'General'}</span>
            <span>Version {source.versionNumber || 1}</span>
          </div>
        </div>
      )}
    </div>
  );
}
