import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BedDouble,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  Expand,
  ExternalLink,
  MapPin,
  MessageCircle,
  QrCode,
  Sparkles,
  Star,
  Ticket,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import type {
  BudgetHotel,
  CrossPromoAd,
  EventTicketListing,
  LocalRestaurant,
  ServiceDetailSelection,
  TourOperator,
  UserRatingEntry,
} from '../types/resort';
import type { DualSeoCategory, DualSeoConfigRecord } from '../types/dualSeo';
import { formatInr } from '../utils/adPricing';
import {
  addDaysIso,
  formatDateShort,
  getDefaultDateRange,
  validateDateRange,
} from '../utils/bookingDates';
import { buildPartnerJsonLd } from '../utils/dualSeo';
import {
  buildBudgetHotelSummary,
  buildEventBookingSummary,
  buildRestaurantInquiryHref,
  buildTourBookingSummary,
} from '../utils/localDirectory';
import { computeUpdatedRating } from '../utils/userRatings';
import { ContextualPartnerBacklink } from './ContextualPartnerBacklink';
import { MediaLightboxModal, type MediaSlideItem } from './MediaLightboxModal';
import { ResortImage } from './ResortImage';
import { UserRatingSection } from './UserRatingSection';

interface ServiceDetailViewProps {
  selection: ServiceDetailSelection;
  restaurants: LocalRestaurant[];
  budgetHotels: BudgetHotel[];
  tourOperators: TourOperator[];
  events: EventTicketListing[];
  dualSeoConfig?: DualSeoConfigRecord | null;
  crossPromoAds: CrossPromoAd[];
  userRatings: UserRatingEntry[];
  onSubmitRating: (entry: UserRatingEntry) => void;
  onBackToDirectory: () => void;
  onSelectResort: (resortId: string) => void;
}

