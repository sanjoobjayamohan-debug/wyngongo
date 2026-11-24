import { useEffect } from 'react';
import {
  ArrowUpRight,
  BadgeCheck,
  Check,
  Minus,
  Play,
  Scale,
  Star,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { AMENITIES_CATALOG } from '../data/amenitiesCatalog';
import type { Resort } from '../types/resort';
import { formatInr } from '../utils/adPricing';
import { PREMIUM_EASE } from '../utils/motionPresets';
import {
  buildResortComparisonMatrix,
  MAX_COMPARE_RESORTS,
} from '../utils/resortCompare';
import { ResortImage } from './ResortImage';

interface ResortCompareModalProps {
  isOpen: boolean;
  allResorts: Resort[];
  selectedIds: string[];
  onClose: () => void;
  onRemoveResort: (resortId: string) => void;
  onClearAll: () => void;
  onSelectResort: (resortId: string) => void;
}

export function ResortCompareModal({
  isOpen,
  allResorts,
  selectedIds,
  onClose,
  onRemoveResort,
  onClearAll,
  onSelectResort,
}: ResortCompareModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const matrix = buildResortComparisonMatrix(allResorts, selectedIds);
  const {
    resorts,
    bestPriceResortId,
    topRatedResortId,
    mostAmenitiesResortId,
    amenityRows,
  } = matrix;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
      data-testid="resort-compare-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: PREMIUM_EASE }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: PREMIUM_EASE }}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-[1120px] max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 flex items-start sm:items-center justify-between gap-3 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="w-9 h-9 rounded-lg bg-[#D1FAE5] text-[#065F46] flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2
                id="compare-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 truncate"
              >
                Compare Wayanad Resorts
              </h2>
              <p className="text-xs text-slate-600 line-clamp-1">
                Prices, amenities &amp; ratings ({resorts.length} of{' '}
                {MAX_COMPARE_RESORTS} selected)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {resorts.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  onClose();
                }}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close comparison dialog"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#065F46]"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Comparison Table Body */}
        <div className="flex-1 overflow-y-auto">
          {resorts.length === 0 ? (
            <div className="py-16 px-6 text-center space-y-3">
              <p className="text-base font-semibold text-slate-900">
                No resorts selected for comparison
              </p>
              <p className="text-xs text-slate-600">
                Select up to 3 stays from the directory to compare nightly rates, amenities, and guest ratings side by side.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-[#065F46] text-white text-xs font-semibold hover:bg-[#044E3A] cursor-pointer"
              >
                Back to Directory
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table
                data-testid="resort-compare-table"
                className="w-full min-w-[540px] sm:min-w-[640px] text-left border-collapse"
              >
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 align-top">
                    <th
                      scope="col"
                      className="w-32 min-w-[128px] sm:w-52 sm:min-w-[200px] p-3 sm:p-4 text-xs font-semibold text-slate-600 sticky left-0 bg-slate-50 z-10 border-r border-slate-200/80"
                    >
                      Property Overview
                    </th>
                    {resorts.map((resort) => (
                      <th
                        key={resort.id}
                        scope="col"
                        className="p-3 sm:p-4 min-w-[190px] sm:min-w-[210px] font-normal border-r last:border-r-0 border-slate-200/70"
                      >
                        <div className="space-y-3">
                          <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-200">
                            <ResortImage
                              src={resort.primaryImage}
                              alt={`${resort.name} in ${resort.location}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => onRemoveResort(resort.id)}
                              aria-label={`Remove ${resort.name} from comparison`}
                              className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/95 hover:bg-white text-slate-700 hover:text-slate-950 shadow-xs flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </div>

                          <div>
                            <div className="flex items-center justify-between gap-2 text-[11px] mb-1">
                              {resort.verified ? (
                                <span className="inline-flex items-center gap-1 font-semibold text-[#065F46]">
                                  <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Verified</span>
                                </span>
                              ) : (
                                <span className="text-slate-500 font-medium">Listed Stay</span>
                              )}
                              <span className="text-slate-500 font-medium">
                                {resort.location}
                              </span>
                            </div>

                            <h3 className="text-sm font-bold text-slate-900 leading-snug">
                              {resort.name}
                            </h3>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {resort.landmarkDistance}
                            </p>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200/80 text-xs">
                  {/* Nightly Rate Row */}
                  <tr className="bg-white">
                    <th
                      scope="row"
                      className="p-4 font-semibold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-200/80"
                    >
                      Nightly Rate
                    </th>
                    {resorts.map((resort) => {
                      const isBestPrice = bestPriceResortId === resort.id;
                      return (
                        <td
                          key={resort.id}
                          className="p-4 border-r last:border-r-0 border-slate-200/70 tabular-nums"
                        >
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-base font-bold text-slate-900">
                              {formatInr(resort.pricePerNight)}
                            </span>
                            <span className="text-slate-500">/ night</span>
                          </div>
                          {isBestPrice && (
                            <span className="mt-1 inline-block text-[11px] font-bold text-[#065F46]">
                              Lowest Nightly Rate
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Guest Rating & Reviews Row */}
                  <tr className="bg-slate-50/40">
                    <th
                      scope="row"
                      className="p-4 font-semibold text-slate-700 sticky left-0 bg-slate-50/95 z-10 border-r border-slate-200/80"
                    >
                      Guest Rating
                    </th>
                    {resorts.map((resort) => {
                      const isTopRated = topRatedResortId === resort.id;
                      return (
                        <td
                          key={resort.id}
                          className="p-4 border-r last:border-r-0 border-slate-200/70 tabular-nums"
                        >
                          <div className="inline-flex items-center gap-1.5 font-bold text-slate-900 text-sm">
                            <Star
                              className="w-4 h-4 fill-amber-500 text-amber-500"
                              aria-hidden="true"
                            />
                            <span>{resort.rating.toFixed(1)}</span>
                            <span className="text-xs font-normal text-slate-500">
                              ({resort.reviewCount} reviews)
                            </span>
                          </div>
                          {isTopRated && (
                            <span className="mt-1 block text-[11px] font-bold text-amber-700">
                              Highest Rated
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Active Direct Offer Row */}
                  <tr className="bg-white">
                    <th
                      scope="row"
                      className="p-4 font-semibold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-200/80"
                    >
                      Direct Booking Offer
                    </th>
                    {resorts.map((resort) => (
                      <td
                        key={resort.id}
                        className="p-4 border-r last:border-r-0 border-slate-200/70"
                      >
                        <span className="inline-block px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200/80 text-amber-900 font-semibold text-[11px]">
                          {resort.offerPill}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Media / Video Tour Row */}
                  <tr className="bg-slate-50/40">
                    <th
                      scope="row"
                      className="p-4 font-semibold text-slate-700 sticky left-0 bg-slate-50/95 z-10 border-r border-slate-200/80"
                    >
                      Video Walkthrough
                    </th>
                    {resorts.map((resort) => (
                      <td
                        key={resort.id}
                        className="p-4 border-r last:border-r-0 border-slate-200/70"
                      >
                        {resort.hasVideoTour ? (
                          <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                            <Play className="w-3.5 h-3.5 text-[#065F46]" aria-hidden="true" />
                            <span>
                              {resort.videoDuration
                                ? `Available (${resort.videoDuration})`
                                : 'Available'}
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-500">Photo gallery</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Amenities Summary Count Row */}
                  <tr className="bg-white">
                    <th
                      scope="row"
                      className="p-4 font-semibold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-200/80"
                    >
                      Amenities Count
                    </th>
                    {resorts.map((resort) => {
                      const isMost = mostAmenitiesResortId === resort.id;
                      return (
                        <td
                          key={resort.id}
                          className="p-4 border-r last:border-r-0 border-slate-200/70 tabular-nums"
                        >
                          <span className="font-bold text-slate-900">
                            {resort.amenities.length} included
                          </span>
                          {isMost && (
                            <span className="ml-2 text-[11px] font-bold text-[#065F46]">
                              Most Features
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Individual Amenity Comparison Rows */}
                  {amenityRows.map((amenityKey, idx) => {
                    const def = AMENITIES_CATALOG[amenityKey];
                    if (!def) return null;
                    const Icon = def.Icon;
                    const rowBg = idx % 2 === 0 ? 'bg-slate-50/40' : 'bg-white';
                    const stickyBg = idx % 2 === 0 ? 'bg-slate-50/95' : 'bg-white';

                    return (
                      <tr key={amenityKey} className={rowBg}>
                        <th
                          scope="row"
                          className={`p-3.5 px-4 font-medium text-slate-700 sticky left-0 ${stickyBg} z-10 border-r border-slate-200/80`}
                        >
                          <span className="inline-flex items-center gap-2">
                            <Icon
                              className="w-3.5 h-3.5 text-[#065F46] shrink-0"
                              aria-hidden="true"
                            />
                            <span>{def.label}</span>
                          </span>
                        </th>
                        {resorts.map((resort) => {
                          const hasAmenity = resort.amenities.includes(amenityKey);
                          return (
                            <td
                              key={resort.id}
                              className="p-3.5 px-4 border-r last:border-r-0 border-slate-200/70"
                            >
                              {hasAmenity ? (
                                <span className="inline-flex items-center gap-1.5 font-semibold text-[#065F46]">
                                  <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
                                  <span>Included</span>
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 text-slate-400"
                                  aria-label="Not listed"
                                >
                                  <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Not listed</span>
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Bottom CTA Row */}
                  <tr className="bg-slate-50 border-t border-slate-200">
                    <th
                      scope="row"
                      className="p-4 font-semibold text-slate-700 sticky left-0 bg-slate-50 z-10 border-r border-slate-200/80"
                    >
                      Book Direct
                    </th>
                    {resorts.map((resort) => (
                      <td
                        key={resort.id}
                        className="p-4 border-r last:border-r-0 border-slate-200/70"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectResort(resort.id);
                          }}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#044E3A] text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <span>View Full Stay</span>
                          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
