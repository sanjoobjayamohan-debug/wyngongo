import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { ResortImage } from './ResortImage';

export interface MediaSlideItem {
  type: 'image' | 'video';
  src: string;
  caption: string;
  duration?: string;
}

interface MediaLightboxModalProps {
  isOpen: boolean;
  items: MediaSlideItem[];
  initialIndex: number;
  title: string;
  onClose: () => void;
}

export function MediaLightboxModal({
  isOpen,
  items,
  initialIndex,
  title,
  onClose,
}: MediaLightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(
        Math.max(0, Math.min(initialIndex, Math.max(0, items.length - 1)))
      );
    }
  }, [isOpen, initialIndex, items.length]);

  useEffect(() => {
    if (!isOpen || items.length === 0) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, items.length, onClose]);

  if (!isOpen || items.length === 0) return null;

  const safeIndex = currentIndex % items.length;
  const activeItem = items[safeIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} media gallery`}
      data-testid="media-lightbox-modal"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Top Bar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3 bg-white">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              {title}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {activeItem.caption}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span
              data-testid="media-lightbox-counter"
              className="px-2.5 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-700 tabular-nums"
            >
              {safeIndex + 1} / {items.length}
            </span>
            <button
              type="button"
              aria-label="Close media viewer"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#065F46]"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Main Slide Viewport */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-slate-950 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${safeIndex}-${activeItem.type}`}
              initial={{ opacity: 0.3, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0.3, x: -18 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full relative"
            >
              <ResortImage
                src={activeItem.src}
                alt={activeItem.caption}
                className={`w-full h-full object-cover ${
                  activeItem.type === 'video' ? 'opacity-80' : ''
                }`}
              />
              {activeItem.type === 'video' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-slate-950/35 p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-800/95 flex items-center justify-center mb-3 shadow-lg">
                    <Play className="w-6 h-6 fill-white ml-0.5" aria-hidden="true" />
                  </div>
                  <p className="text-sm sm:text-base font-semibold">
                    {activeItem.caption} ({activeItem.duration ?? '0:40'})
                  </p>
                  <p className="text-xs text-slate-200 mt-1 max-w-md">
                    Verified property walkthrough — use arrows below to slide through photos.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Left / Right Slide Navigation Buttons */}
          {items.length > 1 && (
            <>
              <button
                type="button"
                data-testid="media-lightbox-prev"
                aria-label="Previous media slide"
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-slate-950/90 text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                data-testid="media-lightbox-next"
                aria-label="Next media slide"
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-slate-950/90 text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {/* Bottom Filmstrip Thumbnails */}
        {items.length > 1 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2.5 overflow-x-auto">
            {items.map((item, idx) => {
              const active = idx === safeIndex;
              return (
                <button
                  key={`${item.type}-${idx}`}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`View slide ${idx + 1}: ${item.caption}`}
                  className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    active
                      ? 'border-[#065F46] ring-2 ring-[#065F46]/25'
                      : 'border-slate-200 opacity-75 hover:opacity-100'
                  }`}
                >
                  <ResortImage
                    src={item.src}
                    alt={item.caption}
                    className="w-full h-full object-cover"
                  />
                  {item.type === 'video' && (
                    <span className="absolute inset-0 bg-slate-950/35 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-white" aria-hidden="true" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
