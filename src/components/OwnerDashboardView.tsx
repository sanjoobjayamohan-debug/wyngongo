import { useState, type ChangeEvent } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  LogOut,
  MapPin,
  Megaphone,
  MousePointerClick,
  Plus,
  Search,
  TrendingUp,
  Upload,
  X,
} from 'lucide-react';
import type {
  AdSlotConfig,
  AdSlotId,
  AmenityKey,
  PartnerAccount,
  Resort,
  SeoAgentOutput,
  ServiceDetailSelection,
} from '../types/resort';
import type { DualSeoConfigRecord } from '../types/dualSeo';
import {
  AD_SLOT_CATALOG,
  calculateAdTariff,
  formatInr,
  validateAdConfigs,
} from '../utils/adPricing';
import { PARTNER_CATEGORY_OPTIONS } from '../utils/authValidation';
import {
  buildCardEntranceTransition,
  buildWidgetEntranceTransition,
  DASHBOARD_VIEWPORT_CONFIG,
  PREMIUM_EASE,
  SUBTLE_ENTRANCE_INITIAL,
  SUBTLE_ENTRANCE_VISIBLE,
} from '../utils/motionPresets';
import {
  AMENITIES_CATALOG,
  AMENITY_KEYS,
  AMENITY_MAX_OPTIONS,
} from '../data/amenitiesCatalog';
import type { SeoChecklistManualOverrides } from '../utils/seoChecklist';
import type { createServiceItemRecord } from '../utils/localDirectory';
import { buildSimpleGooglePreview } from '../utils/seoEngine';
import { GENERATED_BANNER_PRESETS } from '../data/mockWayanadData';
import { CategoryServiceForm } from './CategoryServiceForm';
import { SimpleSeoSection } from './SimpleSeoSection';
import { ResortImage } from './ResortImage';
import { RedirectsGrowthChart } from './RedirectsGrowthChart';
import { SeoHeatmapWidget } from './SeoHeatmapWidget';
import { SeoTaskChecklist } from './SeoTaskChecklist';

interface OwnerDashboardViewProps {
  partnerAccount: PartnerAccount;
  onLogout: () => void;
  resorts: Resort[];
  ownerResortId: string;
  onSelectOwnerResort: (resortId: string) => void;
  seoOutput: SeoAgentOutput;
  hasOptimizedMeta: boolean;
  checklistOverrides: SeoChecklistManualOverrides;
  onToggleSchemaChecklist: () => void;
  ownerSeoNotes: string;
  onChangeSeoNotes: (notes: string) => void;
  onRunSeoOptimize: (notesOverride?: string) => void;
  adConfigs: Record<AdSlotId, AdSlotConfig>;
  onUpdateAdConfig: (slotId: AdSlotId, patch: Partial<AdSlotConfig>) => void;
  activeCampaignCount: number;
  onPublishAds: () => { ok: boolean; message: string };
  onSaveListingDetails: (
    resortId: string,
    updates: Partial<
      Pick<
        Resort,
        | 'name'
        | 'pricePerNight'
        | 'offerPill'
        | 'whatsappNumber'
        | 'upiId'
        | 'directBookingUrl'
        | 'primaryImage'
        | 'imageAltText'
        | 'videoLabel'
        | 'amenities'
        | 'maxAmenitiesVisible'
        | 'mapUrl'
        | 'mapCoordinates'
      >
    >
  ) => void;
  onPreviewLiveListing: (resortId: string) => void;
  onPublishPartnerRecord: (
    result: ReturnType<typeof createServiceItemRecord>
  ) => { detailKind: 'resort' | 'service'; id: string };
  onOpenPublishedDetail: (
    target: { kind: 'resort'; id: string } | ServiceDetailSelection
  ) => void;
  apiOrigin: string;
  onDualSeoConfigUpdated: (config: DualSeoConfigRecord) => void;
}

