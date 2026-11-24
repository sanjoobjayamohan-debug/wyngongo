import { BadgeCheck, Check, Play, Scale, Star } from 'lucide-react';
import { motion } from 'motion/react';
import type { Resort } from '../types/resort';
import { formatInr } from '../utils/adPricing';
import {
  buildCardEntranceTransition,
  PREMIUM_EASE,
  SUBTLE_ENTRANCE_INITIAL,
  SUBTLE_ENTRANCE_VISIBLE,
} from '../utils/motionPresets';
import { ResortImage } from './ResortImage';

interface ResortCardProps {
  resort: Resort;
  index?: number;
  isCompared?: boolean;
  isCompareLimitReached?: boolean;
  onToggleCompare?: (resortId: string) => void;
  onSelect: (resortId: string) => void;
}

export function ResortCard({
  resort,
  index = 0,
  isCompared = false,
  isCompareLimitReached = false,
  onToggleCompare,
  onSelect,
}: ResortCardProps) {
  return (
    <motion.article
      initial={SUBTLE_ENTRANCE_INITIAL}
      animate={SUBTLE_ENTRANCE_VISIBLE}
      transition={buildCardEntranceTransition(index)}
      whileHover={{
        y: -3,
        transition: { duration: 0.18, ease: PREMIUM_EASE },
      }}
      whileTap={{ scale: 0.985 }}
      className={`group flex flex-col bg-slate-50 rounded-xl border overflow-hidden transition-colors duration-200 hover:shadow-sm ${
        isCompared
          ? 'border-[#065F46] ring-1 ring-[#065F46]/25'
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(resort.id)}
        className="text-left flex flex-col flex-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-800"
      >
        {/* 4:3 Media Container (Shared Hero Element) */}
        <motion.div
          layoutId={`resort-hero-media-${resort.id}`}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200"
        >
          <ResortImage
            src={resort.primaryImage}
            alt={`${resort.name} in ${resort.location}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />

          {resort.hasVideoTour && (
            <div className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/75 text-white text-[11px] font-medium backdrop-blur-xs">
              <Play className="w-3 h-3 fill-white" aria-hidden="true" />
              <span>Video Tour</span>
            </div>
          )}
        </motion.div>

        {/* Clean Card Body */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
          <div>
            {/* Verified & Rating Header Row (unboxed metadata) */}
            <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
              {resort.verified ? (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
                  <span>Verified</span>
                </span>
              ) : (
                <span className="text-slate-500 font-medium">Listed Stay</span>
              )}

              <span className="inline-flex items-center gap-1 font-medium text-slate-700 tabular-nums">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
                <span>{resort.rating.toFixed(1)}</span>
                <span className="text-slate-400">({resort.reviewCount})</span>
              </span>
            </div>

            <h3 className="text-[15px] font-semibold text-slate-900 leading-snug line-clamp-1">
              {resort.name}
            </h3>

            <p className="text-xs text-slate-600 mt-1 line-clamp-1">
              {resort.location} · {resort.landmarkDistance}
            </p>
          </div>

          <div className="pt-2.5 border-t border-slate-200/70 space-y-2">
            {/* Single Active Offer Pill */}
            <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-semibold max-w-full">
              <span className="truncate">{resort.offerPill}</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="tabular-nums">
                <span className="text-base font-bold text-slate-900">
                  {formatInr(resort.pricePerNight)}
                </span>
                <span className="text-xs text-slate-500 ml-1">/ night</span>
              </div>
              <span className="text-xs font-semibold text-emerald-900 group-hover:underline">
                View Stay
              </span>
            </div>
          </div>
        </div>
      </button>

      {onToggleCompare && (
        <div className="px-4 py-2.5 border-t border-slate-200/70 bg-white/80">
          <button
            type="button"
            data-testid={`compare-toggle-${resort.id}`}
            aria-pressed={isCompared}
            aria-label={
              isCompared
                ? `Remove ${resort.name} from compare`
                : `Compare ${resort.name}`
            }
            onClick={() => onToggleCompare(resort.id)}
            className={`w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-[#065F46] ${
              isCompared
                ? 'bg-[#065F46] border-[#065F46] text-white hover:bg-[#044E3A]'
                : isCompareLimitReached
                  ? 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-100'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-[#065F46]/50 hover:text-[#065F46]'
            }`}
          >
            {isCompared ? (
              <>
                <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Selected for Compare</span>
              </>
            ) : (
              <>
                <Scale className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{isCompareLimitReached ? 'Compare (Max 3)' : 'Compare'}</span>
              </>
            )}
          </button>
        </div>
      )}
    </motion.article>
  );
}
