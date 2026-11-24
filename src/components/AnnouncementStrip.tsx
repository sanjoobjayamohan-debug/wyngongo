import { ArrowRight, Flame, X } from 'lucide-react';

interface AnnouncementStripProps {
  message: string;
  ctaLabel: string;
  onAction: () => void;
  onDismiss: () => void;
}

export function AnnouncementStrip({
  message,
  ctaLabel,
  onAction,
  onDismiss,
}: AnnouncementStripProps) {
  return (
    <div
      className="bg-emerald-900 text-white border-b border-emerald-800/60"
      role="region"
      aria-label="Featured resort flash offer"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 h-9 flex items-center justify-between gap-3 text-xs">
        <div className="w-6 hidden sm:block shrink-0" aria-hidden="true" />
        <div className="flex items-center justify-center gap-2 min-w-0">
          <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
          <span className="truncate font-medium text-emerald-50">{message}</span>
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-1 font-semibold text-amber-300 hover:text-amber-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 rounded"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-3 h-3" aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss flash offer banner"
          className="p-1 text-emerald-200 hover:text-white transition-colors shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-white rounded"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
