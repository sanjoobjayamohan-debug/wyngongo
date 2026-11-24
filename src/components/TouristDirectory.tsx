import { useState } from 'react';
import {
  ArrowUpRight,
  BedDouble,
  Calendar,
  Compass,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Ticket,
  Trees,
  Utensils,
} from 'lucide-react';
import { motion } from 'motion/react';
import type {
  BudgetHotel,
  DirectoryCategoryTab,
  EventTicketListing,
  HeroAdSlide,
  LocalRestaurant,
  Resort,
  ServiceDetailSelection,
  TourOperator,
  WayanadLocation,
} from '../types/resort';
import { formatInr } from '../utils/adPricing';
import {
  buildCardEntranceTransition,
  buildWidgetEntranceTransition,
  DASHBOARD_VIEWPORT_CONFIG,
  PREMIUM_EASE,
  SUBTLE_ENTRANCE_INITIAL,
  SUBTLE_ENTRANCE_VISIBLE,
} from '../utils/motionPresets';
import { MAX_COMPARE_RESORTS } from '../utils/resortCompare';
import { HeroAdSlider } from './HeroAdSlider';
import { LocalSidebar } from './LocalSidebar';
import { ResortCard } from './ResortCard';
import { ResortCompareBar } from './ResortCompareBar';
import { ResortImage } from './ResortImage';

export interface DirectoryBannerAd {
  id: string;
  resortId: string;
  resortName: string;
  headline: string;
  imageUrl: string;
  redirectUrl: string;
}

interface TouristDirectoryProps {
  resorts: Resort[];
  allResorts: Resort[];
  restaurants: LocalRestaurant[];
  budgetHotels: BudgetHotel[];
  tourOperators: TourOperator[];
  events: EventTicketListing[];
  heroSlides: HeroAdSlide[];
  selectedLocation: WayanadLocation;
  onResetLocation: () => void;
  onSelectResort: (resortId: string) => void;
  onSelectServiceDetail: (selection: ServiceDetailSelection) => void;
  directoryBanner?: DirectoryBannerAd | null;
  selectedCompareIds: string[];
  onToggleCompare: (resortId: string) => void;
  onClearCompare: () => void;
  onOpenCompare: () => void;
}

const TOP_CATEGORY_TABS: {
  id: DirectoryCategoryTab;
  label: string;
  Icon: typeof Trees;
}[] = [
  { id: 'all', label: 'All Wayanad', Icon: Sparkles },
  { id: 'resort', label: 'Resorts', Icon: Trees },
  { id: 'budget_hotel', label: 'Budget Hotels', Icon: BedDouble },
  { id: 'restaurant', label: 'Restaurants', Icon: Utensils },
  { id: 'tour', label: 'Book a Tour', Icon: Compass },
  { id: 'events', label: 'Events & Tickets', Icon: Ticket },
];

