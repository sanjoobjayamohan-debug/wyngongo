import { useEffect, useState } from 'react';
import {
  BedDouble,
  CheckCircle2,
  Compass,
  MapPin,
  Plus,
  Ticket,
  Trash2,
  Trees,
  Utensils,
} from 'lucide-react';
import { motion } from 'motion/react';
import { CATEGORY_IMAGE_PRESETS } from '../data/localDirectoryData';
import { GENERATED_BANNER_PRESETS } from '../data/mockWayanadData';
import type {
  PartnerCategory,
  ServiceDetailSelection,
  ServiceLineItem,
} from '../types/resort';
import { formatInr } from '../utils/adPricing';
import { PARTNER_CATEGORY_OPTIONS } from '../utils/authValidation';
import {
  createServiceItemRecord,
  validatePartnerServiceInput,
  type PartnerServiceSubmissionInput,
} from '../utils/localDirectory';
import {
  buildWidgetEntranceTransition,
  DASHBOARD_VIEWPORT_CONFIG,
  SUBTLE_ENTRANCE_INITIAL,
  SUBTLE_ENTRANCE_VISIBLE,
} from '../utils/motionPresets';

interface CategoryServiceFormProps {
  initialCategory: PartnerCategory;
  initialBusinessName: string;
  initialPhone: string;
  onPublishRecord: (
    result: ReturnType<typeof createServiceItemRecord>
  ) => { detailKind: 'resort' | 'service'; id: string };
  onOpenPublishedDetail: (
    target: { kind: 'resort'; id: string } | ServiceDetailSelection
  ) => void;
}

const WAYANAD_TOURIST_SPOTS = [
  '900 Kandi Glass Bridge',
  'Banasura Sagar Dam',
  'Chembra Peak Trail',
  'Edakkal Caves',
  'Soochipara Waterfalls',
  'Pookode Lake',
  'Kuruvadweep Island',
  'Muthanga Wildlife Sanctuary',
];

const TOUR_VEHICLES = [
  'Mahindra Thar / 4x4 Jeep',
  'Toyota Innova Crysta',
  'Tempo Traveller AC',
  'AC Sedan (Etios / Dzire)',
];

const HOTEL_BED_TYPES = [
  'Double / Queen Bed',
  'Twin Beds',
  'King Suite Bed',
  'Family Quad (2 Doubles)',
];

const RESTAURANT_COURSES = [
  'Main Course',
  'Biriyani & Rice',
  'Starter',
  'Breakfast',
  'Beverage & Dessert',
];

const DEFAULT_ITEMS_BY_CATEGORY: Record<PartnerCategory, ServiceLineItem[]> = {
  resort: [
    {
      id: 'init-rs1',
      name: 'Poolfront Rainforest Villa',
      detail: 'Complimentary Malabar breakfast & evening campfire access',
      priceInr: 5800,
    },
  ],
  budget_hotel: [
    {
      id: 'init-bh1',
      name: 'Standard Double Hillside Room',
      detail: 'Queen bed, Wi-Fi & 24h hot water',
      priceInr: 1250,
      acType: 'Non-A/C',
      bedType: 'Double / Queen Bed',
      maxGuests: 2,
      availableUnits: 4,
    },
    {
      id: 'init-bh2',
      name: 'Deluxe AC Family Room',
      detail: 'Split AC, mountain view balcony & free parking',
      priceInr: 1850,
      acType: 'A/C',
      bedType: 'Family Quad (2 Doubles)',
      maxGuests: 4,
      availableUnits: 3,
    },
  ],
  restaurant: [
    {
      id: 'init-r1',
      name: 'Wayanad Sadya Banana-Leaf Meal',
      detail: 'Matta rice with 9 traditional sides & payasam',
      priceInr: 220,
      itemCategory: 'Main Course',
      dietaryType: 'Veg',
    },
    {
      id: 'init-r2',
      name: 'Malabar Clay-Pot Chicken Curry & Parotta',
      detail: 'Slow-cooked Wayanad pepper spice gravy with 2 parottas',
      priceInr: 310,
      itemCategory: 'Main Course',
      dietaryType: 'Non-Veg',
    },
  ],
  tour: [
    {
      id: 'init-t1',
      name: '900 Kandi & Tea Ridge 4x4 Safari',
      detail: '3.5-hour off-road jeep ride for up to 6 guests',
      priceInr: 2400,
      vehicleType: 'Mahindra Thar / 4x4 Jeep',
      seatingCapacity: 6,
      duration: '3.5 Hours',
      coveredSpots: ['900 Kandi Glass Bridge', 'Soochipara Waterfalls'],
    },
  ],
  events: [
    {
      id: 'init-ev1',
      name: 'General Visitor Entry Ticket',
      detail: 'Full-day ground entry & evening cultural stage access',
      priceInr: 150,
      passKind: 'Ticket',
      availableInventory: 300,
      slotTiming: '9:00 AM – 9:00 PM',
    },
    {
      id: 'init-ev2',
      name: '10×10 ft Exhibitor / Food Stall',
      detail: 'Covered timber stall with lighting & 2 exhibitor passes',
      priceInr: 4500,
      passKind: 'Stall',
      availableInventory: 12,
      slotTiming: 'Full Event Dates',
    },
  ],
};