export function OwnerDashboardView({
  partnerAccount,
  onLogout,
  resorts,
  ownerResortId,
  onSelectOwnerResort,
  seoOutput,
  hasOptimizedMeta,
  checklistOverrides,
  onToggleSchemaChecklist,
  ownerSeoNotes,
  onChangeSeoNotes,
  onRunSeoOptimize,
  adConfigs,
  onUpdateAdConfig,
  activeCampaignCount,
  onPublishAds,
  onSaveListingDetails,
  onPreviewLiveListing,
  onPublishPartnerRecord,
  onOpenPublishedDetail,
  apiOrigin,
  onDualSeoConfigUpdated,
}: OwnerDashboardViewProps) {
  const activeResort =
    resorts.find((r) => r.id === ownerResortId) ?? resorts[0];

  const [proModalOpen, setProModalOpen] = useState(false);
  const [proActivated, setProActivated] = useState(false);
  const [externalWebsiteUrl, setExternalWebsiteUrl] = useState(
    activeResort.directBookingUrl
  );
  const [adPublishFeedback, setAdPublishFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
    slotErrors?: Partial<Record<AdSlotId, string>>;
  } | null>(null);

  // Quick Listing & Free Offer Editor local form state keyed by activeResort
  const [draftName, setDraftName] = useState(activeResort.name);
  const [draftPrice, setDraftPrice] = useState(String(activeResort.pricePerNight));
  const [draftOffer, setDraftOffer] = useState(activeResort.offerPill);
  const [draftWhatsapp, setDraftWhatsapp] = useState(activeResort.whatsappNumber);
  const [draftUpi, setDraftUpi] = useState(activeResort.upiId);
  const [draftDirectUrl, setDraftDirectUrl] = useState(activeResort.directBookingUrl);
  const [draftPhotoUrl, setDraftPhotoUrl] = useState(activeResort.primaryImage);
  const [draftAltText, setDraftAltText] = useState(activeResort.imageAltText ?? '');
  const [draftVideoLabel, setDraftVideoLabel] = useState(
    activeResort.videoLabel ?? ''
  );
  const [draftMapUrl, setDraftMapUrl] = useState(activeResort.mapUrl ?? '');
  const [draftMapCoordinates, setDraftMapCoordinates] = useState(
    activeResort.mapCoordinates ?? ''
  );
  const [draftAmenities, setDraftAmenities] = useState<AmenityKey[]>(
    activeResort.amenities
  );
  const [draftMaxAmenities, setDraftMaxAmenities] = useState<number>(
    activeResort.maxAmenitiesVisible ?? 6
  );
  const availableToAdd = AMENITY_KEYS.filter(
    (k) => !draftAmenities.includes(k)
  );
  const [amenityToAdd, setAmenityToAdd] = useState<AmenityKey | ''>(
    availableToAdd[0] ?? ''
  );
  const [listingSavedMsg, setListingSavedMsg] = useState<string | null>(null);

  const categoryMeta =
    PARTNER_CATEGORY_OPTIONS.find((c) => c.id === partnerAccount.defaultCategory) ??
    PARTNER_CATEGORY_OPTIONS[0];

  const displayBusinessName =
    partnerAccount.businessName.trim() || activeResort.name;

  const googlePreview = buildSimpleGooglePreview({
    businessName: displayBusinessName,
    category: partnerAccount.defaultCategory,
    location: activeResort.location,
    plainWords: ownerSeoNotes,
    offerText: draftOffer || activeResort.offerPill,
    optimized: hasOptimizedMeta,
    externalWebsiteUrl,
  });

  const effectiveVisibilityScore = proActivated
    ? Math.max(98, googlePreview.visibilityScore)
    : googlePreview.visibilityScore;

  const handlePropertySwitch = (nextId: string) => {
    onSelectOwnerResort(nextId);
    const found = resorts.find((r) => r.id === nextId);
    if (found) {
      setDraftName(found.name);
      setDraftPrice(String(found.pricePerNight));
      setDraftOffer(found.offerPill);
      setDraftWhatsapp(found.whatsappNumber);
      setDraftUpi(found.upiId);
      setDraftDirectUrl(found.directBookingUrl);
      setExternalWebsiteUrl(found.directBookingUrl);
      setDraftPhotoUrl(found.primaryImage);
      setDraftAltText(found.imageAltText ?? '');
      setDraftVideoLabel(found.videoLabel ?? '');
      setDraftMapUrl(found.mapUrl ?? '');
      setDraftMapCoordinates(found.mapCoordinates ?? '');
      setDraftAmenities(found.amenities);
      setDraftMaxAmenities(found.maxAmenitiesVisible ?? 6);
      const nextRemaining = AMENITY_KEYS.filter(
        (k) => !found.amenities.includes(k)
      );
      setAmenityToAdd(nextRemaining[0] ?? '');
      setListingSavedMsg(null);
    }
  };

  const tariffSummary = calculateAdTariff(adConfigs, AD_SLOT_CATALOG);

  const handleBannerUpload = (
    slotId: AdSlotId,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateAdConfig(slotId, {
          bannerUrl: reader.result,
          bannerFileName: file.name,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePayAndPublish = () => {
    const check = validateAdConfigs(adConfigs);
    if (!check.valid) {
      setAdPublishFeedback({
        type: 'error',
        text:
          check.generalError ??
          'Please check the highlighted ad placement details before publishing.',
        slotErrors: check.errors,
      });
      return;
    }
    const result = onPublishAds();
    setAdPublishFeedback({
      type: result.ok ? 'success' : 'error',
      text: result.message,
    });
  };

  const handleSaveListing = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = Number(draftPrice);
    if (!draftName.trim() || !Number.isFinite(parsedPrice) || parsedPrice < 500) {
      setListingSavedMsg('Please enter a valid property name and rate (₹500+).');
      return;
    }
    onSaveListingDetails(activeResort.id, {
      name: draftName.trim(),
      pricePerNight: parsedPrice,
      offerPill: draftOffer.trim() || 'Direct Stay Offer Available',
      whatsappNumber: draftWhatsapp.trim() || activeResort.whatsappNumber,
      upiId: draftUpi.trim() || activeResort.upiId,
      directBookingUrl: draftDirectUrl.trim() || activeResort.directBookingUrl,
      primaryImage: draftPhotoUrl.trim() || activeResort.primaryImage,
      imageAltText: draftAltText.trim(),
      videoLabel: draftVideoLabel.trim() || undefined,
      amenities: draftAmenities,
      maxAmenitiesVisible: draftMaxAmenities,
      mapUrl: draftMapUrl.trim() || undefined,
      mapCoordinates: draftMapCoordinates.trim() || undefined,
    });
    void fetch('/api/seo/reindex', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partner_id: activeResort.id }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { config?: DualSeoConfigRecord } | null) => {
        if (data?.config) {
          onDualSeoConfigUpdated(data.config);
        }
      })
      .catch(() => {});
    setListingSavedMsg(
      'Listing, amenities & Free Offer updated live across Wayngongo.'
    );
  };

  const handleAddAmenity = () => {
    if (!amenityToAdd || draftAmenities.includes(amenityToAdd)) return;
    const nextList = [...draftAmenities, amenityToAdd];
    setDraftAmenities(nextList);
    onSaveListingDetails(activeResort.id, { amenities: nextList });
    const remaining = AMENITY_KEYS.filter((k) => !nextList.includes(k));
    setAmenityToAdd(remaining[0] ?? '');
  };

  const handleRemoveAmenity = (key: AmenityKey) => {
    if (draftAmenities.length <= 1) return;
    const nextList = draftAmenities.filter((item) => item !== key);
    setDraftAmenities(nextList);
    onSaveListingDetails(activeResort.id, { amenities: nextList });
    if (!amenityToAdd) {
      setAmenityToAdd(key);
    }
  };

  return (
    <main
      data-testid="partner-dashboard-view"
      className="max-w-[1360px] mx-auto px-4 sm:px-6 py-7 space-y-7"
    >
      {/* Protected Partner Workspace Header */}
      <motion.div
        initial={SUBTLE_ENTRANCE_INITIAL}
        animate={SUBTLE_ENTRANCE_VISIBLE}
        transition={buildWidgetEntranceTransition(0)}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#065F46]">
              Wayngongo Partner Dashboard
            </span>
            <span
              data-testid="partner-category-badge"
              className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#065F46] text-[11px] font-bold"
            >
              {categoryMeta.label}
            </span>
          </div>
          <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 mt-0.5">
            {displayBusinessName}
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Signed in as{' '}
            <span className="font-semibold text-slate-800">
              {partnerAccount.email || partnerAccount.phone}
            </span>{' '}
            · Manage your Wayanad listing, Google visibility &amp; self-serve ads.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 min-w-0 max-w-full">
          <div className="min-w-0 max-w-full">
            <label htmlFor="owner-property-select" className="sr-only">
              Select managed property
            </label>
            <select
              id="owner-property-select"
              value={activeResort.id}
              onChange={(e) => handlePropertySwitch(e.target.value)}
              className="max-w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-emerald-800 cursor-pointer"
            >
              {resorts.map((r) => (
                <option key={r.id} value={r.id}>
                  Analytics View: {r.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => onPreviewLiveListing(activeResort.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
          >
            <span>Preview Public Listing</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <button
            type="button"
            data-testid="dashboard-logout-btn"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-200 bg-red-50/70 hover:bg-red-100 text-xs font-semibold text-red-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Log Out</span>
          </button>
        </div>
      </motion.div>

      {/* 1. Top 4 KPI Cards (Growth & Redirect Analytics) */}
      <section
        aria-label="Partner growth and redirect summary"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div
          initial={SUBTLE_ENTRANCE_INITIAL}
          animate={SUBTLE_ENTRANCE_VISIBLE}
          transition={buildCardEntranceTransition(0)}
          whileHover={{ y: -2, transition: { duration: 0.16, ease: PREMIUM_EASE } }}
          className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition-colors hover:border-slate-300"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Google Search Views</span>
            <Search className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2.5 tabular-nums">
            <span className="text-2xl font-bold text-slate-900">4,820</span>
            <span className="text-xs font-semibold text-emerald-700">
              +28% vs last month
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Tourists searching Wayanad stays, dining &amp; trips
          </p>
        </motion.div>

        <motion.div
          initial={SUBTLE_ENTRANCE_INITIAL}
          animate={SUBTLE_ENTRANCE_VISIBLE}
          transition={buildCardEntranceTransition(1)}
          whileHover={{ y: -2, transition: { duration: 0.16, ease: PREMIUM_EASE } }}
          className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition-colors hover:border-slate-300"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Website &amp; Booking Redirects</span>
            <MousePointerClick className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <div className="mt-2.5 flex flex-wrap items-baseline gap-2 tabular-nums">
            <span className="text-2xl font-bold text-slate-900">342 clicks</span>
            <span
              data-testid="visitor-growth-badge"
              className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[11px] font-bold"
            >
              +42% more visitors
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Month-over-month WhatsApp, UPI &amp; direct website visits
          </p>
        </motion.div>

        <motion.div
          initial={SUBTLE_ENTRANCE_INITIAL}
          animate={SUBTLE_ENTRANCE_VISIBLE}
          transition={buildCardEntranceTransition(2)}
          whileHover={{ y: -2, transition: { duration: 0.16, ease: PREMIUM_EASE } }}
          className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition-colors hover:border-slate-300"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Google Visibility Score</span>
            <TrendingUp className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2 tabular-nums">
            <span className="text-2xl font-bold text-slate-900">
              {effectiveVisibilityScore}/100
            </span>
            <span className="text-xs font-medium text-slate-500">
              {proActivated ? 'Pro Boost Active' : 'Good Standing'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setProModalOpen(true)}
            className="mt-1.5 text-[11px] font-semibold text-amber-700 hover:text-amber-800 underline underline-offset-2 text-left cursor-pointer"
          >
            {proActivated
              ? 'Pro Visibility Boost Active (98/100)'
              : 'Upgrade to Pro Boost to reach 98/100'}
          </button>
        </motion.div>

        <motion.div
          initial={SUBTLE_ENTRANCE_INITIAL}
          animate={SUBTLE_ENTRANCE_VISIBLE}
          transition={buildCardEntranceTransition(3)}
          whileHover={{ y: -2, transition: { duration: 0.16, ease: PREMIUM_EASE } }}
          className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition-colors hover:border-slate-300"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span>Active Ad Campaigns</span>
            <Megaphone className="w-4 h-4 text-slate-400" aria-hidden="true" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-2 tabular-nums">
            <span
              data-testid="active-campaign-count"
              className="text-2xl font-bold text-slate-900"
            >
              {activeCampaignCount}
            </span>
            <span className="text-xs font-semibold text-emerald-800">
              Live placements
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Sending travelers directly to you with 0% commission
          </p>
        </motion.div>
      </section>

      {/* 2. Dynamic Category Listing Builder (Scoped to Registered Category) */}
      <CategoryServiceForm
        initialCategory={partnerAccount.defaultCategory}
        initialBusinessName={displayBusinessName}
        initialPhone={partnerAccount.phone || activeResort.whatsappNumber}
        onPublishRecord={onPublishPartnerRecord}
        onOpenPublishedDetail={onOpenPublishedDetail}
      />

      {/* 3. Zero-Jargon Beginner-Friendly AI Google Visibility Section */}
      <SimpleSeoSection
        partnerId={activeResort.id}
        businessName={displayBusinessName}
        category={partnerAccount.defaultCategory}
        location={activeResort.location}
        offerText={draftOffer || activeResort.offerPill}
        externalWebsiteUrl={externalWebsiteUrl}
        onChangeExternalWebsiteUrl={setExternalWebsiteUrl}
        plainWords={ownerSeoNotes}
        onChangePlainWords={onChangeSeoNotes}
        isOptimized={hasOptimizedMeta}
        onAutoOptimize={(notes) => onRunSeoOptimize(notes)}
        apiOrigin={apiOrigin}
        onDualSeoConfigUpdated={onDualSeoConfigUpdated}
      />

      {/* 4. Self-Serve Ad Space Booking & Tariff Selector */}
      <motion.section
        id="ad-booking-portal"
        aria-labelledby="ad-booking-heading"
        initial={SUBTLE_ENTRANCE_INITIAL}
        whileInView={SUBTLE_ENTRANCE_VISIBLE}
        viewport={DASHBOARD_VIEWPORT_CONFIG}
        transition={buildWidgetEntranceTransition(1)}
        className="rounded-2xl border border-slate-200 bg-white p-6"
      >
        <div className="pb-4 border-b border-slate-100">
          <h2 id="ad-booking-heading" className="text-lg font-bold text-slate-900">
            Self-Serve Ad Space Booking &amp; Tariff Selector
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Choose promotional spots across Wayngongo to send Wayanad travelers straight to your website, WhatsApp, or ticket counter.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6 mt-5 items-start">
          {/* Interactive Ad Placement Checklist */}
          <div className="min-w-0 space-y-3.5">
            {AD_SLOT_CATALOG.map((slot) => {
              const cfg = adConfigs[slot.id];
              const slotError = adPublishFeedback?.slotErrors?.[slot.id];

              return (
                <div
                  key={slot.id}
                  className={`rounded-xl border transition-colors ${
                    cfg.selected
                      ? 'border-emerald-800 bg-emerald-50/35'
                      : 'border-slate-200 bg-slate-50/70'
                  }`}
                >
                  <label className="flex items-start justify-between gap-4 p-4 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={cfg.selected}
                        onChange={(e) => {
                          onUpdateAdConfig(slot.id, { selected: e.target.checked });
                          setAdPublishFeedback(null);
                        }}
                        className="mt-0.5 w-4 h-4 accent-emerald-900 rounded cursor-pointer"
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-900 block">
                          {slot.name}
                        </span>
                        <span className="text-xs text-slate-600 block mt-0.5">
                          {slot.description}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-1 tabular-nums">
                          Est. {slot.estimatedWeeklyImpressions.toLocaleString('en-IN')}{' '}
                          weekly views · {slot.recommendedSize}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 tabular-nums">
                      <span className="text-sm font-bold text-slate-900">
                        {formatInr(slot.weeklyPriceInr)}
                      </span>
                      <span className="text-xs text-slate-500 block">/ week</span>
                    </div>
                  </label>

                  {/* Expanded Inline Creative Uploader & Destination Backlink Input */}
                  {cfg.selected && (
                    <div className="px-4 pb-4 pt-3 border-t border-emerald-900/15 space-y-3 bg-white/80 rounded-b-xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label
                            htmlFor={`headline-${slot.id}`}
                            className="block text-xs font-semibold text-slate-700 mb-1"
                          >
                            {slot.id === 'notification_bar'
                              ? 'Announcement Broadcast Copy'
                              : 'Banner Offer Headline'}
                          </label>
                          <input
                            id={`headline-${slot.id}`}
                            type="text"
                            value={cfg.headline}
                            onChange={(e) =>
                              onUpdateAdConfig(slot.id, { headline: e.target.value })
                            }
                            placeholder="e.g., Winter Special: ₹2,000 Off Lakefront Villas"
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-emerald-800"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`redirect-${slot.id}`}
                            className="block text-xs font-semibold text-slate-700 mb-1"
                          >
                            Destination Backlink / Redirect URL
                          </label>
                          <input
                            id={`redirect-${slot.id}`}
                            type="url"
                            value={cfg.redirectUrl}
                            onChange={(e) =>
                              onUpdateAdConfig(slot.id, { redirectUrl: e.target.value })
                            }
                            placeholder="https://yourwebsite.com/book or upi://pay?..."
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-emerald-800"
                          />
                        </div>
                      </div>

                      {slot.id !== 'notification_bar' && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-20 h-12 rounded-lg overflow-hidden bg-slate-200 border border-slate-200 shrink-0">
                              <ResortImage
                                src={cfg.bannerUrl}
                                alt={`${slot.name} creative`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-800 truncate">
                                {cfg.bannerFileName || 'Selected creative'}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-800 cursor-pointer transition-colors shrink-0">
                                  <Upload className="w-3 h-3" aria-hidden="true" />
                                  <span>Upload Banner</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => handleBannerUpload(slot.id, e)}
                                  />
                                </label>

                                <select
                                  aria-label={`Choose preset banner for ${slot.name}`}
                                  value={cfg.bannerUrl}
                                  onChange={(e) => {
                                    const chosen = GENERATED_BANNER_PRESETS.find(
                                      (p) => p.url === e.target.value
                                    );
                                    onUpdateAdConfig(slot.id, {
                                      bannerUrl: e.target.value,
                                      bannerFileName: chosen
                                        ? `${chosen.label}.jpg`
                                        : 'preset-banner.jpg',
                                    });
                                  }}
                                  className="max-w-full px-2 py-1 text-[11px] bg-white border border-slate-200 rounded text-slate-700 cursor-pointer"
                                >
                                  {GENERATED_BANNER_PRESETS.map((preset) => (
                                    <option key={preset.url} value={preset.url}>
                                      Preset: {preset.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {slotError && (
                        <p className="text-xs font-medium text-red-700">{slotError}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Dynamic Sticky Tariff Summary Card */}
          <aside className="min-w-0 lg:sticky lg:top-24 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-sm font-bold text-slate-900">
              Campaign Tariff Summary
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Weekly self-serve billing · Instant placement
            </p>

            <div className="mt-4 space-y-2.5 border-t border-b border-slate-200 py-4 text-xs">
              {tariffSummary.selectedSlots.length === 0 ? (
                <p className="text-slate-500">
                  No ad spaces selected yet. Tick any placement on the left to compute your weekly tariff.
                </p>
              ) : (
                tariffSummary.selectedSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-slate-700 font-medium truncate">
                      {slot.name}
                    </span>
                    <span className="font-semibold text-slate-900 tabular-nums shrink-0">
                      {formatInr(slot.weeklyPriceInr)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Total Weekly Tariff
                </span>
                <span
                  data-testid="ad-total-tariff"
                  className="text-2xl font-bold text-slate-900 tabular-nums"
                >
                  {formatInr(tariffSummary.totalWeeklyInr)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
                <span>Projected Weekly Reach</span>
                <span>
                  {tariffSummary.estimatedWeeklyImpressions.toLocaleString('en-IN')}{' '}
                  impressions
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePayAndPublish}
              className="mt-5 w-full py-3 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Pay &amp; Publish Ad
            </button>

            {adPublishFeedback && (
              <div
                role="status"
                className={`mt-3 p-3 rounded-lg text-xs font-medium ${
                  adPublishFeedback.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {adPublishFeedback.text}
              </div>
            )}
          </aside>
        </div>
      </motion.section>

      {/* 5. Weekly Redirect Growth Chart & Wayanad Demand Heatmap */}
      <RedirectsGrowthChart
        resortId={activeResort.id}
        resortName={activeResort.name}
      />

      <SeoHeatmapWidget
        resort={activeResort}
        ownerSeoNotes={ownerSeoNotes}
        onBoostAreaKeyword={(phrase) => {
          const existing = ownerSeoNotes
            .split(',')
            .map((s) => s.trim().toLowerCase());
          const nextNotes = existing.includes(phrase.toLowerCase())
            ? ownerSeoNotes
            : ownerSeoNotes.trim()
              ? `${ownerSeoNotes.trim()}, ${phrase}`
              : phrase;
          onChangeSeoNotes(nextNotes);
          onRunSeoOptimize(nextNotes);
        }}
      />

      <SeoTaskChecklist
        resort={activeResort}
        seoOutput={seoOutput}
        hasOptimizedMeta={hasOptimizedMeta}
        manualOverrides={checklistOverrides}
        onCompleteMetaTask={() => onRunSeoOptimize()}
        onSaveAltText={(altText) => {
          setDraftAltText(altText);
          onSaveListingDetails(activeResort.id, { imageAltText: altText });
        }}
        onToggleSchemaTask={onToggleSchemaChecklist}
        onJumpToListingEditor={() => {
          document
            .getElementById('listing-editor-section')
            ?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Smart Upgrade Nudge Banner */}
      <motion.section
        aria-label="Search ranking opportunity"
        initial={SUBTLE_ENTRANCE_INITIAL}
        whileInView={SUBTLE_ENTRANCE_VISIBLE}
        viewport={DASHBOARD_VIEWPORT_CONFIG}
        transition={buildWidgetEntranceTransition(1)}
        className="rounded-xl border border-amber-300/80 bg-amber-50 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="w-5 h-5 text-amber-700 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="text-sm text-slate-900 leading-relaxed">
            <span className="font-semibold">
              Boost your listing to the top of Wayanad searches this week.
            </span>{' '}
            Featured listings in the Top Hero Slider get up to 4x more direct website and WhatsApp redirects.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setProModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Activate Pro Visibility Boost
          </button>
          <a
            href="#ad-booking-portal"
            className="px-3.5 py-2 rounded-lg bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            Book Top Hero Slider
          </a>
        </div>
      </motion.section>

      {/* 6. Resort Amenities, Map Pin & Free Offer Editor */}
      <motion.section
        id="listing-editor-section"
        aria-labelledby="listing-editor-heading"
        initial={SUBTLE_ENTRANCE_INITIAL}
        whileInView={SUBTLE_ENTRANCE_VISIBLE}
        viewport={DASHBOARD_VIEWPORT_CONFIG}
        transition={buildWidgetEntranceTransition(1)}
        className="rounded-2xl border border-slate-200 bg-white p-6"
      >
        <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 id="listing-editor-heading" className="text-lg font-bold text-slate-900">
              Property Quick Editor, Amenities &amp; Free Offer
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Every Wayngongo partner property gets 1 free high-visibility offer badge on the main directory grid.
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-700">
            1 Free Offer Slot Included
          </span>
        </div>

        <form onSubmit={handleSaveListing} className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="edit-resort-name"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Property Name
            </label>
            <input
              id="edit-resort-name"
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-emerald-800 focus:bg-white"
            />
          </div>

          <div>
            <label
              htmlFor="edit-price"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Starting Nightly Rate (₹ INR)
            </label>
            <input
              id="edit-price"
              type="number"
              min={500}
              step={100}
              value={draftPrice}
              onChange={(e) => setDraftPrice(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-2 focus:outline-emerald-800 focus:bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="edit-free-offer"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Free Offer Slot Text (Displayed on Directory Card &amp; Booking Card)
            </label>
            <input
              id="edit-free-offer"
              type="text"
              value={draftOffer}
              onChange={(e) => setDraftOffer(e.target.value)}
              placeholder="e.g., Winter Deal: ₹2,000 + Breakfast"
              className="w-full px-3.5 py-2 text-sm bg-amber-50/50 border border-amber-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-emerald-800 focus:bg-white"
            />
          </div>

          <div>
            <label
              htmlFor="edit-whatsapp"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              WhatsApp Booking Number
            </label>
            <input
              id="edit-whatsapp"
              type="text"
              value={draftWhatsapp}
              onChange={(e) => setDraftWhatsapp(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-2 focus:outline-emerald-800 focus:bg-white"
            />
          </div>

          <div>
            <label
              htmlFor="edit-upi"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Direct UPI ID
            </label>
            <input
              id="edit-upi"
              type="text"
              value={draftUpi}
              onChange={(e) => setDraftUpi(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-2 focus:outline-emerald-800 focus:bg-white"
            />
          </div>

          <div>
            <label
              htmlFor="edit-direct-url"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Official Website / Direct Redirect URL
            </label>
            <input
              id="edit-direct-url"
              type="url"
              value={draftDirectUrl}
              onChange={(e) => setDraftDirectUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-emerald-800 focus:bg-white"
            />
          </div>

          <div>
            <label
              htmlFor="edit-video-label"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Short Video Tour Caption / Link
            </label>
            <input
              id="edit-video-label"
              type="text"
              value={draftVideoLabel}
              onChange={(e) => setDraftVideoLabel(e.target.value)}
              placeholder="e.g., 30s Private Plunge Pool Tour"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-emerald-800 focus:bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="edit-image-alt"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Primary Photo Description (Alt-Text)
            </label>
            <input
              id="edit-image-alt"
              type="text"
              value={draftAltText}
              onChange={(e) => setDraftAltText(e.target.value)}
              placeholder={`e.g., ${activeResort.name} plunge pool overlooking ${activeResort.location} forest`}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-emerald-800 focus:bg-white"
            />
          </div>

          {/* Owner-End Map Pin & Geo Coordinates (Hidden from Visitors) */}
          <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#065F46]" aria-hidden="true" />
                <span className="text-xs font-bold text-slate-900">
                  Owner-End Map Pin &amp; Geo Coordinates
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 text-[10px] font-semibold">
                Owner Only · Hidden from Site Visitors
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="edit-map-url"
                  className="block text-[11px] font-semibold text-slate-700 mb-1"
                >
                  Google Maps Pin Link
                </label>
                <input
                  id="edit-map-url"
                  type="url"
                  value={draftMapUrl}
                  onChange={(e) => setDraftMapUrl(e.target.value)}
                  placeholder="https://maps.google.com/?q=11.6854,76.1320"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-2 focus:outline-emerald-800"
                />
              </div>
              <div>
                <label
                  htmlFor="edit-map-coords"
                  className="block text-[11px] font-semibold text-slate-700 mb-1"
                >
                  Latitude / Longitude Pin
                </label>
                <input
                  id="edit-map-coords"
                  type="text"
                  value={draftMapCoordinates}
                  onChange={(e) => setDraftMapCoordinates(e.target.value)}
                  placeholder="11.6854, 76.1320"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-2 focus:outline-emerald-800"
                />
              </div>
            </div>
          </div>

          {/* Resort Amenities & Experiences Frontend Display Control */}
          <div className="md:col-span-2 min-w-0 rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900">
                  Resort Amenities &amp; Experiences Control
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Add experiences from the dropdown and control the maximum items shown on the frontend detail page.
                </p>
              </div>

              <div className="shrink-0">
                <label
                  htmlFor="max-amenities-select"
                  className="block text-[11px] font-semibold text-slate-600 mb-1"
                >
                  Max Visible on Frontend
                </label>
                <select
                  id="max-amenities-select"
                  value={draftMaxAmenities}
                  onChange={(e) => {
                    const nextMax = Number(e.target.value);
                    setDraftMaxAmenities(nextMax);
                    onSaveListingDetails(activeResort.id, {
                      maxAmenitiesVisible: nextMax,
                    });
                  }}
                  className="max-w-full px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-emerald-800 cursor-pointer"
                >
                  {AMENITY_MAX_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 min-w-0">
              <label htmlFor="add-amenity-select" className="sr-only">
                Choose amenity or experience to add
              </label>
              <select
                id="add-amenity-select"
                value={amenityToAdd}
                onChange={(e) =>
                  setAmenityToAdd(e.target.value as AmenityKey | '')
                }
                disabled={availableToAdd.length === 0}
                className="flex-1 min-w-0 w-full max-w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-emerald-800 cursor-pointer disabled:opacity-60"
              >
                {availableToAdd.length === 0 ? (
                  <option value="">All 12 Wayanad experiences added</option>
                ) : (
                  availableToAdd.map((key) => (
                    <option key={key} value={key}>
                      {AMENITIES_CATALOG[key].label} — {AMENITIES_CATALOG[key].detail}
                    </option>
                  ))
                )}
              </select>

              <button
                type="button"
                onClick={handleAddAmenity}
                disabled={!amenityToAdd}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-900 hover:bg-emerald-800 disabled:bg-slate-300 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add Amenity</span>
              </button>
            </div>

            <div
              data-testid="owner-amenities-list"
              className="flex flex-wrap gap-2 pt-1"
            >
              {draftAmenities.map((key, idx) => {
                const def = AMENITIES_CATALOG[key];
                if (!def) return null;
                const isHiddenByCap = idx >= draftMaxAmenities;
                return (
                  <span
                    key={key}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${
                      isHiddenByCap
                        ? 'bg-slate-100 border-slate-200 text-slate-400'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <span>{def.label}</span>
                    {isHiddenByCap && (
                      <span className="text-[10px] text-slate-400">(hidden by max)</span>
                    )}
                    <button
                      type="button"
                      aria-label={`Remove ${def.label}`}
                      onClick={() => handleRemoveAmenity(key)}
                      disabled={draftAmenities.length <= 1}
                      className="text-slate-400 hover:text-red-700 disabled:opacity-40 cursor-pointer"
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
            {listingSavedMsg ? (
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>{listingSavedMsg}</span>
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                Changes sync immediately with the Wayngongo Tourist Directory &amp; Detail Page.
              </span>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Save Listing &amp; Free Offer
            </button>
          </div>
        </form>
      </motion.section>

      {/* Pro Visibility Boost Upgrade Modal */}
      {proModalOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pro-seo-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18, ease: PREMIUM_EASE }}
          className="fixed inset-0 z-50 bg-slate-950/55 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.22, ease: PREMIUM_EASE }}
            className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl"
          >
            <span className="text-xs font-semibold text-amber-700">
              Pro Visibility Boost
            </span>
            <h3 id="pro-seo-modal-title" className="text-lg font-bold text-slate-900 mt-1">
              Reach 98/100 Google Visibility &amp; Top Placement
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Automatically keeps your Wayanad seasonal offers, photos, and tourist search highlights updated across Google and Wayngongo category pages.
            </p>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Current Visibility Score</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {googlePreview.visibilityScore}/100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Projected Score with Pro Boost</span>
                <span className="font-bold text-emerald-800 tabular-nums">98/100</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-600">Plan Tariff</span>
                <span className="font-bold text-slate-900 tabular-nums">₹999 / month</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setProModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setProActivated(true);
                  setProModalOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{proActivated ? 'Pro Boost Active' : 'Activate Pro Boost'}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}
