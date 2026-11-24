import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Expand,
  ExternalLink,
  MapPin,
  MessageCircle,
  Play,
  QrCode,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import type { CrossPromoAd, Resort, UserRatingEntry } from '../types/resort';
import type { DualSeoConfigRecord } from '../types/dualSeo';
import { AMENITIES_CATALOG } from '../data/amenitiesCatalog';
import { sliceVisibleAmenities } from '../utils/seoChecklist';
import { formatInr } from '../utils/adPricing';
import {
  addDaysIso,
  formatDateShort,
  getDefaultDateRange,
  validateDateRange,
} from '../utils/bookingDates';
import { buildPartnerJsonLd } from '../utils/dualSeo';
import { computeUpdatedRating } from '../utils/userRatings';
import { ContextualPartnerBacklink } from './ContextualPartnerBacklink';
import { MediaLightboxModal, type MediaSlideItem } from './MediaLightboxModal';
import { ResortImage } from './ResortImage';
import { UserRatingSection } from './UserRatingSection';

interface PropertyDetailViewProps {
  resort: Resort;
  dualSeoConfig?: DualSeoConfigRecord | null;
  crossPromoAds: CrossPromoAd[];
  userRatings: UserRatingEntry[];
  onSubmitRating: (entry: UserRatingEntry) => void;
  onBackToDirectory: () => void;
  onSelectResort: (resortId: string) => void;
}

