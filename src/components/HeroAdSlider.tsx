import { useEffect, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { HeroAdSlide } from '../types/resort';
import { ResortImage } from './ResortImage';

interface HeroAdSliderProps {
  slides: HeroAdSlide[];
  onInspectResort: (resortId: string) => void;
}

export function HeroAdSlider({ slides, onInspectResort }: HeroAdSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const safeIndex = slides.length > 0 ? activeIndex % slides.length : 0;
  const current = slides[safeIndex];

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!current) return null;

  const cleanLocationTag = current.offerTag.replace(/^Sponsored\s*·\s*/i, '').trim() || current.location;

  return (
    <section
      aria-label="Featured resort stays"
      className="max-w-[1360px] mx-auto px-4 sm:px-6 pt-5 pb-2"
    >
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/7] md:aspect-[16/5] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80">
        <ResortImage
          src={current.imageUrl}
          alt={`${current.resortName} in ${current.location}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {/* Measured Contrast Scrim */}
        <div
          className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-slate-950/15"
          aria-hidden="true"
        />

        {/* Content Overlay */}
        <div className="absolute inset-0 p-5 sm:p-8 lg:p-10 flex flex-col justify-end md:justify-center max-w-2xl">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-amber-300 mb-1.5 sm:mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" aria-hidden="true" />
            <span>{cleanLocationTag}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-200 truncate">{current.resortName}</span>
          </div>

          <h1 className="text-lg sm:text-3xl lg:text-[34px] font-bold text-white tracking-tight leading-snug sm:leading-tight">
            {current.headline}
          </h1>

          <p className="hidden sm:block text-sm text-slate-200 mt-2.5 max-w-xl leading-relaxed">
            {current.subheadline}
          </p>

          <div className="mt-3.5 sm:mt-5 flex items-center gap-3 pr-20 sm:pr-0">
            <button
              type="button"
              onClick={() => onInspectResort(current.resortId)}
              className="inline-flex items-center gap-2 px-4 py-2 sm:py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span>{current.ctaLabel}</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Slide Controls */}
        {slides.length > 1 && (
          <>
            <div className="absolute bottom-4 right-5 flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous featured banner"
                onClick={() =>
                  setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length)
                }
                className="w-8 h-8 rounded-full bg-slate-950/60 hover:bg-slate-950/85 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Next featured banner"
                onClick={() => setActiveIndex((prev) => (prev + 1) % slides.length)}
                className="w-8 h-8 rounded-full bg-slate-950/60 hover:bg-slate-950/85 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1.5">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Show slide ${idx + 1}: ${slide.resortName}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === safeIndex ? 'w-6 bg-white' : 'w-2 bg-white/45 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