export function ServiceDetailView({
  selection,
  restaurants,
  budgetHotels,
  tourOperators,
  events,
  dualSeoConfig,
  crossPromoAds,
  userRatings,
  onSubmitRating,
  onBackToDirectory,
  onSelectResort,
}: ServiceDetailViewProps) {
  const defaultDates = useMemo(() => getDefaultDateRange(), []);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedServiceIdx, setSelectedServiceIdx] = useState(0);
  const [bookingModal, setBookingModal] = useState<'whatsapp' | 'upi' | null>(null);
  const [mediaViewerIndex, setMediaViewerIndex] = useState<number | null>(null);
  const [upiConfirmed, setUpiConfirmed] = useState(false);
  const [summaryDismissed, setSummaryDismissed] = useState(false);
  const [isRailVisible, setIsRailVisible] = useState(true);
  const bookingRailRef = useRef<HTMLDivElement | null>(null);

  // Interactive booking controls across categories
  const [checkInDate, setCheckInDate] = useState(defaultDates.checkIn);
  const [checkOutDate, setCheckOutDate] = useState(defaultDates.checkOut);
  const [guestCount, setGuestCount] = useState(2);
  const [mealSlot, setMealSlot] = useState<'Lunch (12:30 PM)' | 'Dinner (7:30 PM)'>('Lunch (12:30 PM)');
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    setSelectedServiceIdx(0);
    setSummaryDismissed(false);
    setBookingModal(null);
    setUpiConfirmed(false);
  }, [selection.kind, selection.id]);

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
  }, [selection.kind, selection.id]);

  // Inject internal programmatic JSON-LD with sameAs + url into document.head
  useEffect(() => {
    const currentEntity =
      selection.kind === 'restaurant'
        ? restaurants.find((r) => r.id === selection.id)
        : selection.kind === 'budget_hotel'
          ? budgetHotels.find((h) => h.id === selection.id)
          : selection.kind === 'event'
            ? events.find((ev) => ev.id === selection.id)
            : tourOperators.find((t) => t.id === selection.id);
    if (!currentEntity) return;

    const seoCat: DualSeoCategory =
      selection.kind === 'restaurant'
        ? 'Restaurant'
        : selection.kind === 'budget_hotel'
          ? 'Budget Hotel'
          : selection.kind === 'event'
            ? 'Event'
            : 'Tour';
    const town =
      'town' in currentEntity ? currentEntity.town : 'Wayanad';
    const fallbackExternal = `https://${currentEntity.id}.example.com`;
    const schemaObj =
      dualSeoConfig?.jsonLdSchema ??
      buildPartnerJsonLd({
        businessName: currentEntity.name,
        category: seoCat,
        location: town,
        description: currentEntity.description,
        priceRange: '₹₹',
        offers: currentEntity.offerBadge ?? 'Direct Wayngongo Rate',
        externalWebsiteUrl: fallbackExternal,
        internalListingUrl: `${window.location.origin}/?listing=${encodeURIComponent(
          currentEntity.id
        )}`,
        faqs: currentEntity.faqs,
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
  }, [selection, restaurants, budgetHotels, tourOperators, events, dualSeoConfig]);

  const restaurant =
    selection.kind === 'restaurant'
      ? restaurants.find((r) => r.id === selection.id) ?? restaurants[0]
      : null;
  const hotel =
    selection.kind === 'budget_hotel'
      ? budgetHotels.find((h) => h.id === selection.id) ?? budgetHotels[0]
      : null;
  const tour =
    selection.kind === 'tour'
      ? tourOperators.find((t) => t.id === selection.id) ?? tourOperators[0]
      : null;
  const eventListing =
    selection.kind === 'event'
      ? events.find((ev) => ev.id === selection.id) ?? events[0]
      : null;

  const entity = restaurant ?? hotel ?? tour ?? eventListing;
  if (!entity) return null;

  const ratingSummary = computeUpdatedRating(
    entity.rating,
    entity.reviewCount,
    userRatings
  );

  const gallery =
    entity.galleryImages.length >= 4
      ? entity.galleryImages.slice(0, 4)
      : [
          entity.primaryImage,
          entity.primaryImage,
          entity.primaryImage,
          entity.primaryImage,
        ];

  const mediaSlides: MediaSlideItem[] = gallery.map((img, idx) => ({
    type: 'image',
    src: img,
    caption: `${entity.name} — Photo ${idx + 1}`,
  }));

  const activeServiceItem =
    entity.serviceItems[selectedServiceIdx] ?? entity.serviceItems[0];

  const dateValidation = validateDateRange(checkInDate, checkOutDate);
  const hotelNights = dateValidation.valid ? dateValidation.nights : 1;

  // Compute category-aware live total and WhatsApp link
  let categoryLabel = 'Restaurants';
  let locationLabel = '';
  let priceHeadline = 0;
  let priceUnit = '';
  let liveSummaryLabel = '';
  let liveTotalInr = 0;
  let whatsappHref = '';
  let whatsappPreview = '';
  let upiId = 'wayngongo@okicici';

  if (restaurant) {
    categoryLabel = 'Restaurants';
    locationLabel = `${restaurant.town}, Wayanad · ${restaurant.hours}`;
    priceHeadline = activeServiceItem?.priceInr ?? restaurant.avgForTwoInr;
    priceUnit = activeServiceItem ? `· ${activeServiceItem.name}` : 'avg for two';
    liveTotalInr = activeServiceItem
      ? activeServiceItem.priceInr * guestCount
      : Math.round((restaurant.avgForTwoInr / 2) * guestCount);
    liveSummaryLabel = `${guestCount} ${guestCount === 1 ? 'guest' : 'guests'} · ${mealSlot}`;
    whatsappHref = buildRestaurantInquiryHref(
      restaurant,
      checkInDate,
      guestCount,
      mealSlot
    );
    whatsappPreview = `Hi ${restaurant.name} (${restaurant.town}), I'd like to reserve a table on ${formatDateShort(
      checkInDate
    )} (${mealSlot}) for ${guestCount} guest(s)${
      activeServiceItem ? ` — interested in ${activeServiceItem.name}` : ''
    }.${guestName.trim() ? ` Guest: ${guestName.trim()}` : ''}`;
  } else if (hotel) {
    categoryLabel = 'Budget Hotels';
    locationLabel = `${hotel.town}, Wayanad`;
    priceHeadline = activeServiceItem?.priceInr ?? hotel.priceFromInr;
    priceUnit = '/ night';
    const hotelSummary = buildBudgetHotelSummary(
      hotel,
      checkInDate,
      hotelNights,
      priceHeadline
    );
    liveTotalInr = hotelSummary.estimatedTotalInr;
    liveSummaryLabel = `${formatDateShort(checkInDate)} – ${formatDateShort(
      checkOutDate
    )} (${hotelNights} ${hotelNights === 1 ? 'night' : 'nights'})`;
    whatsappHref = hotelSummary.whatsappHref;
    whatsappPreview = `${hotelSummary.whatsappText}${
      guestName.trim() ? ` Guest: ${guestName.trim()}` : ''
    }`;
    upiId = hotel.upiId || upiId;
  } else if (tour) {
    categoryLabel = 'Book a Tour';
    locationLabel = `${tour.services} · ${tour.duration}`;
    priceHeadline = activeServiceItem?.priceInr ?? tour.startingPriceInr;
    priceUnit = '/ package';
    const tourSummary = buildTourBookingSummary(
      tour,
      checkInDate,
      guestCount,
      guestName,
      priceHeadline
    );
    liveTotalInr = tourSummary.estimatedTotalInr;
    liveSummaryLabel = `${formatDateShort(checkInDate)} · ${guestCount} ${
      guestCount === 1 ? 'guest' : 'guests'
    }`;
    whatsappHref = tourSummary.whatsappHref;
    whatsappPreview = tourSummary.whatsappText;
    upiId = tour.upiId || upiId;
  } else if (eventListing) {
    categoryLabel = 'Events & Tickets';
    locationLabel = `${eventListing.venue} · ${eventListing.town}`;
    priceHeadline = activeServiceItem?.priceInr ?? eventListing.ticketPriceInr;
    priceUnit =
      activeServiceItem?.passKind === 'Stall' ? '/ stall' : '/ pass';
    const eventSummary = buildEventBookingSummary(
      eventListing,
      checkInDate,
      guestCount,
      activeServiceItem?.name ?? 'General Entry Pass',
      priceHeadline,
      guestName
    );
    liveTotalInr = eventSummary.estimatedTotalInr;
    liveSummaryLabel = `${guestCount} × ${
      activeServiceItem?.passKind === 'Stall' ? 'Stall' : 'Pass'
    } · ${formatDateShort(checkInDate)}`;
    whatsappHref = eventSummary.whatsappHref;
    whatsappPreview = eventSummary.whatsappText;
    upiId = eventListing.upiId || upiId;
  }

  const upiHref = `upi://pay?pa=${encodeURIComponent(
    upiId
  )}&pn=${encodeURIComponent(entity.name)}&am=${liveTotalInr}&cu=INR`;

  const visibleCrossAds = crossPromoAds.slice(0, 3);
  const highlightsList = restaurant
    ? restaurant.highlights
    : hotel
      ? hotel.highlights
      : tour
        ? tour.inclusions
        : eventListing
          ? eventListing.highlights
          : [];

  return (
    <main
      data-testid="service-detail-view"
      className="max-w-[1360px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-24 md:pb-10"
    >
      {/* Top Breadcrumb */}
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
          <span>{categoryLabel}</span>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900 font-medium">{entity.name}</span>
        </div>
      </div>

      {/* Photo Gallery Grid (Hero Opening Animation + Click-to-Open Slide Gallery) */}
      <motion.section
        key={`${selection.kind}-${selection.id}-hero-gallery`}
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        aria-label="Listing photo gallery"
        className="mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-2xl overflow-hidden">
          <button
            type="button"
            data-testid="service-media-tile-0"
            aria-label={`Open ${entity.name} media gallery at photo 1`}
            onClick={() => setMediaViewerIndex(0)}
            className="md:col-span-2 md:row-span-2 relative aspect-[4/3] md:aspect-auto md:h-[380px] bg-slate-200 overflow-hidden group text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-700"
          >
            <ResortImage
              src={gallery[0]}
              alt={`${entity.name} featured view`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/70 text-white text-[11px] font-semibold backdrop-blur-xs">
              <Expand className="w-3 h-3" aria-hidden="true" />
              <span>{mediaSlides.length} Photos</span>
            </span>
            <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/75 text-white text-xs font-semibold backdrop-blur-xs">
              {restaurant && <Utensils className="w-3.5 h-3.5" aria-hidden="true" />}
              {hotel && <BedDouble className="w-3.5 h-3.5" aria-hidden="true" />}
              {tour && <Compass className="w-3.5 h-3.5" aria-hidden="true" />}
              {eventListing && <Ticket className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />}
              <span>{categoryLabel}</span>
            </div>
          </button>

          {gallery.slice(1, 4).map((img, idx) => (
            <motion.button
              type="button"
              key={`${entity.id}-img-${idx}`}
              data-testid={`service-media-tile-${idx + 1}`}
              aria-label={`Open ${entity.name} photo ${idx + 2}`}
              onClick={() => setMediaViewerIndex(idx + 1)}
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.05 + idx * 0.04 }}
              className={`relative bg-slate-200 overflow-hidden group cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-700 ${
                idx === 2
                  ? 'hidden md:block md:col-span-2 md:h-[184px]'
                  : 'hidden md:block md:h-[184px]'
              }`}
            >
              <ResortImage
                src={img}
                alt={`${entity.name} gallery ${idx + 2}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Main 2-Column Content + Sticky Booking / Inquiry Card */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-8 lg:gap-10 items-start">
        {/* Left Column */}
        <motion.div
          key={`${selection.kind}-${selection.id}-content`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.06 }}
          className="space-y-8"
        >
          <div className="pb-6 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-3 text-xs mb-2">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                <BadgeCheck className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span>Verified Wayanad Partner</span>
              </span>
              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>
              <span className="inline-flex items-center gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>{locationLabel}</span>
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

            <motion.h1
              layoutId={`service-hero-title-${selection.kind}-${selection.id}`}
              layout="position"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
            >
              {entity.name}
            </motion.h1>

            <p className="text-[15px] text-slate-600 leading-relaxed mt-4">
              {entity.description}
            </p>

            {/* Category-Specific Structured Specs */}
            {tour && (tour.vehicleType || tour.seatingCapacity || (tour.coveredSpots && tour.coveredSpots.length > 0)) && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {tour.tourCategory && (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
                      {tour.tourCategory}
                    </span>
                  )}
                  {tour.vehicleType && (
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-semibold">
                      Vehicle: {tour.vehicleType}
                    </span>
                  )}
                  {tour.seatingCapacity && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-semibold tabular-nums">
                      <Users className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                      <span>Up to {tour.seatingCapacity} Seats</span>
                    </span>
                  )}
                  {tour.pickupMode && (
                    <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-medium">
                      {tour.pickupMode}
                    </span>
                  )}
                </div>
                {tour.coveredSpots && tour.coveredSpots.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-semibold text-slate-600 mr-1">Covered Spots:</span>
                    {tour.coveredSpots.map((spot) => (
                      <span
                        key={spot}
                        className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200/80 text-amber-900 font-medium"
                      >
                        {spot}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {hotel?.checkInPolicy && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-medium text-slate-800">
                  {hotel.checkInPolicy}
                </span>
              </div>
            )}

            {restaurant?.seatingCapacity && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-medium text-slate-800 tabular-nums">
                  <Users className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  <span>Dining Seating: {restaurant.seatingCapacity} Guests</span>
                </span>
              </div>
            )}
            {eventListing && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2.5 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{eventListing.eventDates}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-800 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  <span>{eventListing.entryTime}</span>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold tabular-nums">
                  {eventListing.availableTickets} passes · {eventListing.availableStalls} stalls available
                </span>
              </div>
            )}
          </div>

          {/* Service Items Selector Grid (Menu Dishes / Rooms / Tour Packages / Event Tickets & Stalls) */}
          <section aria-labelledby="service-items-heading" className="pb-6 border-b border-slate-200">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
              <h2 id="service-items-heading" className="text-lg font-bold text-slate-900">
                {restaurant
                  ? 'Signature Menu & Meal Combos'
                  : hotel
                    ? 'Available Room Categories'
                    : eventListing
                      ? 'Entry Tickets & Exhibition Stalls'
                      : 'Guided Tour Packages'}
              </h2>
              <span className="text-xs text-slate-500">
                Select an option to update booking estimate
              </span>
            </div>

            <div className="space-y-3">
              {entity.serviceItems.map((item, idx) => {
                const selected = idx === selectedServiceIdx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedServiceIdx(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                      selected
                        ? 'bg-emerald-50/70 border-emerald-700'
                        : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                        {item.passKind && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.passKind === 'Stall'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {item.passKind}
                          </span>
                        )}
                        {item.acType && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.acType === 'A/C'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {item.acType}
                          </span>
                        )}
                        {item.dietaryType && (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.dietaryType === 'Non-Veg'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {item.dietaryType}
                          </span>
                        )}
                        {item.itemCategory && (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600">
                            {item.itemCategory}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{item.detail}</p>
                      {(item.bedType || item.maxGuests || item.vehicleType || item.seatingCapacity || item.slotTiming || item.availableInventory !== undefined) && (
                        <p className="text-[11px] text-slate-500">
                          {[
                            item.bedType,
                            item.maxGuests ? `Up to ${item.maxGuests} guests` : null,
                            item.vehicleType,
                            item.seatingCapacity ? `${item.seatingCapacity} seats` : null,
                            item.duration,
                            item.slotTiming,
                            item.availableInventory !== undefined ? `${item.availableInventory} left` : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 text-left sm:text-right tabular-nums">
                      <span className="text-base font-bold text-slate-900">
                        {formatInr(item.priceInr)}
                      </span>
                      <span className="block text-[11px] font-medium text-emerald-800">
                        {selected ? 'Selected' : 'Select'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Highlights / Inclusions */}
          {highlightsList.length > 0 && (
            <section aria-labelledby="highlights-heading" className="pb-6 border-b border-slate-200">
              <h2 id="highlights-heading" className="text-lg font-bold text-slate-900 mb-4">
                {tour ? 'Tour Inclusions' : 'Amenities & Highlights'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {highlightsList.map((label) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                    <span className="text-sm font-medium text-slate-900">{label}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* User Rating & Review Submission */}
          <UserRatingSection
            listingName={entity.name}
            baseRating={entity.rating}
            baseReviewCount={entity.reviewCount}
            userRatings={userRatings}
            onSubmitRating={onSubmitRating}
          />

          {/* Frequently Asked Questions */}
          <section aria-labelledby="service-faq-heading">
            <div className="flex items-baseline justify-between mb-4">
              <h2 id="service-faq-heading" className="text-lg font-bold text-slate-900">
                Frequently Asked Questions
              </h2>
              <span className="text-xs text-slate-400">Auto-indexed for Wayanad search</span>
            </div>

            <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {entity.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={faq.question}>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <span className="text-sm font-semibold text-slate-900">{faq.question}</span>
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

        {/* Right Sticky Booking Column */}
        <motion.div
          key={`${selection.kind}-${selection.id}-rail`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          ref={bookingRailRef}
          className="lg:sticky lg:top-20 space-y-3"
        >
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-baseline justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="tabular-nums">
                <span className="text-2xl font-bold text-slate-900">
                  {formatInr(priceHeadline)}
                </span>
                <span className="text-xs text-slate-500 ml-1.5">{priceUnit}</span>
              </div>
              <span className="text-xs font-medium text-emerald-800">Direct Rate</span>
            </div>

            {entity.offerBadge && (
              <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3">
                <span className="text-[11px] font-semibold text-amber-800 block">
                  Active Direct Offer
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{entity.offerBadge}</p>
              </div>
            )}

            {/* Category-Specific Date / Guest Picker */}
            <div className="mt-4 space-y-3">
              {hotel ? (
                <>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-800" aria-hidden="true" />
                      <span>Select Stay Dates</span>
                    </span>
                    {dateValidation.valid && (
                      <span className="text-emerald-800 tabular-nums">
                        {hotelNights} {hotelNights === 1 ? 'Night' : 'Nights'}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label
                        htmlFor="service-checkin"
                        className="block text-[11px] font-medium text-slate-600 mb-1"
                      >
                        Check-in
                      </label>
                      <input
                        id="service-checkin"
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
                        htmlFor="service-checkout"
                        className="block text-[11px] font-medium text-slate-600 mb-1"
                      >
                        Check-out
                      </label>
                      <input
                        id="service-checkout"
                        type="date"
                        min={checkInDate ? addDaysIso(checkInDate, 1) : defaultDates.today}
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-2 focus:outline-emerald-800"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label
                      htmlFor="service-visit-date"
                      className="block text-[11px] font-medium text-slate-600 mb-1"
                    >
                      {restaurant
                        ? 'Reservation Date'
                        : eventListing
                          ? 'Event / Visit Date'
                          : 'Tour Date'}
                    </label>
                    <input
                      id="service-visit-date"
                      type="date"
                      min={defaultDates.today}
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-2 focus:outline-emerald-800"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="service-guests"
                      className="block text-[11px] font-medium text-slate-600 mb-1"
                    >
                      {eventListing
                        ? activeServiceItem?.passKind === 'Stall'
                          ? 'Stalls'
                          : 'Passes'
                        : 'Guests'}
                    </label>
                    <select
                      id="service-guests"
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-2 focus:outline-emerald-800 cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 8].map((g) => (
                        <option key={g} value={g}>
                          {g}{' '}
                          {eventListing
                            ? activeServiceItem?.passKind === 'Stall'
                              ? g === 1
                                ? 'stall'
                                : 'stalls'
                              : g === 1
                                ? 'pass'
                                : 'passes'
                            : g === 1
                              ? 'guest'
                              : 'guests'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {restaurant && (
                <div>
                  <label
                    htmlFor="service-meal-slot"
                    className="block text-[11px] font-medium text-slate-600 mb-1"
                  >
                    Preferred Meal Slot
                  </label>
                  <div className="relative">
                    <Clock
                      className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <select
                      id="service-meal-slot"
                      value={mealSlot}
                      onChange={(e) =>
                        setMealSlot(e.target.value as 'Lunch (12:30 PM)' | 'Dinner (7:30 PM)')
                      }
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-emerald-800 cursor-pointer"
                    >
                      <option value="Lunch (12:30 PM)">Lunch (12:30 PM)</option>
                      <option value="Dinner (7:30 PM)">Dinner (7:30 PM)</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="service-guest-name"
                  className="block text-[11px] font-medium text-slate-600 mb-1"
                >
                  {tour
                    ? 'Pickup Resort / Guest Name (optional)'
                    : eventListing
                      ? 'Visitor / Stall Brand Name (optional)'
                      : 'Guest Name (optional)'}
                </label>
                <input
                  id="service-guest-name"
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder={
                    tour
                      ? 'e.g. Misty Woods Vythiri'
                      : eventListing
                        ? 'Your name or stall brand'
                        : 'Your name'
                  }
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-emerald-800"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="text-slate-600">Estimated total</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {formatInr(liveTotalInr)}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => setBookingModal('whatsapp')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>
                  {restaurant
                    ? 'Reserve Table via WhatsApp'
                    : eventListing
                      ? 'Book Ticket / Stall via WhatsApp'
                      : 'Book via WhatsApp'}
                </span>
              </button>

              {!restaurant && (
                <button
                  type="button"
                  onClick={() => {
                    setUpiConfirmed(false);
                    setBookingModal('upi');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4" aria-hidden="true" />
                  <span>
                    {eventListing ? 'Pay & Get Instant Pass (UPI)' : 'Pay / Book Direct (UPI)'}
                  </span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500 text-center mt-2.5 tabular-nums">
              Zero platform markup · Verified desk: +{entity.whatsappNumber}
            </p>

            <div className="mt-3">
              <ContextualPartnerBacklink
                partnerId={entity.id}
                businessName={dualSeoConfig?.businessName ?? entity.name}
                category={
                  dualSeoConfig?.category ??
                  (restaurant
                    ? 'Restaurant'
                    : hotel
                      ? 'Budget Hotel'
                      : eventListing
                        ? 'Event'
                        : 'Tour')
                }
                location={
                  dualSeoConfig?.location ??
                  ('town' in entity ? entity.town : 'Wayanad')
                }
                externalWebsiteUrl={
                  dualSeoConfig?.externalWebsiteUrl ??
                  `https://${entity.id}.example.com`
                }
                offers={dualSeoConfig?.offers ?? entity.offerBadge}
                anchorTextVariants={dualSeoConfig?.anchorTextVariants}
                activeAnchorIndex={dualSeoConfig?.activeAnchorIndex ?? 0}
                isProPartner={dualSeoConfig?.isProPartner ?? true}
              />
            </div>
          </aside>

          {/* Non-overlapping Docked Booking Summary */}
          {!summaryDismissed && isRailVisible && (
            <aside
              aria-label="Service Booking Summary"
              data-testid="service-floating-summary"
              className="hidden md:block rounded-2xl border border-emerald-200 bg-white p-4 shadow-lg"
            >
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-800 block">
                    Booking Summary
                  </span>
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[260px]">
                    {entity.name}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Hide booking summary"
                  onClick={() => setSummaryDismissed(true)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-2.5 space-y-1.5 text-xs tabular-nums">
                <div className="flex items-center justify-between text-slate-600 gap-2">
                  <span>Selection</span>
                  <span className="font-medium text-slate-900 truncate">{liveSummaryLabel}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>{activeServiceItem?.name ?? entity.name}</span>
                  <span className="text-sm font-bold text-emerald-900">
                    {formatInr(liveTotalInr)}
                  </span>
                </div>
              </div>
            </aside>
          )}
        </motion.div>
      </div>

      {/* Bottom Featured Stays Zone */}
      <section aria-labelledby="service-cross-promo-heading" className="mt-12 pt-8 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-5">
          <div>
            <h2 id="service-cross-promo-heading" className="text-xl font-bold text-slate-900">
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
                  <span className="text-xs font-semibold text-amber-700">{ad.offerBadge}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{ad.resortName}</h3>
                  <p className="text-xs text-slate-600 mt-1">{ad.tagline}</p>
                </div>
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200/70">
                  <button
                    type="button"
                    onClick={() => onSelectResort(ad.resortId)}
                    className="text-xs font-semibold text-emerald-900 hover:underline cursor-pointer"
                  >
                    Inspect Stay
                  </button>
                  <a
                    href={ad.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                  >
                    <span>Visit Site</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* WhatsApp & Direct UPI Modals */}
      {bookingModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-booking-modal-title"
          className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 id="service-booking-modal-title" className="text-base font-bold text-slate-900">
                {bookingModal === 'whatsapp'
                  ? 'Confirm Direct WhatsApp Inquiry'
                  : 'Pay / Book Direct via UPI'}
              </h3>
              <button
                type="button"
                aria-label="Close booking dialog"
                onClick={() => setBookingModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {bookingModal === 'whatsapp' ? (
              <div className="p-5 space-y-4">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-900 mb-1">Pre-filled WhatsApp message:</p>
                  <p>{whatsappPreview}</p>
                </div>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>Open WhatsApp Chat</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 tabular-nums">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Partner UPI ID</span>
                    <span className="font-mono font-semibold text-slate-900">{upiId}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Total Amount</span>
                    <span className="font-bold text-slate-900">{formatInr(liveTotalInr)}</span>
                  </div>
                </div>

                {upiConfirmed ? (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-start gap-2.5 text-xs text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <p>Direct booking recorded for {entity.name}.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <a
                      href={upiHref}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <QrCode className="w-4 h-4" aria-hidden="true" />
                      <span>Open UPI App</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setUpiConfirmed(true)}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Mark Direct Booking as Confirmed
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scrolled-past Floating Summary + Mobile Bar */}
      {!summaryDismissed && (
        <>
          {!isRailVisible && (
            <aside
              aria-label="Service Booking Summary"
              data-testid="service-floating-summary"
              className="hidden md:block fixed bottom-5 right-5 z-30 w-80 rounded-2xl border border-emerald-200 bg-white/95 backdrop-blur-md p-4 shadow-xl"
            >
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-800 block">
                    Booking Summary
                  </span>
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[220px]">
                    {entity.name}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Hide booking summary"
                  onClick={() => setSummaryDismissed(true)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs tabular-nums">
                <span className="text-slate-600 truncate">{liveSummaryLabel}</span>
                <span className="text-sm font-bold text-slate-900">{formatInr(liveTotalInr)}</span>
              </div>
              <button
                type="button"
                onClick={() => setBookingModal('whatsapp')}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{restaurant ? 'Reserve via WhatsApp' : 'Book via WhatsApp'}</span>
              </button>
            </aside>
          )}

          <div
            aria-label="Mobile Service Summary"
            className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="min-w-0 tabular-nums">
              <p className="text-[11px] font-medium text-slate-500 truncate">{entity.name}</p>
              <p className="text-sm font-bold text-slate-900">{formatInr(liveTotalInr)}</p>
            </div>
            <button
              type="button"
              onClick={() => setBookingModal('whatsapp')}
              className="px-3.5 py-2 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              {restaurant ? 'Reserve Table' : 'Book via WhatsApp'}
            </button>
          </div>
        </>
      )}
      {/* Click-to-Open Media Lightbox with Slide Navigation */}
      <MediaLightboxModal
        isOpen={mediaViewerIndex !== null}
        items={mediaSlides}
        initialIndex={mediaViewerIndex ?? 0}
        title={entity.name}
        onClose={() => setMediaViewerIndex(null)}
      />
    </main>
  );
}