export function PropertyDetailView({
  resort,
  dualSeoConfig,
  crossPromoAds,
  userRatings,
  onSubmitRating,
  onBackToDirectory,
  onSelectResort,
}: PropertyDetailViewProps) {
  const defaultDates = useMemo(() => getDefaultDateRange(), []);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [bookingModal, setBookingModal] = useState<'whatsapp' | 'upi' | null>(null);
  const [mediaViewerIndex, setMediaViewerIndex] = useState<number | null>(null);
  const [checkInDate, setCheckInDate] = useState(defaultDates.checkIn);
  const [checkOutDate, setCheckOutDate] = useState(defaultDates.checkOut);
  const [guestName, setGuestName] = useState('');
  const [upiConfirmed, setUpiConfirmed] = useState(false);
  const [summaryDismissed, setSummaryDismissed] = useState(false);
  const [isRailVisible, setIsRailVisible] = useState(true);
  const bookingRailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = bookingRailRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsRailVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [resort.id]);

  // Inject internal programmatic JSON-LD with sameAs + url into document.head
  useEffect(() => {
    const schemaObj =
      dualSeoConfig?.jsonLdSchema ??
      buildPartnerJsonLd({
        businessName: resort.name,
        category: 'Resort',
        location: resort.location,
        description: resort.description,
        priceRange: `₹${resort.pricePerNight.toLocaleString('en-IN')}+`,
        offers: resort.offerPill,
        externalWebsiteUrl: resort.directBookingUrl,
        internalListingUrl: `${window.location.origin}/?listing=${encodeURIComponent(
          resort.id
        )}`,
        faqs: resort.faqs,
      });

    let tag = document.head.querySelector(
      'script[data-wayanad-internal-jsonld="1"]'
    ) as HTMLScriptElement | null;
    if (!tag) {
      tag = document.createElement('script');
      tag.type = 'application/ld+json';
      tag.setAttribute('data-wayanad-internal-jsonld', '1');
      document.head.appendChild(tag);
    }
    tag.textContent = JSON.stringify(schemaObj);
    return () => {
      tag?.remove();
    };
  }, [resort, dualSeoConfig]);

  const amenitySlice = sliceVisibleAmenities(
    resort.amenities,
    resort.maxAmenitiesVisible ?? 6
  );

  const visibleCrossAds = crossPromoAds
    .filter((ad) => ad.resortId !== resort.id)
    .slice(0, 3);

  const dateValidation = validateDateRange(checkInDate, checkOutDate);
  const nights = dateValidation.valid ? dateValidation.nights : 0;
  const estimatedTotal = resort.pricePerNight * (nights > 0 ? nights : 1);

  const formattedCheckIn = formatDateShort(checkInDate);
  const formattedCheckOut = formatDateShort(checkOutDate);

  const plainWhatsappMessage = `Hi ${resort.name}, I found your stay on Wayngongo. I'd like to book ${nights} night(s) from ${formattedCheckIn} to ${formattedCheckOut} and claim "${resort.offerPill}".${
    guestName.trim() ? ` Guest: ${guestName.trim()}` : ''
  }`;
  const whatsappMessage = encodeURIComponent(plainWhatsappMessage);
  const whatsappHref = `https://wa.me/${resort.whatsappNumber}?text=${whatsappMessage}`;
  const upiHref = `upi://pay?pa=${encodeURIComponent(
    resort.upiId
  )}&pn=${encodeURIComponent(resort.name)}&am=${estimatedTotal}&cu=INR`;

  const ratingSummary = computeUpdatedRating(
    resort.rating,
    resort.reviewCount,
    userRatings
  );

  const secondaryGallery =
    resort.galleryImages.slice(1, 4).length > 0
      ? resort.galleryImages.slice(1, 4)
      : [resort.primaryImage, resort.primaryImage, resort.primaryImage];

  const mediaSlides: MediaSlideItem[] = [
    {
      type: 'image',
      src: resort.galleryImages[0] ?? resort.primaryImage,
      caption: resort.imageAltText || `${resort.name} — Main View`,
    },
    ...secondaryGallery.map((img, idx) => ({
      type: 'image' as const,
      src: img,
      caption: `${resort.name} — Photo ${idx + 2}`,
    })),
    ...(resort.hasVideoTour
      ? [
          {
            type: 'video' as const,
            src: resort.primaryImage,
            caption: resort.videoLabel ?? 'Short-form Resort Walkthrough',
            duration: resort.videoDuration ?? '0:40',
          },
        ]
      : []),
  ];

  return (
    <main className="max-w-[1360px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-24 md:pb-10">
      {/* Top Back Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <button
          type="button"
          onClick={onBackToDirectory}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-emerald-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to All Wayanad Stays</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Wayanad</span>
          <span aria-hidden="true">/</span>
          <span>{resort.location}</span>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900 font-medium">{resort.name}</span>
        </div>
      </div>

      {/* Photo & Short-Video Gallery Grid */}
      <section aria-label="Property photos and video tour" className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-2xl overflow-hidden">
          <motion.div
            key={`${resort.id}-primary-hero`}
            layoutId={`resort-hero-media-${resort.id}`}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="md:col-span-2 md:row-span-2 relative aspect-[4/3] md:aspect-auto md:h-[380px] bg-slate-200 group overflow-hidden"
          >
            <button
              type="button"
              data-testid="hero-media-tile-0"
              aria-label={`Open ${resort.name} media gallery at photo 1`}
              onClick={() => setMediaViewerIndex(0)}
              className="w-full h-full block text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-700"
            >
              <ResortImage
                src={resort.galleryImages[0] ?? resort.primaryImage}
                alt={resort.imageAltText || `${resort.name} main view`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/70 text-white text-[11px] font-semibold backdrop-blur-xs">
                <Expand className="w-3 h-3" aria-hidden="true" />
                <span>{mediaSlides.length} Media</span>
              </span>
            </button>
            {resort.hasVideoTour && (
              <button
                type="button"
                onClick={() => setMediaViewerIndex(mediaSlides.length - 1)}
                className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-950/80 hover:bg-slate-950 text-white text-xs font-semibold transition-colors cursor-pointer backdrop-blur-xs"
              >
                <Play className="w-3.5 h-3.5 fill-white" aria-hidden="true" />
                <span>
                  Watch Video Tour ({resort.videoDuration ?? '0:40'})
                </span>
              </button>
            )}
          </motion.div>

          {secondaryGallery.map((img, idx) => (
            <motion.button
              type="button"
              key={`${resort.id}-gal-${idx}`}
              data-testid={`hero-media-tile-${idx + 1}`}
              aria-label={`Open ${resort.name} photo ${idx + 2}`}
              onClick={() => setMediaViewerIndex(idx + 1)}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.05 + idx * 0.04 }}
              className={`relative aspect-[4/3] md:aspect-auto md:h-[184px] bg-slate-200 overflow-hidden group cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-700 ${
                idx === 2 ? 'md:col-span-2' : ''
              }`}
            >
              <ResortImage
                src={img}
                alt={`${resort.name} view ${idx + 2}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </motion.button>
          ))}
        </div>
      </section>

      {/* Main 2-Column Property Content + Sticky Direct Booking Card */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-8 lg:gap-10 items-start">
        {/* Left Column: Description, Amenities, User Rating, Auto-Generated SEO FAQ */}
        <motion.div
          key={`${resort.id}-details`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.06 }}
          className="space-y-8"
        >
          <div className="pb-6 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-3 text-xs mb-2">
              {resort.verified && (
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                  <BadgeCheck className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                  <span>Verified Wayanad Property</span>
                </span>
              )}
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span className="inline-flex items-center gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>
                  {resort.location}, Wayanad ({resort.landmarkDistance})
                </span>
              </span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-slate-700 tabular-nums">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
                <span>{ratingSummary.averageRating.toFixed(1)}</span>
                <span className="text-slate-400">({ratingSummary.totalReviews} reviews)</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {resort.name}
            </h1>

            <p className="text-[15px] text-slate-600 leading-relaxed mt-4">
              {resort.description}
            </p>
          </div>

          {/* Amenities Grid */}
          <section aria-labelledby="amenities-heading" className="pb-6 border-b border-slate-200">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
              <h2 id="amenities-heading" className="text-lg font-bold text-slate-900">
                Resort Amenities & Experiences
              </h2>
              <span
                data-testid="amenities-count-caption"
                className="text-xs text-slate-500 tabular-nums"
              >
                Showing {amenitySlice.visible.length} of {amenitySlice.totalCount}
              </span>
            </div>
            <div
              data-testid="detail-amenities-grid"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
            >
              {amenitySlice.visible.map((key) => {
                const item = AMENITIES_CATALOG[key];
                if (!item) return null;
                const IconComponent = item.Icon;
                return (
                  <div
                    key={key}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-900/10 text-emerald-900 flex items-center justify-center shrink-0">
                      <IconComponent className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* User Rating & Review Submission */}
          <UserRatingSection
            listingName={resort.name}
            baseRating={resort.rating}
            baseReviewCount={resort.reviewCount}
            userRatings={userRatings}
            onSubmitRating={onSubmitRating}
          />

          {/* Auto-Generated SEO FAQ Section */}
          <section aria-labelledby="faq-heading">
            <div className="flex items-baseline justify-between gap-2 mb-4">
              <h2 id="faq-heading" className="text-lg font-bold text-slate-900">
                Frequently Asked Questions
              </h2>
              <span className="text-xs text-slate-500">
                Auto-indexed for Wayanad search
              </span>
            </div>

            <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white overflow-hidden">
              {resort.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={faq.question}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span className="text-sm font-semibold text-slate-900">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </motion.div>

        {/* Right Sticky Booking / Action Column */}
        <motion.div
          key={`${resort.id}-booking-rail`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          ref={bookingRailRef}
          className="lg:sticky lg:top-20 space-y-3"
        >
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-baseline justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="tabular-nums">
                <span className="text-2xl font-bold text-slate-900">
                  {formatInr(resort.pricePerNight)}
                </span>
                <span className="text-sm text-slate-500 ml-1">/ night</span>
              </div>
              <span className="text-xs font-medium text-emerald-800">
                Direct Owner Rate
              </span>
            </div>

            {/* Active Offer Banner */}
            <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3">
              <span className="text-[11px] font-semibold text-amber-800 block">
                Active Direct Booking Offer
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {resort.offerPill}
              </p>
            </div>

          {/* Check-in / Check-out Date-Range Picker */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-800" aria-hidden="true" />
                <span>Select Stay Dates</span>
              </span>
              {dateValidation.valid && (
                <span
                  data-testid="selected-nights-badge"
                  className="text-emerald-800 tabular-nums"
                >
                  {nights} {nights === 1 ? 'Night' : 'Nights'}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label
                  htmlFor="booking-checkin"
                  className="block text-[11px] font-medium text-slate-600 mb-1"
                >
                  Check-in
                </label>
                <input
                  id="booking-checkin"
                  type="date"
                  min={defaultDates.today}
                  value={checkInDate}
                  onChange={(e) => {
                    const nextIn = e.target.value;
                    setCheckInDate(nextIn);
                    if (nextIn && checkOutDate && checkOutDate <= nextIn) {
                      setCheckOutDate(addDaysIso(nextIn, 1));
                    }
                  }}
                  className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-2 focus:outline-emerald-800"
                />
              </div>

              <div>
                <label
                  htmlFor="booking-checkout"
                  className="block text-[11px] font-medium text-slate-600 mb-1"
                >
                  Check-out
                </label>
                <input
                  id="booking-checkout"
                  type="date"
                  min={checkInDate ? addDaysIso(checkInDate, 1) : defaultDates.today}
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-2 focus:outline-emerald-800"
                />
              </div>
            </div>

            {!dateValidation.valid && dateValidation.error && (
              <p role="alert" className="text-xs font-medium text-red-700">
                {dateValidation.error}
              </p>
            )}

            <div>
              <label
                htmlFor="booking-guest-name"
                className="block text-[11px] font-medium text-slate-600 mb-1"
              >
                Guest Name (optional)
              </label>
              <input
                id="booking-guest-name"
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-emerald-800"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-600 tabular-nums">
              {dateValidation.valid
                ? `Estimated stay (${nights} ${nights === 1 ? 'night' : 'nights'})`
                : 'Select valid dates'}
            </span>
            <span
              data-testid="booking-estimated-total"
              className="font-bold text-slate-900 tabular-nums"
            >
              {dateValidation.valid ? formatInr(estimatedTotal) : '—'}
            </span>
          </div>

          {/* Primary CTAs */}
          <div className="mt-4 space-y-2">
            <button
              type="button"
              disabled={!dateValidation.valid}
              onClick={() => setBookingModal('whatsapp')}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span>Book via WhatsApp</span>
            </button>

            <button
              type="button"
              disabled={!dateValidation.valid}
              onClick={() => {
                setUpiConfirmed(false);
                setBookingModal('upi');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              <QrCode className="w-4 h-4" aria-hidden="true" />
              <span>Pay / Book Direct (UPI / Website Redirect)</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 text-center mt-2.5">
            Zero platform markup · Verified resort desk: +{resort.whatsappNumber}
          </p>

          <div className="mt-3">
            <ContextualPartnerBacklink
              partnerId={resort.id}
              businessName={dualSeoConfig?.businessName ?? resort.name}
              category={dualSeoConfig?.category ?? 'Resort'}
              location={dualSeoConfig?.location ?? resort.location}
              externalWebsiteUrl={
                dualSeoConfig?.externalWebsiteUrl ?? resort.directBookingUrl
              }
              offers={dualSeoConfig?.offers ?? resort.offerPill}
              anchorTextVariants={dualSeoConfig?.anchorTextVariants}
              activeAnchorIndex={dualSeoConfig?.activeAnchorIndex ?? 0}
              isProPartner={dualSeoConfig?.isProPartner ?? true}
            />
          </div>
        </aside>

        {/* Docked Floating-Style Booking Summary Card (Non-overlapping while right rail is in view) */}
        {!summaryDismissed && isRailVisible && (
          <aside
            aria-label="Floating Booking Summary"
            data-testid="floating-booking-summary"
            className="hidden md:block rounded-2xl border border-emerald-200 bg-white p-4 shadow-lg"
          >
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-semibold text-emerald-800 block">
                  Booking Summary
                </span>
                <p className="text-xs font-bold text-slate-900 truncate max-w-[260px]">
                  {resort.name}
                </p>
              </div>
              <button
                type="button"
                aria-label="Hide floating booking summary"
                onClick={() => setSummaryDismissed(true)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-2.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600 tabular-nums">
                <span>Stay Dates</span>
                <span className="font-medium text-slate-900">
                  {dateValidation.valid
                    ? `${formattedCheckIn} – ${formattedCheckOut}`
                    : 'Invalid range'}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 tabular-nums">
                <span>
                  {formatInr(resort.pricePerNight)} × {nights}{' '}
                  {nights === 1 ? 'night' : 'nights'}
                </span>
                <span
                  data-testid="floating-summary-total"
                  className="text-sm font-bold text-emerald-900"
                >
                  {dateValidation.valid ? formatInr(estimatedTotal) : '—'}
                </span>
              </div>
            </div>
          </aside>
        )}
        </motion.div>
      </div>

      {/* Bottom Featured Stays Zone */}
      <section
        aria-labelledby="cross-promo-heading"
        className="mt-12 pt-8 border-t border-slate-200"
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-5">
          <div>
            <h2 id="cross-promo-heading" className="text-xl font-bold text-slate-900">
              Explore More Offers in Wayanad
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Seasonal deals from verified Wayanad partner resorts
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
            <span>Featured Stays</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {visibleCrossAds.map((ad) => (
            <article
              key={ad.id}
              className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] bg-slate-200 overflow-hidden">
                <ResortImage
                  src={ad.imageUrl}
                  alt={ad.resortName}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950/75 text-white text-[11px] font-medium">
                  <Sparkles className="w-3 h-3 text-amber-300" aria-hidden="true" />
                  <span>{ad.location}</span>
                </span>
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-amber-700">
                    {ad.offerBadge}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {ad.resortName}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">{ad.tagline}</p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => onSelectResort(ad.resortId)}
                    className="text-xs font-semibold text-emerald-900 hover:underline cursor-pointer"
                  >
                    View Property
                  </button>
                  <a
                    href={ad.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-800 text-xs font-semibold text-slate-800 transition-colors"
                  >
                    <span>Visit Direct Site</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* WhatsApp / Direct UPI Booking Modal */}
      {bookingModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
          className="fixed inset-0 z-50 bg-slate-950/55 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-emerald-800">
                  {bookingModal === 'whatsapp'
                    ? 'Direct WhatsApp Concierge'
                    : 'Direct UPI & Website Checkout'}
                </span>
                <h3
                  id="booking-modal-title"
                  className="text-lg font-bold text-slate-900 mt-0.5"
                >
                  {resort.name}
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close booking dialog"
                onClick={() => setBookingModal(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {bookingModal === 'whatsapp' ? (
              <div className="mt-4 space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1.5">
                  <p className="font-semibold text-slate-900">
                    Prefilled Booking Inquiry ({formattedCheckIn} – {formattedCheckOut}):
                  </p>
                  <p data-testid="whatsapp-prefill-preview">
                    &ldquo;{plainWhatsappMessage}&rdquo;
                  </p>
                </div>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Open WhatsApp (+{resort.whatsappNumber})</span>
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Stay Dates</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {formattedCheckIn} – {formattedCheckOut}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Resort UPI ID</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {resort.upiId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Payable Estimate ({nights} nights)</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {formatInr(estimatedTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Applied Deal</span>
                    <span className="font-semibold text-amber-800">
                      {resort.offerPill}
                    </span>
                  </div>
                </div>

                {upiConfirmed ? (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Direct booking reference logged</p>
                      <p className="mt-0.5 text-emerald-800">
                        You can complete UPI transfer via {resort.upiId} or continue to
                        the property&apos;s official checkout portal.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <a
                      href={upiHref}
                      onClick={() => setUpiConfirmed(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>Pay {formatInr(estimatedTotal)} via UPI App</span>
                    </a>
                    <a
                      href={resort.directBookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-900 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>Redirect to Official Resort Website</span>
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click-to-Open Media Lightbox with Slide Navigation */}
      <MediaLightboxModal
        isOpen={mediaViewerIndex !== null}
        items={mediaSlides}
        initialIndex={mediaViewerIndex ?? 0}
        title={resort.name}
        onClose={() => setMediaViewerIndex(null)}
      />
      {/* Floating Real-Time Booking Summary Card (Fixed bottom-right when scrolled past booking rail, + Mobile Bottom Strip) */}
      {!summaryDismissed && (
        <>
          {!isRailVisible && (
            <aside
              aria-label="Floating Booking Summary"
              data-testid="floating-booking-summary"
              className="hidden md:block fixed bottom-5 right-5 z-30 w-80 rounded-2xl border border-emerald-200 bg-white/95 backdrop-blur-md p-4 shadow-xl"
            >
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-800 block">
                    Booking Summary
                  </span>
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[220px]">
                    {resort.name}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Hide floating booking summary"
                  onClick={() => setSummaryDismissed(true)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-2.5 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600 tabular-nums">
                  <span>Dates</span>
                  <span className="font-medium text-slate-900">
                    {dateValidation.valid
                      ? `${formattedCheckIn} – ${formattedCheckOut}`
                      : 'Invalid range'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 tabular-nums">
                  <span>
                    {formatInr(resort.pricePerNight)} × {nights}{' '}
                    {nights === 1 ? 'night' : 'nights'}
                  </span>
                  <span
                    data-testid="floating-summary-total"
                    className="text-sm font-bold text-slate-900"
                  >
                    {dateValidation.valid ? formatInr(estimatedTotal) : '—'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={!dateValidation.valid}
                onClick={() => setBookingModal('whatsapp')}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-emerald-900 hover:bg-emerald-800 disabled:bg-slate-300 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Book via WhatsApp</span>
              </button>
            </aside>
          )}

          <div
            aria-label="Mobile Booking Summary"
            className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="min-w-0 tabular-nums">
              <p className="text-[11px] font-medium text-slate-500 truncate">
                Booking Summary · {nights} {nights === 1 ? 'night' : 'nights'}
              </p>
              <p className="text-sm font-bold text-slate-900">
                {dateValidation.valid ? formatInr(estimatedTotal) : 'Select dates'}
              </p>
            </div>
            <button
              type="button"
              disabled={!dateValidation.valid}
              onClick={() => setBookingModal('whatsapp')}
              className="px-3.5 py-2 rounded-lg bg-emerald-900 hover:bg-emerald-800 disabled:bg-slate-300 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              Book via WhatsApp
            </button>
          </div>
        </>
      )}
    </main>
  );
}
