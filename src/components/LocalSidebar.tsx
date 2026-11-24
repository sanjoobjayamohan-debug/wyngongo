import { BedDouble, Compass, Ticket, Utensils } from 'lucide-react';
import { motion } from 'motion/react';
import type {
  BudgetHotel,
  EventTicketListing,
  LocalRestaurant,
  ServiceDetailSelection,
  TourOperator,
  WayanadLocation,
} from '../types/resort';
import { formatInr } from '../utils/adPricing';

interface LocalSidebarProps {
  restaurants: LocalRestaurant[];
  budgetHotels: BudgetHotel[];
  tourOperators: TourOperator[];
  events: EventTicketListing[];
  selectedLocation: WayanadLocation;
  onSelectServiceDetail: (selection: ServiceDetailSelection) => void;
}

export function LocalSidebar({
  restaurants,
  budgetHotels,
  tourOperators,
  events,
  selectedLocation,
  onSelectServiceDetail,
}: LocalSidebarProps) {
  return (
    <aside
      aria-label="Wayanad restaurants, budget hotels, tours, and events"
      data-testid="left-directory-sidebar"
      className="w-full lg:w-[296px] shrink-0 order-2 lg:order-1"
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 divide-y divide-slate-200 overflow-hidden">
        {/* 1. Events & Tickets */}
        <section aria-labelledby="sidebar-events-heading" className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3
              id="sidebar-events-heading"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-900"
            >
              <Ticket className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
              <span>Events &amp; Tickets</span>
            </h3>
            <span className="text-[11px] font-medium text-slate-500 tabular-nums">
              {events.length} fests
            </span>
          </div>

          <ul className="divide-y divide-slate-200/70">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="py-2.5 flex items-center justify-between gap-3"
              >
                <motion.button
                  type="button"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() =>
                    onSelectServiceDetail({ kind: 'event', id: ev.id })
                  }
                  className="min-w-0 text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-800 rounded"
                >
                  <motion.p
                    layoutId={`service-hero-title-event-${ev.id}`}
                    layout="position"
                    className="text-[13px] font-semibold text-slate-900 group-hover:text-emerald-900 leading-snug truncate"
                  >
                    {ev.name}
                  </motion.p>
                  <p className="text-xs text-slate-500 mt-0.5 tabular-nums truncate">
                    {ev.town} · {formatInr(ev.ticketPriceInr)} pass
                  </p>
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  aria-label={`Get tickets for ${ev.name}`}
                  onClick={() =>
                    onSelectServiceDetail({ kind: 'event', id: ev.id })
                  }
                  className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                >
                  Tickets
                </motion.button>
              </li>
            ))}
          </ul>
        </section>

        {/* 2. Restaurants */}
        <section aria-labelledby="sidebar-restaurants-heading" className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3
              id="sidebar-restaurants-heading"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-900"
            >
              <Utensils className="w-4 h-4 text-emerald-800 shrink-0" aria-hidden="true" />
              <span>Restaurants</span>
            </h3>
            <span className="text-[11px] font-medium text-slate-500 tabular-nums">
              {restaurants.length} spots
            </span>
          </div>

          <ul className="divide-y divide-slate-200/70">
            {restaurants.map((restaurant) => {
              const matchesRegion =
                selectedLocation !== 'All Wayanad' &&
                restaurant.regionFilter === selectedLocation;
              return (
                <li key={restaurant.id}>
                  <motion.button
                    type="button"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() =>
                      onSelectServiceDetail({ kind: 'restaurant', id: restaurant.id })
                    }
                    className={`w-full py-2.5 text-left group transition-colors cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-emerald-800 ${
                      matchesRegion ? 'text-emerald-950' : ''
                    }`}
                  >
                    <motion.p
                      layoutId={`service-hero-title-restaurant-${restaurant.id}`}
                      layout="position"
                      className="text-[13px] font-semibold text-slate-900 group-hover:text-emerald-900 leading-snug truncate"
                    >
                      {restaurant.name}
                    </motion.p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {restaurant.town} · {restaurant.specialty}
                    </p>
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 3. Budget hotels */}
        <section aria-labelledby="sidebar-budget-hotels-heading" className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3
              id="sidebar-budget-hotels-heading"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-900"
            >
              <BedDouble className="w-4 h-4 text-emerald-800 shrink-0" aria-hidden="true" />
              <span>Budget Hotels</span>
            </h3>
            <span className="text-[11px] font-medium text-slate-500 tabular-nums">
              {budgetHotels.length} stays
            </span>
          </div>

          <ul className="divide-y divide-slate-200/70">
            {budgetHotels.map((hotel) => (
              <li key={hotel.id}>
                <motion.button
                  type="button"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() =>
                    onSelectServiceDetail({ kind: 'budget_hotel', id: hotel.id })
                  }
                  className="w-full py-2.5 text-left group transition-colors cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-emerald-800"
                >
                  <motion.p
                    layoutId={`service-hero-title-budget_hotel-${hotel.id}`}
                    layout="position"
                    className="text-[13px] font-semibold text-slate-900 group-hover:text-emerald-900 leading-snug truncate"
                  >
                    {hotel.name}
                  </motion.p>
                  <p className="text-xs text-slate-500 mt-0.5 tabular-nums truncate">
                    {hotel.town} · from {formatInr(hotel.priceFromInr)}
                  </p>
                </motion.button>
              </li>
            ))}
          </ul>
        </section>

        {/* 4. Book a tour */}
        <section aria-labelledby="sidebar-tours-heading" className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3
              id="sidebar-tours-heading"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-900"
            >
              <Compass className="w-4 h-4 text-emerald-800 shrink-0" aria-hidden="true" />
              <span>Book a Tour</span>
            </h3>
            <span className="text-[11px] font-medium text-slate-500 tabular-nums">
              {tourOperators.length} operators
            </span>
          </div>

          <ul className="divide-y divide-slate-200/70">
            {tourOperators.map((operator) => (
              <li
                key={operator.id}
                className="py-2.5 flex items-center justify-between gap-3"
              >
                <motion.button
                  type="button"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() =>
                    onSelectServiceDetail({ kind: 'tour', id: operator.id })
                  }
                  className="min-w-0 text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-800 rounded"
                >
                  <motion.p
                    layoutId={`service-hero-title-tour-${operator.id}`}
                    layout="position"
                    className="text-[13px] font-semibold text-slate-900 group-hover:text-emerald-900 leading-snug truncate"
                  >
                    {operator.name}
                  </motion.p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {operator.services}
                  </p>
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  aria-label={`Book ${operator.name}`}
                  onClick={() =>
                    onSelectServiceDetail({ kind: 'tour', id: operator.id })
                  }
                  className="px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-900"
                >
                  Book
                </motion.button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}