export function TouristDirectory({
  resorts,
  allResorts,
  restaurants,
  budgetHotels,
  tourOperators,
  events,
  heroSlides,
  selectedLocation,
  onResetLocation,
  onSelectResort,
  onSelectServiceDetail,
  directoryBanner,
  selectedCompareIds,
  onToggleCompare,
  onClearCompare,
  onOpenCompare,
}: TouristDirectoryProps) {
  const [selectedCategory, setSelectedCategory] =
    useState<DirectoryCategoryTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc'>('featured');
  const selectedCompareResorts = selectedCompareIds
    .map((id) => allResorts.find((r) => r.id === id))
    .filter((r): r is Resort => Boolean(r));
  const isCompareLimitReached = selectedCompareIds.length >= MAX_COMPARE_RESORTS;

  const q = searchQuery.trim().toLowerCase();

  const visibleResorts = resorts
    .filter((resort) => {
      if (!q) return true;
      return (
        resort.name.toLowerCase().includes(q) ||
        resort.location.toLowerCase().includes(q) ||
        resort.landmarkDistance.toLowerCase().includes(q) ||
        resort.offerPill.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.pricePerNight - b.pricePerNight;
      if (sortBy === 'price_desc') return b.pricePerNight - a.pricePerNight;
      return 0;
    });

  const visibleBudgetHotels = budgetHotels.filter((h) => {
    const locOk =
      selectedLocation === 'All Wayanad' ||
      h.regionFilter === selectedLocation ||
      h.town.toLowerCase() === selectedLocation.toLowerCase();
    if (!locOk) return false;
    if (!q) return true;
    return (
      h.name.toLowerCase().includes(q) ||
      h.town.toLowerCase().includes(q) ||
      h.roomSummary.toLowerCase().includes(q)
    );
  });

  const visibleRestaurants = restaurants.filter((r) => {
    const locOk =
      selectedLocation === 'All Wayanad' ||
      r.regionFilter === selectedLocation ||
      r.town.toLowerCase() === selectedLocation.toLowerCase();
    if (!locOk) return false;
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.town.toLowerCase().includes(q) ||
      r.specialty.toLowerCase().includes(q)
    );
  });

  const visibleTours = tourOperators.filter((t) => {
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.services.toLowerCase().includes(q) ||
      t.highlights.toLowerCase().includes(q)
    );
  });

  const visibleEvents = events.filter((ev) => {
    const locOk =
      selectedLocation === 'All Wayanad' ||
      ev.regionFilter === selectedLocation ||
      ev.town.toLowerCase() === selectedLocation.toLowerCase();
    if (!locOk) return false;
    if (!q) return true;
    return (
      ev.name.toLowerCase().includes(q) ||
      ev.venue.toLowerCase().includes(q) ||
      ev.town.toLowerCase().includes(q) ||
      ev.eventDates.toLowerCase().includes(q)
    );
  });

  const showResortsSection = selectedCategory === 'all' || selectedCategory === 'resort';
  const showEventsSection = selectedCategory === 'all' || selectedCategory === 'events';
  const showHotelsSection = selectedCategory === 'budget_hotel';
  const showRestaurantsSection = selectedCategory === 'restaurant';
  const showToursSection = selectedCategory === 'tour';

  return (
    <main className={selectedCompareResorts.length > 0 ? 'pb-20' : ''}>
      {/* Top Hero Ad Slider */}
      <HeroAdSlider slides={heroSlides} onInspectResort={onSelectResort} />

      {/* Directory Grid + Left Local Sidebar Section */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Top Category Switcher Strip */}
        <div
          role="tablist"
          aria-label="Browse Wayanad categories"
          data-testid="top-category-tabs"
          className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-6 mb-6 border-b border-slate-200"
        >
          {TOP_CATEGORY_TABS.map((tab) => {
            const Icon = tab.Icon;
            const active = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                data-testid={`category-tab-${tab.id}`}
                onClick={() => setSelectedCategory(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#065F46] ${
                  active
                    ? 'bg-[#065F46] text-white shadow-xs'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-8">
          <LocalSidebar
            restaurants={restaurants}
            budgetHotels={budgetHotels}
            tourOperators={tourOperators}
            events={events}
            selectedLocation={selectedLocation}
            onSelectServiceDetail={onSelectServiceDetail}
          />

          <div className="flex-1 min-w-0 w-full order-1 lg:order-2 space-y-10">
            {/* Search & Sort Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900">
                  {selectedCategory === 'events'
                    ? 'Wayanad Events, Fests & Tickets'
                    : selectedCategory === 'restaurant'
                      ? 'Local Restaurants & Malabar Dining'
                      : selectedCategory === 'budget_hotel'
                        ? 'Clean Budget Hotels & Lodges'
                        : selectedCategory === 'tour'
                          ? 'Jeep Safaris, Treks & Day Tours'
                          : `Popular Stays & Experiences in ${
                              selectedLocation === 'All Wayanad' ? 'Wayanad' : selectedLocation
                            }`}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Book verified resorts, dining, tours, and festival passes directly via WhatsApp &amp; UPI.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative flex-1 sm:flex-initial">
                  <Search
                    className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search stays, fests, food..."
                    aria-label="Search Wayanad listings"
                    className="w-full sm:w-56 pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-emerald-800 focus:bg-white"
                  />
                </div>

                {showResortsSection && (
                  <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <label htmlFor="sort-resorts" className="sr-only">
                      Sort stays
                    </label>
                    <select
                      id="sort-resorts"
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as 'featured' | 'price_asc' | 'price_desc')
                      }
                      className="text-xs font-medium text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="featured">Recommended</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Resorts Grid */}
            {showResortsSection && (
              visibleResorts.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 py-14 px-6 text-center">
                  <p className="text-base font-semibold text-slate-900">
                    No stays match this filter in {selectedLocation}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Clear your search query or view all verified properties across Wayanad.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      onResetLocation();
                    }}
                    className="mt-4 px-4 py-2 rounded-lg bg-emerald-900 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer"
                  >
                    Show All Wayanad Stays
                  </button>
                </div>
              ) : (
                <div
                  data-testid="resort-grid"
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  {visibleResorts.map((resort, idx) => (
                    <ResortCard
                      key={resort.id}
                      resort={resort}
                      index={idx}
                      isCompared={selectedCompareIds.includes(resort.id)}
                      isCompareLimitReached={isCompareLimitReached}
                      onToggleCompare={onToggleCompare}
                      onSelect={onSelectResort}
                    />
                  ))}
                </div>
              )
            )}

            {/* Events & Tickets Cards Section (Poopoli, Boche Fest, Valliyurkavu) */}
            {showEventsSection && (
              <section aria-label="Wayanad Events and Tickets" data-testid="events-grid-section">
                {selectedCategory === 'all' && (
                  <div className="flex items-baseline justify-between gap-2 mb-4 pt-2 border-t border-slate-100">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Upcoming Events &amp; Fest Tickets
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Book visitor entry passes or exhibition stalls for Wayanad&apos;s biggest festivals
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('events')}
                      className="text-xs font-semibold text-emerald-900 hover:underline cursor-pointer"
                    >
                      View all fests
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {visibleEvents.map((ev, idx) => (
                    <motion.article
                      key={ev.id}
                      data-testid={`event-card-${ev.id}`}
                      initial={SUBTLE_ENTRANCE_INITIAL}
                      animate={SUBTLE_ENTRANCE_VISIBLE}
                      transition={buildCardEntranceTransition(idx)}
                      whileHover={{ y: -3, transition: { duration: 0.18, ease: PREMIUM_EASE } }}
                      className="group rounded-2xl border border-slate-200 bg-white overflow-hidden transition-shadow duration-200 hover:shadow-md flex flex-col justify-between"
                    >
                      <button
                        type="button"
                        onClick={() => onSelectServiceDetail({ kind: 'event', id: ev.id })}
                        className="text-left block w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-800"
                      >
                        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                          <ResortImage
                            src={ev.primaryImage}
                            alt={ev.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                          <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-600 text-white text-[11px] font-semibold shadow-sm">
                            <Ticket className="w-3 h-3" aria-hidden="true" />
                            <span>Events &amp; Tickets</span>
                          </div>
                        </div>
                        <div className="p-4 pb-3 space-y-1.5">
                          <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1 truncate">
                              <MapPin className="w-3.5 h-3.5 text-emerald-800 shrink-0" aria-hidden="true" />
                              <span className="truncate">{ev.town} · {ev.venue}</span>
                            </span>
                            <span className="inline-flex items-center gap-1 font-medium text-slate-800 shrink-0 tabular-nums">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
                              {ev.rating.toFixed(1)}
                            </span>
                          </div>
                          <h3 className="text-[16px] font-semibold text-slate-900 leading-snug group-hover:text-emerald-900">
                            {ev.name}
                          </h3>
                          <p className="text-xs text-slate-600 inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                            <span>{ev.eventDates}</span>
                          </p>
                          <p className="text-xs font-medium text-amber-700 pt-0.5 truncate">
                            {ev.availableTickets} passes · {ev.availableStalls} stalls open
                          </p>
                        </div>
                      </button>

                      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="tabular-nums">
                          <span className="text-base font-bold text-slate-900">
                            {formatInr(ev.ticketPriceInr)}
                          </span>
                          <span className="text-xs text-slate-500"> / pass</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onSelectServiceDetail({ kind: 'event', id: ev.id })}
                          className="text-xs font-semibold text-emerald-900 hover:underline cursor-pointer"
                        >
                          Book Tickets →
                        </button>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </section>
            )}

            {/* Budget Hotels Category Grid */}
            {showHotelsSection && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {visibleBudgetHotels.map((hotel, idx) => (
                  <motion.article
                    key={hotel.id}
                    initial={SUBTLE_ENTRANCE_INITIAL}
                    animate={SUBTLE_ENTRANCE_VISIBLE}
                    transition={buildCardEntranceTransition(idx)}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectServiceDetail({ kind: 'budget_hotel', id: hotel.id })}
                      className="text-left block w-full cursor-pointer"
                    >
                      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                        <ResortImage
                          src={hotel.primaryImage}
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{hotel.town}, Wayanad</span>
                          <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
                            {hotel.rating.toFixed(1)}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-slate-900">{hotel.name}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2">{hotel.roomSummary}</p>
                      </div>
                    </button>
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-base font-bold text-slate-900 tabular-nums">
                        {formatInr(hotel.priceFromInr)}
                        <span className="text-xs font-normal text-slate-500"> / night</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectServiceDetail({ kind: 'budget_hotel', id: hotel.id })}
                        className="text-xs font-semibold text-emerald-900 hover:underline cursor-pointer"
                      >
                        View Rooms →
                      </button>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}

            {/* Restaurants Category Grid */}
            {showRestaurantsSection && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {visibleRestaurants.map((rest, idx) => (
                  <motion.article
                    key={rest.id}
                    initial={SUBTLE_ENTRANCE_INITIAL}
                    animate={SUBTLE_ENTRANCE_VISIBLE}
                    transition={buildCardEntranceTransition(idx)}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectServiceDetail({ kind: 'restaurant', id: rest.id })}
                      className="text-left block w-full cursor-pointer"
                    >
                      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                        <ResortImage
                          src={rest.primaryImage}
                          alt={rest.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{rest.town} · {rest.specialty}</span>
                          <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
                            {rest.rating.toFixed(1)}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-slate-900">{rest.name}</h3>
                        <p className="text-xs text-slate-600">{rest.hours}</p>
                      </div>
                    </button>
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-base font-bold text-slate-900 tabular-nums">
                        {formatInr(rest.avgForTwoInr)}
                        <span className="text-xs font-normal text-slate-500"> for two</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectServiceDetail({ kind: 'restaurant', id: rest.id })}
                        className="text-xs font-semibold text-emerald-900 hover:underline cursor-pointer"
                      >
                        Menu &amp; Table →
                      </button>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}

            {/* Book a Tour Category Grid */}
            {showToursSection && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {visibleTours.map((tour, idx) => (
                  <motion.article
                    key={tour.id}
                    initial={SUBTLE_ENTRANCE_INITIAL}
                    animate={SUBTLE_ENTRANCE_VISIBLE}
                    transition={buildCardEntranceTransition(idx)}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <button
                      type="button"
                      onClick={() => onSelectServiceDetail({ kind: 'tour', id: tour.id })}
                      className="text-left block w-full cursor-pointer"
                    >
                      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                        <ResortImage
                          src={tour.primaryImage}
                          alt={tour.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{tour.services}</span>
                          <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
                            {tour.rating.toFixed(1)}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-slate-900">{tour.name}</h3>
                        <p className="text-xs text-slate-600 line-clamp-2">{tour.highlights}</p>
                      </div>
                    </button>
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-base font-bold text-slate-900 tabular-nums">
                        {formatInr(tour.startingPriceInr)}
                        <span className="text-xs font-normal text-slate-500"> / trip</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectServiceDetail({ kind: 'tour', id: tour.id })}
                        className="text-xs font-semibold text-emerald-900 hover:underline cursor-pointer"
                      >
                        Book Tour →
                      </button>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}

            {/* Category / Directory Display Banner (shows if published from Partner Dashboard) */}
            {directoryBanner && (
              <motion.aside
                aria-label="Featured directory spotlight"
                initial={SUBTLE_ENTRANCE_INITIAL}
                whileInView={SUBTLE_ENTRANCE_VISIBLE}
                viewport={DASHBOARD_VIEWPORT_CONFIG}
                transition={buildWidgetEntranceTransition(0)}
                className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden grid grid-cols-1 md:grid-cols-[1.2fr_2fr] items-stretch"
              >
                <div className="aspect-[16/9] md:aspect-auto md:h-44 bg-slate-200 overflow-hidden">
                  <ResortImage
                    src={directoryBanner.imageUrl}
                    alt={directoryBanner.resortName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 sm:p-6 flex flex-col justify-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
                    <span>{directoryBanner.resortName}</span>
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {directoryBanner.headline}
                  </h3>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onSelectResort(directoryBanner.resortId)}
                      className="px-4 py-2 rounded-lg bg-emerald-900 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer"
                    >
                      View Offer
                    </button>
                    <a
                      href={directoryBanner.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-emerald-900"
                    >
                      <span>Visit Official Website</span>
                      <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </motion.aside>
            )}
          </div>
        </div>
      </section>

      <ResortCompareBar
        selectedResorts={selectedCompareResorts}
        onRemoveResort={onToggleCompare}
        onClearAll={onClearCompare}
        onOpenCompare={onOpenCompare}
      />
    </main>
  );
}
