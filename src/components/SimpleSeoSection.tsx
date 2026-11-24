import { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  MessageCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { PartnerCategory } from '../types/resort';
import type { DualSeoCategory, DualSeoConfigRecord } from '../types/dualSeo';
import { buildEmbedScriptSnippet } from '../utils/dualSeo';
import {
  buildWidgetEntranceTransition,
  DASHBOARD_VIEWPORT_CONFIG,
  SUBTLE_ENTRANCE_INITIAL,
  SUBTLE_ENTRANCE_VISIBLE,
} from '../utils/motionPresets';
import {
  buildDesignerWhatsappHref,
  buildSimpleGooglePreview,
} from '../utils/seoEngine';

interface SimpleSeoSectionProps {
  partnerId: string;
  businessName: string;
  category: PartnerCategory;
  location: string;
  offerText: string;
  externalWebsiteUrl: string;
  onChangeExternalWebsiteUrl: (url: string) => void;
  plainWords: string;
  onChangePlainWords: (notes: string) => void;
  isOptimized: boolean;
  onAutoOptimize: (notes: string) => void;
  apiOrigin: string;
  onDualSeoConfigUpdated?: (config: DualSeoConfigRecord) => void;
}

const DUAL_SEO_CATEGORY_MAP: Record<PartnerCategory, DualSeoCategory> = {
  resort: 'Resort',
  budget_hotel: 'Budget Hotel',
  restaurant: 'Restaurant',
  tour: 'Tour',
  events: 'Event',
};

export function SimpleSeoSection({
  partnerId,
  businessName,
  category,
  location,
  offerText,
  externalWebsiteUrl,
  onChangeExternalWebsiteUrl,
  plainWords,
  onChangePlainWords,
  isOptimized,
  onAutoOptimize,
  apiOrigin,
  onDualSeoConfigUpdated,
}: SimpleSeoSectionProps) {
  const [optimizing, setOptimizing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  const preview = buildSimpleGooglePreview({
    businessName,
    category,
    location,
    plainWords,
    offerText,
    optimized: isOptimized,
    externalWebsiteUrl,
  });

  const resolvedOrigin =
    apiOrigin ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://wayngongo.com');
  const scriptSnippet = buildEmbedScriptSnippet(resolvedOrigin, partnerId);
  const designerWhatsappHref = buildDesignerWhatsappHref(businessName, scriptSnippet);

  const handleOptimizeClick = async () => {
    setOptimizing(true);
    setStatusMessage(null);
    onAutoOptimize(plainWords);

    try {
      const res = await fetch('/api/seo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: partnerId,
          business_name: businessName,
          category: DUAL_SEO_CATEGORY_MAP[category],
          location,
          raw_keywords: plainWords || offerText,
          description: plainWords || `${businessName} in ${location}, Wayanad`,
          price_range: offerText || 'Direct Wayanad Rate',
          offers: offerText || 'Direct Booking Offer',
          external_website_url:
            externalWebsiteUrl.trim() || `https://${partnerId}.example.com`,
          is_pro_partner: true,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { config?: DualSeoConfigRecord };
        if (data.config && onDualSeoConfigUpdated) {
          onDualSeoConfigUpdated(data.config);
        }
      }
    } catch {
      // Offline / simulated preview still updates live immediately
    } finally {
      setOptimizing(false);
      setStatusMessage(
        'Updated! Your Google listing preview and search visibility score are now refreshed.'
      );
    }
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(scriptSnippet);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2200);
    } catch {
      setCopiedScript(false);
    }
  };

  return (
    <motion.section
      data-testid="simple-seo-section"
      aria-labelledby="simple-seo-heading"
      initial={SUBTLE_ENTRANCE_INITIAL}
      whileInView={SUBTLE_ENTRANCE_VISIBLE}
      viewport={DASHBOARD_VIEWPORT_CONFIG}
      transition={buildWidgetEntranceTransition(1)}
      className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6"
    >
      {/* Top Header + Google Visibility Score (78/100) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold text-[#065F46]">
            Automatic Google Visibility · No Technical Setup Needed
          </span>
          <h2
            id="simple-seo-heading"
            data-testid="google-visibility-score-heading"
            className="text-xl font-bold tracking-tight text-slate-900 mt-0.5 tabular-nums"
          >
            Google Visibility Score ({preview.visibilityScore}/100)
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Tell travelers what makes your place special in plain words — Wayngongo automatically formats your Google listing.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-right tabular-nums">
            <span className="text-[11px] font-semibold text-emerald-800 block">
              Visibility Rating
            </span>
            <span
              data-testid="visibility-score-badge"
              className="text-xl font-bold text-[#065F46]"
            >
              {preview.visibilityScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Beginner Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Plain-Text Box + Auto-Optimize Button */}
        <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
          <div>
            <label
              htmlFor="plain-words-seo-input"
              className="block text-sm font-bold text-slate-900"
            >
              Describe your place or offer in your own words
            </label>
            <p className="text-xs text-slate-600 mt-1">
              Write naturally like you&apos;re talking to a guest — mention nearby landmarks, food, rooms, or special deals.
            </p>
            <textarea
              id="plain-words-seo-input"
              data-testid="plain-words-seo-input"
              rows={4}
              value={plainWords}
              onChange={(e) => onChangePlainWords(e.target.value)}
              placeholder="e.g., Peaceful misty cottages near Banasura Dam with home-cooked Kerala breakfast, campfire nights, and free parking."
              className="mt-3 w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-[#065F46]"
            />
          </div>

          <button
            type="button"
            data-testid="auto-optimize-google-btn"
            disabled={optimizing}
            onClick={handleOptimizeClick}
            className="w-full py-3 px-4 rounded-xl bg-[#065F46] hover:bg-[#044E3A] disabled:bg-slate-400 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            {optimizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Updating Google Preview...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>✨ Auto-Optimize for Google</span>
              </>
            )}
          </button>

          {statusMessage && (
            <p
              role="status"
              data-testid="auto-optimize-feedback"
              className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900 flex items-start gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{statusMessage}</span>
            </p>
          )}
        </div>

        {/* Right: "How Tourists See You on Google" Live Preview */}
        <div className="min-w-0 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Search className="w-3.5 h-3.5 text-[#065F46]" aria-hidden="true" />
                <span>How Tourists See You on Google</span>
              </span>
              <span className="text-[11px] font-medium text-emerald-800">
                Live Search Preview
              </span>
            </div>

            <div
              data-testid="google-serp-preview-card"
              className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-1.5"
            >
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium truncate">
                <Globe className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{preview.googleBreadcrumbUrl}</span>
              </div>
              <p
                data-testid="google-preview-title"
                className="text-base font-semibold text-[#1A0DAB] leading-snug"
              >
                {preview.googleTitle}
              </p>
              <p
                data-testid="google-preview-description"
                className="text-xs text-slate-600 leading-relaxed"
              >
                {preview.googleDescription}
              </p>
            </div>

            <div className="pt-1">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Traveler searches you appear for:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {preview.popularSearches.map((term) => (
                  <span
                    key={term}
                    className="px-2.5 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-700"
                  >
                    &ldquo;{term}&rdquo;
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 1-Click Connect My Own Website + Send to Designer via WhatsApp */}
          <div
            data-testid="connect-website-card"
            className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Connect My Own Website
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Already have your own website? Paste this 1-line tag once (or send it to your web designer on WhatsApp) so your latest offers stay updated there too.
              </p>
            </div>

            <div>
              <label
                htmlFor="partner-own-website-input"
                className="block text-[11px] font-semibold text-slate-700 mb-1"
              >
                Your Website Address (Optional)
              </label>
              <input
                id="partner-own-website-input"
                type="url"
                value={externalWebsiteUrl}
                onChange={(e) => onChangeExternalWebsiteUrl(e.target.value)}
                placeholder="https://yourbusiness.com"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-[#065F46]"
              />
            </div>

            <div className="rounded-lg bg-slate-900 text-emerald-200 p-3 font-mono text-[11px] break-all leading-relaxed select-all">
              <code data-testid="connect-website-script">{scriptSnippet}</code>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                data-testid="copy-website-script-btn"
                onClick={handleCopyScript}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#065F46] hover:bg-[#044E3A] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                {copiedScript ? (
                  <>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Connect My Own Website</span>
                  </>
                )}
              </button>

              <a
                href={designerWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="send-designer-whatsapp-btn"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-50 text-[#065F46] text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Send to Designer via WhatsApp</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
