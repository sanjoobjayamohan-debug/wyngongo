import type {
  BudgetHotel,
  EventTicketListing,
  LocalRestaurant,
  PartnerCategory,
  Resort,
  ServiceLineItem,
  TourOperator,
  WayanadLocation,
} from '../types/resort';
import { formatInr } from './adPricing';
import { formatDateShort } from './bookingDates';

export function buildTourBookingSummary(
  operator: TourOperator,
  tourDate: string,
  guests: number,
  pickupNote: string,
  unitPriceInr?: number
): {
  estimatedTotalInr: number;
  whatsappText: string;
  whatsappHref: string;
} {
  const safeGuests = Math.max(1, Math.min(12, Math.floor(guests || 1)));
  const baseRate = unitPriceInr ?? operator.startingPriceInr;
  const estimatedTotalInr = baseRate * Math.ceil(safeGuests / 4);
  const formattedDate = formatDateShort(tourDate);
  const trimmedNote = pickupNote.trim();

  const whatsappText = `Hi ${operator.name}, I found you on Wayngongo. I'd like to book "${operator.services}" on ${formattedDate} for ${safeGuests} guest(s) (est. ${formatInr(
    estimatedTotalInr
  )}).${trimmedNote ? ` Pickup / Note: ${trimmedNote}` : ''}`;

  return {
    estimatedTotalInr,
    whatsappText,
    whatsappHref: `https://wa.me/${operator.whatsappNumber}?text=${encodeURIComponent(
      whatsappText
    )}`,
  };
}

export function buildBudgetHotelSummary(
  hotel: BudgetHotel,
  checkInDate: string,
  nights: number,
  unitPriceInr?: number
): {
  estimatedTotalInr: number;
  whatsappText: string;
  whatsappHref: string;
} {
  const safeNights = Math.max(1, Math.min(14, Math.floor(nights || 1)));
  const nightlyRate = unitPriceInr ?? hotel.priceFromInr;
  const estimatedTotalInr = nightlyRate * safeNights;
  const formattedDate = formatDateShort(checkInDate);

  const whatsappText = `Hi ${hotel.name} (${hotel.town}), I'd like to check room availability from ${formattedDate} for ${safeNights} night(s) at your Wayngongo rate (${formatInr(
    nightlyRate
  )}/night).`;

  return {
    estimatedTotalInr,
    whatsappText,
    whatsappHref: `https://wa.me/${hotel.whatsappNumber}?text=${encodeURIComponent(
      whatsappText
    )}`,
  };
}

