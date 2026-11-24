import { useState } from 'react';
import { ArrowUpRight, RefreshCw, ShieldCheck } from 'lucide-react';
import type { DualSeoCategory } from '../types/dualSeo';
import {
  buildContextualAnchors,
  pickRotatedAnchorText,
  sanitizeSafeHttpUrl,
} from '../utils/dualSeo';

interface ContextualPartnerBacklinkProps {
  partnerId: string;
  businessName: string;
  category: DualSeoCategory;
  location: string;
  externalWebsiteUrl: string;
  offers?: string;
  anchorTextVariants?: string[];
  activeAnchorIndex?: number;
  isProPartner?: boolean;
  allowRotatePreview?: boolean;
  onRotateAnchor?: (nextIndex: number) => void;
}

/**
 * MODULE 3: High-Authority Contextual Backlink & Anchor Optimizer
 * Renders the partner's external official website link using AI-rotated
 * keyword-rich anchor text and rel="dofollow" for Pro/Paid partners.
 */
export function ContextualPartnerBacklink({
  partnerId,
  businessName,
  category,
  location,
  externalWebsiteUrl,
  offers,
  anchorTextVariants,
  activeAnchorIndex = 0,
  isProPartner = true,
  allowRotatePreview = false,
  onRotateAnchor,
}: ContextualPartnerBacklinkProps) {
  const [localIndex, setLocalIndex] = useState(activeAnchorIndex);
  const safeHref = sanitizeSafeHttpUrl(externalWebsiteUrl);

  if (!safeHref) {
    return null;
  }

  const variants =
    anchorTextVariants && anchorTextVariants.length > 0
      ? anchorTextVariants
      : buildContextualAnchors(businessName, category, location, offers);

  const effectiveIndex = onRotateAnchor ? activeAnchorIndex : localIndex;
  const anchorText = pickRotatedAnchorText(variants, partnerId, effectiveIndex);
  const linkRel = isProPartner ? 'dofollow' : 'noopener noreferrer';

  const handleCycleAnchor = () => {
    const nextIdx = (effectiveIndex + 1) % variants.length;
    if (onRotateAnchor) {
      onRotateAnchor(nextIdx);
    } else {
      setLocalIndex(nextIdx);
    }
  };

  return (
    <div
      data-testid="contextual-partner-backlink"
      className="rounded-xl border border-emerald-200/90 bg-emerald-50/45 p-3.5 space-y-2"
    >
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-900">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
          <span>
            {isProPartner
              ? 'Pro Authority Backlink · rel="dofollow"'
              : 'Verified Official Partner Website'}
          </span>
        </span>

        {allowRotatePreview && variants.length > 1 && (
          <button
            type="button"
            onClick={handleCycleAnchor}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-emerald-900 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" aria-hidden="true" />
            <span>Rotate Anchor ({(effectiveIndex % variants.length) + 1}/{variants.length})</span>
          </button>
        )}
      </div>

      <a
        href={safeHref}
        target="_blank"
        rel={linkRel}
        data-testid="contextual-backlink-anchor"
        className="group flex items-start justify-between gap-2 text-xs font-bold text-emerald-950 hover:text-emerald-800 underline underline-offset-2 leading-snug"
      >
        <span>{anchorText}</span>
        <ArrowUpRight
          className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-800 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
          aria-hidden="true"
        />
      </a>
    </div>
  );
}