export function CategoryServiceForm({
  initialCategory,
  initialBusinessName,
  initialPhone,
  onPublishRecord,
  onOpenPublishedDetail,
}: CategoryServiceFormProps) {
  const [category, setCategory] = useState<PartnerCategory>(initialCategory);
  const [name, setName] = useState(initialBusinessName);
  const [townOrLocation, setTownOrLocation] = useState('Vythiri');
  const [headlineMetric, setHeadlineMetric] = useState(
    initialCategory === 'events'
      ? 150
      : initialCategory === 'restaurant'
        ? 480
        : initialCategory === 'budget_hotel'
          ? 1250
          : initialCategory === 'tour'
            ? 2400
            : 5600
  );
  const [secondaryTag, setSecondaryTag] = useState('Direct Wayanad Experience');
  const [secondaryMeta, setSecondaryMeta] = useState(
    initialCategory === 'restaurant'
      ? '11:00 AM – 10:00 PM'
      : initialCategory === 'events'
        ? 'Jan 10 – Jan 20 · Festival Week'
        : initialCategory === 'tour'
          ? 'Half-day 4x4 Safari'
          : '1.5 km from Banasura Sagar Dam'
  );
  const [offerBadge, setOfferBadge] = useState(
    'Direct Booking Special · Zero Commission'
  );
  const [description, setDescription] = useState(
    'Welcoming travelers across Wayanad with verified rates, instant WhatsApp confirmation, and direct UPI booking.'
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    initialPhone || '919847055123'
  );
  const [upiId, setUpiId] = useState('wayngongo@okicici');
  const [imageUrl, setImageUrl] = useState(
    initialCategory === 'resort'
      ? GENERATED_BANNER_PRESETS[0].url
      : CATEGORY_IMAGE_PRESETS[initialCategory][0].url
  );
  const [mapUrl, setMapUrl] = useState('');
  const [mapCoordinates, setMapCoordinates] = useState('');

  // Category-specific controls
  const [restaurantSeating, setRestaurantSeating] = useState(48);
  const [hotelCheckInPolicy, setHotelCheckInPolicy] = useState(
    '12:00 PM Check-in · 24h Front Desk'
  );
  const [tourVehicleType, setTourVehicleType] = useState(TOUR_VEHICLES[0]);
  const [tourSeatingCapacity, setTourSeatingCapacity] = useState(6);
  const [tourCoveredSpots, setTourCoveredSpots] = useState<string[]>([
    '900 Kandi Glass Bridge',
    'Banasura Sagar Dam',
    'Soochipara Waterfalls',
  ]);
  const [eventVenue, setEventVenue] = useState('Kalpetta Festival Grounds');
  const [eventDates, setEventDates] = useState('Jan 10 – Jan 20');
  const [eventEntryTime, setEventEntryTime] = useState('9:00 AM – 9:30 PM');
  const [availableTickets, setAvailableTickets] = useState(300);
  const [availableStalls, setAvailableStalls] = useState(12);
  const [stallPriceInr, setStallPriceInr] = useState(4500);

  const [serviceItems, setServiceItems] = useState<ServiceLineItem[]>(
    DEFAULT_ITEMS_BY_CATEGORY[initialCategory]
  );

  // Add item builder
  const [newItemName, setNewItemName] = useState('');
  const [newItemDetail, setNewItemDetail] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(250);
  const [newItemDietary, setNewItemDietary] = useState<'Veg' | 'Non-Veg'>('Veg');
  const [newItemCourse, setNewItemCourse] = useState(RESTAURANT_COURSES[0]);
  const [newRoomAcType, setNewRoomAcType] = useState<'A/C' | 'Non-A/C'>('A/C');
  const [newRoomBedType, setNewRoomBedType] = useState(HOTEL_BED_TYPES[0]);
  const [newPassKind, setNewPassKind] = useState<'Ticket' | 'Stall'>('Ticket');
  const [newInventory, setNewInventory] = useState(100);

  const [formError, setFormError] = useState<string | null>(null);
  const [publishedTarget, setPublishedTarget] = useState<{
    name: string;
    target: { kind: 'resort'; id: string } | ServiceDetailSelection;
  } | null>(null);

  useEffect(() => {
    setCategory(initialCategory);
    setServiceItems(DEFAULT_ITEMS_BY_CATEGORY[initialCategory]);
    setImageUrl(
      initialCategory === 'resort'
        ? GENERATED_BANNER_PRESETS[0].url
        : CATEGORY_IMAGE_PRESETS[initialCategory][0].url
    );
  }, [initialCategory]);

  useEffect(() => {
    if (initialBusinessName) setName(initialBusinessName);
  }, [initialBusinessName]);

  const handleCategorySwitch = (nextCat: PartnerCategory) => {
    setCategory(nextCat);
    setFormError(null);
    setPublishedTarget(null);
    setServiceItems(DEFAULT_ITEMS_BY_CATEGORY[nextCat]);
    if (nextCat === 'resort') {
      setHeadlineMetric(5600);
      setSecondaryMeta('1.5 km from Banasura Sagar Dam');
      setImageUrl(GENERATED_BANNER_PRESETS[0].url);
    } else if (nextCat === 'budget_hotel') {
      setHeadlineMetric(1250);
      setSecondaryMeta('24-Hour Check-in');
      setImageUrl(CATEGORY_IMAGE_PRESETS.budget_hotel[0].url);
    } else if (nextCat === 'restaurant') {
      setHeadlineMetric(480);
      setSecondaryMeta('11:00 AM – 10:00 PM');
      setImageUrl(CATEGORY_IMAGE_PRESETS.restaurant[0].url);
    } else if (nextCat === 'tour') {
      setHeadlineMetric(2400);
      setSecondaryMeta('Half-day 4x4 Safari');
      setImageUrl(CATEGORY_IMAGE_PRESETS.tour[0].url);
    } else {
      setHeadlineMetric(150);
      setSecondaryMeta('9:00 AM – 9:30 PM');
      setImageUrl(CATEGORY_IMAGE_PRESETS.events[0].url);
    }
  };

  const handleAddItem = () => {
    if (!newItemName.trim() || newItemPrice <= 0) return;
    const item: ServiceLineItem = {
      id: `item-${Date.now()}`,
      name: newItemName.trim(),
      detail: newItemDetail.trim() || 'Direct Wayngongo booking rate',
      priceInr: Math.round(newItemPrice),
      ...(category === 'restaurant'
        ? { itemCategory: newItemCourse, dietaryType: newItemDietary }
        : {}),
      ...(category === 'budget_hotel'
        ? { acType: newRoomAcType, bedType: newRoomBedType }
        : {}),
      ...(category === 'tour'
        ? {
            vehicleType: tourVehicleType,
            seatingCapacity: tourSeatingCapacity,
            coveredSpots: tourCoveredSpots,
          }
        : {}),
      ...(category === 'events'
        ? {
            passKind: newPassKind,
            availableInventory: newInventory,
            slotTiming: eventEntryTime,
          }
        : {}),
    };
    setServiceItems((prev) => [...prev, item]);
    setNewItemName('');
    setNewItemDetail('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const payload: PartnerServiceSubmissionInput = {
      category,
      name,
      townOrLocation,
      headlineMetric,
      secondaryTag,
      secondaryMeta,
      description,
      whatsappNumber,
      upiId,
      imageUrl,
      offerBadge,
      serviceItems,
      mapUrl,
      mapCoordinates,
      ...(category === 'restaurant' ? { restaurantSeating } : {}),
      ...(category === 'budget_hotel' ? { hotelCheckInPolicy } : {}),
      ...(category === 'tour'
        ? {
            tourVehicleType,
            tourSeatingCapacity,
            tourCoveredSpots,
          }
        : {}),
      ...(category === 'events'
        ? {
            eventVenue,
            eventDates,
            eventEntryTime,
            availableTickets,
            availableStalls,
            stallPriceInr,
          }
        : {}),
    };

    const validation = validatePartnerServiceInput(payload);
    if (!validation.valid) {
      setFormError(validation.error ?? 'Please complete all required fields.');
      return;
    }

    const record = createServiceItemRecord(payload, String(Date.now()).slice(-4));
    const published = onPublishRecord(record);
    const target: { kind: 'resort'; id: string } | ServiceDetailSelection =
      published.detailKind === 'resort'
        ? { kind: 'resort', id: published.id }
        : {
            kind: category === 'events' ? 'event' : (category as 'restaurant' | 'budget_hotel' | 'tour'),
            id: published.id,
          };

    setPublishedTarget({ name: name.trim(), target });
  };

  const imagePresets =
    category === 'resort'
      ? GENERATED_BANNER_PRESETS
      : CATEGORY_IMAGE_PRESETS[category];

  return (
    <motion.section
      id="dynamic-service-form-section"
      data-testid="dynamic-category-service-form"
      aria-labelledby="dynamic-service-form-heading"
      initial={SUBTLE_ENTRANCE_INITIAL}
      whileInView={SUBTLE_ENTRANCE_VISIBLE}
      viewport={DASHBOARD_VIEWPORT_CONFIG}
      transition={buildWidgetEntranceTransition(1)}
      className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold text-[#065F46]">
            Dynamic Category Listing Builder
          </span>
          <h2 id="dynamic-service-form-heading" className="text-lg font-bold text-slate-900 mt-0.5">
            {category === 'resort' && 'Resort Room Tariff & Stay Details'}
            {category === 'budget_hotel' && 'Budget Hotel Rooms (A/C & Non-A/C) & Policy'}
            {category === 'restaurant' && 'Restaurant Menu, Dishes & Dining Hours'}
            {category === 'tour' && 'Jeep / Tour Package, Vehicle & Tourist Spots'}
            {category === 'events' && 'Event Tickets, Fest Dates & Stall Inventory'}
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Fields below adapt automatically to your chosen business category and publish straight to Wayngongo.
          </p>
        </div>

        {/* Category Pill Switcher */}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Switch category form">
          {PARTNER_CATEGORY_OPTIONS.map((opt) => {
            const active = category === opt.id;
            const Icon =
              opt.id === 'resort'
                ? Trees
                : opt.id === 'budget_hotel'
                  ? BedDouble
                  : opt.id === 'restaurant'
                    ? Utensils
                    : opt.id === 'tour'
                      ? Compass
                      : Ticket;
            return (
              <button
                key={opt.id}
                type="button"
                data-testid={`dashboard-cat-btn-${opt.id}`}
                onClick={() => handleCategorySwitch(opt.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#065F46] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dyn-name" className="block text-xs font-semibold text-slate-700 mb-1">
              Business / Listing Name
            </label>
            <input
              id="dyn-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-[#065F46]"
            />
          </div>

          <div>
            <label htmlFor="dyn-town" className="block text-xs font-semibold text-slate-700 mb-1">
              Wayanad Town / Region
            </label>
            <select
              id="dyn-town"
              value={townOrLocation}
              onChange={(e) => setTownOrLocation(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-[#065F46] cursor-pointer"
            >
              <option value="Vythiri">Vythiri</option>
              <option value="Kalpetta">Kalpetta</option>
              <option value="Meppadi">Meppadi</option>
              <option value="Sultan Bathery">Sultan Bathery</option>
              <option value="Mananthavady">Mananthavady</option>
              <option value="Thirunelli">Thirunelli</option>
            </select>
          </div>

          <div>
            <label htmlFor="dyn-price" className="block text-xs font-semibold text-slate-700 mb-1">
              {category === 'resort'
                ? 'Room Tariff (₹ / night)'
                : category === 'budget_hotel'
                  ? 'Starting Room Rate (₹ / night)'
                  : category === 'restaurant'
                    ? 'Average Cost for Two (₹)'
                    : category === 'tour'
                      ? 'Tour Package Starting Price (₹)'
                      : 'Visitor Entry Ticket Price (₹)'}
            </label>
            <input
              id="dyn-price"
              type="number"
              min={50}
              step={50}
              value={headlineMetric}
              onChange={(e) => setHeadlineMetric(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-2 focus:outline-[#065F46]"
            />
          </div>

          <div>
            <label htmlFor="dyn-meta" className="block text-xs font-semibold text-slate-700 mb-1">
              {category === 'restaurant'
                ? 'Dining Hours'
                : category === 'events'
                  ? 'Entry Timing Hours'
                  : category === 'tour'
                    ? 'Tour Duration'
                    : category === 'budget_hotel'
                      ? 'Check-in / Parking Note'
                      : 'Distance from Wayanad Landmark'}
            </label>
            <input
              id="dyn-meta"
              type="text"
              value={secondaryMeta}
              onChange={(e) => setSecondaryMeta(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-[#065F46]"
            />
          </div>

          {/* Category-Specific Dynamic Fields */}
          {category === 'restaurant' && (
            <>
              <div>
                <label htmlFor="dyn-cuisine" className="block text-xs font-semibold text-slate-700 mb-1">
                  Signature Cuisine / Specialty
                </label>
                <input
                  id="dyn-cuisine"
                  type="text"
                  value={secondaryTag}
                  onChange={(e) => setSecondaryTag(e.target.value)}
                  placeholder="Kerala sadya, bamboo biriyani & seafood"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-[#065F46]"
                />
              </div>
              <div>
                <label htmlFor="dyn-seating" className="block text-xs font-semibold text-slate-700 mb-1">
                  Dining Seating Capacity (Guests)
                </label>
                <input
                  id="dyn-seating"
                  type="number"
                  min={8}
                  value={restaurantSeating}
                  onChange={(e) => setRestaurantSeating(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-2 focus:outline-[#065F46]"
                />
              </div>
            </>
          )}

          {category === 'budget_hotel' && (
            <div className="md:col-span-2">
              <label htmlFor="dyn-checkin" className="block text-xs font-semibold text-slate-700 mb-1">
                Check-in Policy &amp; Guest Rules
              </label>
              <input
                id="dyn-checkin"
                type="text"
                value={hotelCheckInPolicy}
                onChange={(e) => setHotelCheckInPolicy(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-[#065F46]"
              />
            </div>
          )}

          {category === 'tour' && (
            <>
              <div>
                <label htmlFor="dyn-vehicle" className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle Type
                </label>
                <select
                  id="dyn-vehicle"
                  value={tourVehicleType}
                  onChange={(e) => setTourVehicleType(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-[#065F46] cursor-pointer"
                >
                  {TOUR_VEHICLES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="dyn-seats" className="block text-xs font-semibold text-slate-700 mb-1">
                  Seating Capacity
                </label>
                <input
                  id="dyn-seats"
                  type="number"
                  min={1}
                  max={30}
                  value={tourSeatingCapacity}
                  onChange={(e) => setTourSeatingCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-2 focus:outline-[#065F46]"
                />
              </div>
              <div className="md:col-span-2">
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Covered Wayanad Tourist Spots
                </span>
                <div className="flex flex-wrap gap-2">
                  {WAYANAD_TOURIST_SPOTS.map((spot) => {
                    const checked = tourCoveredSpots.includes(spot);
                    return (
                      <button
                        key={spot}
                        type="button"
                        onClick={() =>
                          setTourCoveredSpots((prev) =>
                            prev.includes(spot)
                              ? prev.filter((s) => s !== spot)
                              : [...prev, spot]
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                          checked
                            ? 'bg-[#D1FAE5] border-[#065F46] text-[#065F46]'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {spot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {category === 'events' && (
            <>
              <div>
                <label htmlFor="dyn-event-venue" className="block text-xs font-semibold text-slate-700 mb-1">
                  Festival / Event Venue
                </label>
                <input
                  id="dyn-event-venue"
                  type="text"
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                  placeholder="e.g. RARS Ambalavayal Grounds"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-[#065F46]"
                />
              </div>
              <div>
                <label htmlFor="dyn-event-dates" className="block text-xs font-semibold text-slate-700 mb-1">
                  Event Dates
                </label>
                <input
                  id="dyn-event-dates"
                  type="text"
                  value={eventDates}
                  onChange={(e) => setEventDates(e.target.value)}
                  placeholder="e.g. Jan 01 – Jan 18"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-[#065F46]"
                />
              </div>
              <div className="grid grid-cols-3 gap-2.5 md:col-span-2">
                <div>
                  <label htmlFor="dyn-tickets-count" className="block text-xs font-semibold text-slate-700 mb-1">
                    Tickets Available
                  </label>
                  <input
                    id="dyn-tickets-count"
                    type="number"
                    min={10}
                    value={availableTickets}
                    onChange={(e) => setAvailableTickets(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-2 focus:outline-[#065F46]"
                  />
                </div>
                <div>
                  <label htmlFor="dyn-stalls-count" className="block text-xs font-semibold text-slate-700 mb-1">
                    Stalls Available
                  </label>
                  <input
                    id="dyn-stalls-count"
                    type="number"
                    min={0}
                    value={availableStalls}
                    onChange={(e) => setAvailableStalls(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-2 focus:outline-[#065F46]"
                  />
                </div>
                <div>
                  <label htmlFor="dyn-stall-price" className="block text-xs font-semibold text-slate-700 mb-1">
                    Stall Tariff (₹)
                  </label>
                  <input
                    id="dyn-stall-price"
                    type="number"
                    min={500}
                    step={250}
                    value={stallPriceInr}
                    onChange={(e) => setStallPriceInr(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-2 focus:outline-[#065F46]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="dyn-whatsapp" className="block text-xs font-semibold text-slate-700 mb-1">
              Direct WhatsApp Number
            </label>
            <input
              id="dyn-whatsapp"
              type="tel"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 tabular-nums focus:outline-2 focus:outline-[#065F46]"
            />
          </div>

          <div>
            <label htmlFor="dyn-upi" className="block text-xs font-semibold text-slate-700 mb-1">
              Direct UPI ID
            </label>
            <input
              id="dyn-upi"
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-2 focus:outline-[#065F46]"
            />
          </div>

          <div>
            <label htmlFor="dyn-offer" className="block text-xs font-semibold text-slate-700 mb-1">
              Highlight Deal / Free Offer Badge
            </label>
            <input
              id="dyn-offer"
              type="text"
              value={offerBadge}
              onChange={(e) => setOfferBadge(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-amber-50/70 border border-amber-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-amber-600"
            />
          </div>

          <div>
            <label htmlFor="dyn-photo" className="block text-xs font-semibold text-slate-700 mb-1">
              Cover Photo Preset
            </label>
            <select
              id="dyn-photo"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-[#065F46] cursor-pointer"
            >
              {imagePresets.map((p) => (
                <option key={p.url} value={p.url}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="dyn-desc" className="block text-xs font-semibold text-slate-700 mb-1">
              Listing Description (Shown on Detail Page)
            </label>
            <textarea
              id="dyn-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-2 focus:outline-[#065F46]"
            />
          </div>

          {/* Owner-End Location Map Pin (Hidden from public visitors) */}
          <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <MapPin className="w-4 h-4 text-[#065F46]" aria-hidden="true" />
                <span>Owner Location Map Pin (Private · For Verification Only)</span>
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="url"
                aria-label="Google Maps Pin Link"
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
                placeholder="https://maps.google.com/?q=11.6854,76.1320"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-2 focus:outline-[#065F46]"
              />
              <input
                type="text"
                aria-label="Latitude and Longitude"
                value={mapCoordinates}
                onChange={(e) => setMapCoordinates(e.target.value)}
                placeholder="11.6854, 76.1320"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-2 focus:outline-[#065F46]"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Service Items / Rooms / Menu / Passes Builder */}
        {category !== 'resort' && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              {category === 'restaurant'
                ? 'Menu Dishes & Meal Combos'
                : category === 'budget_hotel'
                  ? 'Room Types (A/C & Non-A/C) & Tariffs'
                  : category === 'events'
                    ? 'Ticket Tiers & Stall Inventory'
                    : 'Tour Packages'}
            </h3>

            <div className="space-y-2">
              {serviceItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {item.name}
                      {item.acType ? ` (${item.acType})` : ''}
                      {item.passKind ? ` [${item.passKind}]` : ''}
                    </p>
                    <p className="text-slate-500 truncate">{item.detail}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 tabular-nums">
                    <span className="font-bold text-slate-900">{formatInr(item.priceInr)}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${item.name}`}
                      onClick={() =>
                        setServiceItems((prev) => prev.filter((s) => s.id !== item.id))
                      }
                      className="text-slate-400 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Inline Quick-Add Row */}
            <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1.4fr_0.8fr_auto] gap-2 pt-2 border-t border-slate-200/80">
              <input
                type="text"
                aria-label="New service item name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={
                  category === 'restaurant'
                    ? 'Dish name (e.g. Bamboo Biriyani)'
                    : category === 'budget_hotel'
                      ? 'Room name (e.g. Deluxe AC Double)'
                      : category === 'events'
                        ? 'Pass / Stall name (e.g. VIP Pass)'
                        : 'Package name'
                }
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
              />
              <input
                type="text"
                aria-label="New service item detail"
                value={newItemDetail}
                onChange={(e) => setNewItemDetail(e.target.value)}
                placeholder="Short detail or timing..."
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
              />
              <input
                type="number"
                aria-label="New service item price in INR"
                min={50}
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(Number(e.target.value))}
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 tabular-nums"
              />
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center justify-center gap-1 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Add</span>
              </button>
            </div>

            {category === 'restaurant' && (
              <div className="flex flex-wrap gap-2">
                <select
                  aria-label="Dish course"
                  value={newItemCourse}
                  onChange={(e) => setNewItemCourse(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                >
                  {RESTAURANT_COURSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Dietary option"
                  value={newItemDietary}
                  onChange={(e) => setNewItemDietary(e.target.value as 'Veg' | 'Non-Veg')}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                >
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                </select>
              </div>
            )}

            {category === 'budget_hotel' && (
              <div className="flex flex-wrap gap-2">
                <select
                  aria-label="Room cooling type"
                  value={newRoomAcType}
                  onChange={(e) => setNewRoomAcType(e.target.value as 'A/C' | 'Non-A/C')}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                >
                  <option value="A/C">A/C</option>
                  <option value="Non-A/C">Non-A/C</option>
                </select>
                <select
                  aria-label="Room bed type"
                  value={newRoomBedType}
                  onChange={(e) => setNewRoomBedType(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                >
                  {HOTEL_BED_TYPES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {category === 'events' && (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Pass or stall type"
                  value={newPassKind}
                  onChange={(e) => setNewPassKind(e.target.value as 'Ticket' | 'Stall')}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                >
                  <option value="Ticket">Visitor Entry Ticket</option>
                  <option value="Stall">Exhibitor / Food Stall</option>
                </select>
                <input
                  type="number"
                  aria-label="Available inventory"
                  min={1}
                  value={newInventory}
                  onChange={(e) => setNewInventory(Number(e.target.value))}
                  className="w-28 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg tabular-nums"
                />
                <span className="text-[11px] text-slate-500">available units</span>
              </div>
            )}
          </div>
        )}

        {formError && (
          <p role="alert" className="text-xs font-semibold text-red-700">
            {formError}
          </p>
        )}

        {publishedTarget && (
          <div
            role="status"
            data-testid="partner-publish-success"
            className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-900"
          >
            <span className="inline-flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              <span>&ldquo;{publishedTarget.name}&rdquo; is now live on Wayngongo!</span>
            </span>
            <button
              type="button"
              onClick={() => onOpenPublishedDetail(publishedTarget.target)}
              className="px-3 py-1.5 rounded-lg bg-[#065F46] text-white font-semibold hover:bg-[#044E3A] cursor-pointer"
            >
              Open Live Detail Page →
            </button>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            data-testid="publish-category-listing-btn"
            className="px-5 py-2.5 rounded-xl bg-[#065F46] hover:bg-[#044E3A] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            Save &amp; Publish Listing Live
          </button>
        </div>
      </form>
    </motion.section>
  );
}