export function buildRestaurantInquiryHref(
  restaurant: LocalRestaurant,
  visitDate?: string,
  guests?: number,
  mealSlot?: string
): string {
  const detailText =
    visitDate && guests
      ? ` for ${guests} guest(s) on ${formatDateShort(visitDate)}${mealSlot ? ` (${mealSlot})` : ''}`
      : '';
  const text = `Hi ${restaurant.name} (${restaurant.town}), I found you on Wayngongo and would like to reserve a table${detailText} for ${restaurant.specialty}.`;
  return `https://wa.me/${restaurant.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function buildEventBookingSummary(
  eventListing: EventTicketListing,
  eventDate: string,
  quantity: number,
  selectedPassName: string,
  unitPriceInr?: number,
  guestName?: string
): {
  estimatedTotalInr: number;
  whatsappText: string;
  whatsappHref: string;
} {
  const safeQty = Math.max(1, Math.min(20, Math.floor(quantity || 1)));
  const unitPrice = unitPriceInr ?? eventListing.ticketPriceInr;
  const estimatedTotalInr = unitPrice * safeQty;
  const formattedDate = formatDateShort(eventDate);
  const trimmedGuest = guestName?.trim();

  const whatsappText = `Hi ${eventListing.name} Desk, I found your event on Wayngongo. I'd like to book ${safeQty} × "${selectedPassName}" for ${formattedDate} at ${eventListing.venue} (Total: ${formatInr(
    estimatedTotalInr
  )}).${trimmedGuest ? ` Name: ${trimmedGuest}` : ''}`;

  return {
    estimatedTotalInr,
    whatsappText,
    whatsappHref: `https://wa.me/${eventListing.whatsappNumber}?text=${encodeURIComponent(
      whatsappText
    )}`,
  };
}

export interface PartnerServiceSubmissionInput {
  category: PartnerCategory;
  name: string;
  townOrLocation: string;
  headlineMetric: number;
  secondaryTag: string;
  secondaryMeta: string;
  description: string;
  whatsappNumber: string;
  upiId: string;
  imageUrl: string;
  offerBadge: string;
  serviceItems: ServiceLineItem[];
  // Owner-end only map pin & coordinates
  mapUrl?: string;
  mapCoordinates?: string;
  // Category-specific full-control fields
  restaurantSeating?: number;
  hotelCheckInPolicy?: string;
  tourCategory?: string;
  tourVehicleType?: string;
  tourSeatingCapacity?: number;
  tourCoveredSpots?: string[];
  tourPickupMode?: string;
  tourGuideLanguages?: string;
  tourOperationalInclusions?: string[];
  resortAmenities?: import('../types/resort').AmenityKey[];
  resortMaxAmenitiesVisible?: number;
  resortVideoLabel?: string;
  // Event ticket & stall fields
  eventVenue?: string;
  eventDates?: string;
  eventEntryTime?: string;
  availableTickets?: number;
  availableStalls?: number;
  stallPriceInr?: number;
}

export function validatePartnerServiceInput(
  input: PartnerServiceSubmissionInput
): { valid: boolean; error?: string } {
  if (!input.name.trim()) {
    return { valid: false, error: 'Please enter the business or listing name.' };
  }
  if (!input.townOrLocation.trim()) {
    return { valid: false, error: 'Please enter the Wayanad town or region.' };
  }
  if (!Number.isFinite(input.headlineMetric) || input.headlineMetric <= 0) {
    return { valid: false, error: 'Please enter a valid price in INR.' };
  }
  if (!input.description.trim() || input.description.trim().length < 15) {
    return {
      valid: false,
      error: 'Please enter a concise description (at least 15 characters).',
    };
  }
  if (input.category === 'tour' && (!input.tourCoveredSpots || input.tourCoveredSpots.length === 0)) {
    return {
      valid: false,
      error: 'Please select or add at least 1 Wayanad tourist spot covered by this tour.',
    };
  }
  if (input.category !== 'resort' && input.serviceItems.length === 0) {
    return {
      valid: false,
      error: 'Please include at least 1 service item, pass, or package for this category.',
    };
  }
  return { valid: true };
}

const REGION_MATCHES: Exclude<WayanadLocation, 'All Wayanad'>[] = [
  'Vythiri',
  'Mananthavady',
  'Meppadi',
  'Sultan Bathery',
  'Thirunelli',
];

function matchRegion(town: string): Exclude<WayanadLocation, 'All Wayanad'> | undefined {
  return REGION_MATCHES.find((r) => r.toLowerCase() === town.trim().toLowerCase());
}

export function createServiceItemRecord(
  input: PartnerServiceSubmissionInput,
  idSuffix: string
):
  | { kind: 'restaurant'; record: LocalRestaurant }
  | { kind: 'budget_hotel'; record: BudgetHotel }
  | { kind: 'tour'; record: TourOperator }
  | { kind: 'event'; record: EventTicketListing }
  | { kind: 'resort'; record: Resort } {
  const slug = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const id = `${slug || 'listing'}-${idSuffix}`;
  const cleanPhone = input.whatsappNumber.replace(/\D/g, '') || '919847000111';
  const region = matchRegion(input.townOrLocation);
  const cleanMapUrl = input.mapUrl?.trim() || undefined;
  const cleanMapCoordinates = input.mapCoordinates?.trim() || undefined;

  if (input.category === 'restaurant') {
    return {
      kind: 'restaurant',
      record: {
        id,
        name: input.name.trim(),
        town: input.townOrLocation.trim(),
        regionFilter: region,
        specialty: input.secondaryTag.trim() || 'Kerala meals',
        hours: input.secondaryMeta.trim() || '11:00 AM – 10:00 PM',
        avgForTwoInr: Math.round(input.headlineMetric),
        seatingCapacity: input.restaurantSeating,
        whatsappNumber: cleanPhone,
        description: input.description.trim(),
        primaryImage: input.imageUrl,
        galleryImages: [input.imageUrl, input.imageUrl, input.imageUrl, input.imageUrl],
        offerBadge: input.offerBadge.trim() || 'Direct Table Reservation Included',
        rating: 4.9,
        reviewCount: 1,
        highlights: input.serviceItems.map((s) => s.name).slice(0, 4),
        serviceItems: input.serviceItems,
        mapUrl: cleanMapUrl,
        mapCoordinates: cleanMapCoordinates,
        faqs: [
          {
            question: `Where is ${input.name.trim()} located in ${input.townOrLocation.trim()}?`,
            answer: `Located in ${input.townOrLocation.trim()}, Wayanad. Open ${
              input.secondaryMeta.trim() || '11:00 AM – 10:00 PM'
            } for dine-in and direct WhatsApp table bookings.`,
          },
        ],
      },
    };
  }

  if (input.category === 'budget_hotel') {
    const hasAc = input.serviceItems.some((item) => item.acType === 'A/C');
    const hasNonAc = input.serviceItems.some((item) => item.acType === 'Non-A/C');
    const climateSummary =
      hasAc && hasNonAc ? 'A/C & Non-A/C Rooms Available' : hasAc ? 'A/C Rooms Available' : 'Well-Ventilated Non-A/C Rooms';

    return {
      kind: 'budget_hotel',
      record: {
        id,
        name: input.name.trim(),
        town: input.townOrLocation.trim(),
        regionFilter: region,
        priceFromInr: Math.round(input.headlineMetric),
        roomSummary: input.secondaryTag.trim() || climateSummary,
        checkInPolicy: input.hotelCheckInPolicy?.trim() || '24-Hour Check-in',
        whatsappNumber: cleanPhone,
        upiId: input.upiId.trim() || 'wayngongo@okicici',
        description: input.description.trim(),
        primaryImage: input.imageUrl,
        galleryImages: [input.imageUrl, input.imageUrl, input.imageUrl, input.imageUrl],
        offerBadge: input.offerBadge.trim() || 'Zero OTA Markup · Direct Owner Rate',
        rating: 4.8,
        reviewCount: 1,
        highlights: [
          climateSummary,
          input.hotelCheckInPolicy?.trim() || '24-Hour Front Desk',
          'High-Speed Wi-Fi',
          'Free Guest Parking',
        ],
        serviceItems: input.serviceItems,
        mapUrl: cleanMapUrl,
        mapCoordinates: cleanMapCoordinates,
        faqs: [
          {
            question: `What room categories are available at ${input.name.trim()}?`,
            answer: `We offer ${input.serviceItems
              .map((r) => `${r.name}${r.acType ? ` (${r.acType})` : ''}`)
              .join(', ')} starting from ${formatInr(Math.round(input.headlineMetric))}/night.`,
          },
        ],
      },
    };
  }

  if (input.category === 'tour') {
    const spots = input.tourCoveredSpots?.filter((s) => s.trim().length > 0) ?? [];
    const operational = input.tourOperationalInclusions?.filter((s) => s.trim().length > 0) ?? [];
    const combinedInclusions = [
      ...(input.tourVehicleType ? [`Vehicle: ${input.tourVehicleType}`] : []),
      ...(input.tourSeatingCapacity ? [`Up to ${input.tourSeatingCapacity} Seats`] : []),
      ...operational,
      ...input.serviceItems.map((s) => s.name),
    ].slice(0, 6);

    return {
      kind: 'tour',
      record: {
        id,
        name: input.name.trim(),
        services:
          input.secondaryTag.trim() ||
          input.tourCategory?.trim() ||
          'Sightseeing · Jeep rides',
        startingPriceInr: Math.round(input.headlineMetric),
        duration: input.secondaryMeta.trim() || 'Half-day Guided Circuit',
        highlights:
          spots.length > 0
            ? `Covers: ${spots.join(', ')}`
            : input.description.trim(),
        tourCategory: input.tourCategory?.trim() || undefined,
        vehicleType: input.tourVehicleType?.trim() || undefined,
        seatingCapacity: input.tourSeatingCapacity,
        coveredSpots: spots,
        pickupMode: input.tourPickupMode?.trim() || undefined,
        guideLanguages: input.tourGuideLanguages?.trim() || undefined,
        operationalInclusions: operational,
        whatsappNumber: cleanPhone,
        upiId: input.upiId.trim() || 'wayngongotours@okicici',
        description: input.description.trim(),
        primaryImage: input.imageUrl,
        galleryImages: [input.imageUrl, input.imageUrl, input.imageUrl, input.imageUrl],
        offerBadge: input.offerBadge.trim() || 'Resort Doorstep Pickup Included',
        rating: 4.9,
        reviewCount: 1,
        inclusions: combinedInclusions,
        serviceItems: input.serviceItems,
        mapUrl: cleanMapUrl,
        mapCoordinates: cleanMapCoordinates,
        faqs: [
          {
            question: `Which Wayanad tourist spots and vehicle options does ${input.name.trim()} cover?`,
            answer: `${
              input.tourVehicleType ? `${input.tourVehicleType} (${input.tourSeatingCapacity ?? 6} seats)` : 'Private tour vehicle'
            } covering ${spots.length > 0 ? spots.join(', ') : 'top Wayanad attractions'}.`,
          },
        ],
      },
    };
  }

  if (input.category === 'events') {
    const venue = input.eventVenue?.trim() || `${input.townOrLocation.trim()} Festival Grounds`;
    const eventDates = input.eventDates?.trim() || input.secondaryMeta.trim() || 'Upcoming Weekend';
    const entryTime = input.eventEntryTime?.trim() || '9:00 AM – 9:30 PM';
    const ticketCount = Math.max(10, Math.round(input.availableTickets ?? 250));
    const stallCount = Math.max(0, Math.round(input.availableStalls ?? 10));
    const stallPrice = Math.max(500, Math.round(input.stallPriceInr ?? 4500));

    return {
      kind: 'event',
      record: {
        id,
        name: input.name.trim(),
        venue,
        town: input.townOrLocation.trim(),
        regionFilter: region,
        eventDates,
        entryTime,
        ticketPriceInr: Math.round(input.headlineMetric),
        stallPriceInr: stallPrice,
        availableTickets: ticketCount,
        availableStalls: stallCount,
        whatsappNumber: cleanPhone,
        upiId: input.upiId.trim() || 'wayngongofest@okicici',
        description: input.description.trim(),
        primaryImage: input.imageUrl,
        galleryImages: [input.imageUrl, input.imageUrl, input.imageUrl, input.imageUrl],
        offerBadge: input.offerBadge.trim() || 'Instant QR Pass · Zero Convenience Fee',
        rating: 4.9,
        reviewCount: 1,
        highlights: [
          `${ticketCount} Tickets Available`,
          `${stallCount} Vendor Stalls Open`,
          entryTime,
          venue,
        ],
        serviceItems: input.serviceItems,
        mapUrl: cleanMapUrl,
        mapCoordinates: cleanMapCoordinates,
        faqs: [
          {
            question: `How do I book entry tickets or stalls for ${input.name.trim()}?`,
            answer: `Choose your entry pass or stall option and tap Book via WhatsApp or Pay via UPI for instant confirmation at ${venue}.`,
          },
        ],
      },
    };
  }

  return {
    kind: 'resort',
    record: {
      id,
      name: input.name.trim(),
      location: region ?? 'Vythiri',
      landmarkDistance: input.secondaryMeta.trim() || '2.0 km from Wayanad Viewpoint',
      pricePerNight: Math.round(input.headlineMetric),
      verified: true,
      offerPill: input.offerBadge.trim() || 'Direct Booking Deal: Breakfast Included',
      rating: 4.9,
      reviewCount: 1,
      hasVideoTour: Boolean(input.resortVideoLabel?.trim()),
      videoLabel: input.resortVideoLabel?.trim() || undefined,
      videoDuration: input.resortVideoLabel?.trim() ? '0:40' : undefined,
      primaryImage: input.imageUrl,
      imageAltText: `${input.name.trim()} in ${region ?? 'Vythiri'}, Wayanad`,
      galleryImages: [input.imageUrl, input.imageUrl, input.imageUrl, input.imageUrl],
      description: input.description.trim(),
      amenities:
        input.resortAmenities && input.resortAmenities.length > 0
          ? input.resortAmenities
          : ['pool', 'campfire', 'dining', 'wifi'],
      maxAmenitiesVisible: input.resortMaxAmenitiesVisible ?? 6,
      whatsappNumber: cleanPhone,
      upiId: input.upiId.trim() || 'wayngongoresort@okicici',
      directBookingUrl: `https://${slug || 'wayngongo'}.example.com/book`,
      mapUrl: cleanMapUrl,
      mapCoordinates: cleanMapCoordinates,
      faqs: [
        {
          question: `How do I claim the direct offer at ${input.name.trim()}?`,
          answer:
            'Select your check-in and check-out dates on the right to book directly via WhatsApp or UPI with zero OTA markup.',
        },
      ],
    },
  };
}
