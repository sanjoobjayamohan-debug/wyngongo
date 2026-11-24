import { ArrowRight, Scale, Trash2, X } from 'lucide-react';
import { motion } from 'motion/react';
import type { Resort } from '../types/resort';
import { MAX_COMPARE_RESORTS } from '../utils/resortCompare';
import { PREMIUM_EASE } from '../utils/motionPresets';
import { ResortImage } from './ResortImage';

interface ResortCompareBarProps {
  selectedResorts: Resort[];
  onRemoveResort: (resortId: string) => void;
  onClearAll: () => void;
  onOpenCompare: () => void;
}

export function ResortCompareBar({
  selectedResorts,
  onRemoveResort,
  onClearAll,
  onOpenCompare,
}: ResortCompareBarProps) {
  if (selectedResorts.length === 0) return null;

  const canCompare = selectedResorts.length >= 2;
  const remainingSlots = MAX_COMPARE_RESORTS - selectedResorts.length;

  return (
    <motion.aside
      aria-label="Selected resorts for comparison"
      data-testid="resort-compare-bar"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: PREMIUM_EASE }}
      className="fixed bottom-3 left-3 right-3 sm:bottom-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[calc(100%-2rem)] sm:max-w-[980px] z-40 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md shadow-xl px-3.5 py-2.5 sm:px-5 sm:py-3.5"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Compact Mobile Summary + Desktop Selected Chips */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-8 h-8 rounded-lg bg-[#D1FAE5] text-[#065F46] flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 whitespace-nowrap tabular-nums">
                Compare stays ({selectedResorts.length}/{MAX_COMPARE_RESORTS})
              </p>
              <p className="text-[11px] text-slate-500 whitespace-nowrap hidden sm:block">
                {canCompare
                  ? remainingSlots > 0
                    ? `Ready to compare · add up to ${remainingSlots} more`
                    : 'Maximum 3 stays selected'
                  : 'Select at least 1 more stay to compare'}
              </p>
            </div>
          </div>

          {/* Desktop / Tablet Selected Resort Chips */}
          <div className="hidden md:flex items-center gap-2 min-w-0 flex-1 overflow-x-auto no-scrollbar">
            {selectedResorts.map((resort) => (
              <div
                key={resort.id}
                className="inline-flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg bg-slate-50 border border-slate-200 max-w-[190px] shrink-0"
              >
                <div className="w-7 h-7 rounded overflow-hidden bg-slate-200 shrink-0">
                  <ResortImage
                    src={resort.primaryImage}
                    alt={resort.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-medium text-slate-800 truncate">
                  {resort.name}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveResort(resort.id)}
                  aria-label={`Remove ${resort.name} from compare`}
                  className="text-slate-400 hover:text-slate-900 p-0.5 rounded cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-[#065F46]"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Clear + Compare CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClearAll}
            aria-label="Clear selected resorts"
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#065F46]"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <button
            type="button"
            data-testid="open-compare-modal-btn"
            disabled={!canCompare}
            onClick={onOpenCompare}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg bg-[#065F46] hover:bg-[#044E3A] disabled:bg-slate-300 disabled:text-slate-600 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#065F46]"
          >
            <span>Compare ({selectedResorts.length})</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
