export type WayanadLocation =
  | 'All Wayanad'
  | 'Vythiri'
  | 'Mananthavady'
  | 'Meppadi'
  | 'Sultan Bathery'
  | 'Thirunelli';

export type AppView =
  | 'directory'
  | 'detail'
  | 'service_detail'
  | 'dashboard'
  | 'login'
  | 'signup';

export type PartnerCategory =
  | 'resort'
  | 'budget_hotel'
  | 'restaurant'
  | 'tour'
  | 'events';

export type DirectoryCategoryTab = 'all' | PartnerCategory;

export type ServiceDetailSelection =
  | { kind: 'restaurant'; id: string }
  | { kind: 'budget_hotel'; id: string }
  | { kind: 'tour'; id: string }
  | { kind: 'event'; id: string };

export interface PartnerAccount {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  defaultCategory: PartnerCategory;
}

export interface ServiceLineItem {
  id: string;
  name: string;
  detail: string;
  priceInr: number;
  // Restaurant item fields
  itemCategory?: string;
  dietaryType?: 'Veg' | 'Non-Veg' | 'Vegan';
  // Budget hotel room fields
  acType?: 'A/C' | 'Non-A/C';
  bedType?: string;
  maxGuests?: number;
  availableUnits?: number;
  // Tour package fields
  vehicleType?: string;
  seatingCapacity?: number;
  coveredSpots?: string[];
  duration?: string;
  // Event ticket / stall fields
  passKind?: 'Ticket' | 'Stall';
  availableInventory?: number;
  slotTiming?: string;
}

export interface UserRatingEntry {
  id: string;
  authorName: string;
  stars: number;
  comment: string;
  createdAt: string;
}

export type AmenityKey =
  | 'pool'
  | 'campfire'
  | 'treehouse'
  | 'jeep_safari'
  | 'dining'
  | 'wifi'
  | 'ayurveda_spa'
  | 'waterfall_trek'
  | 'tea_estate_walk'
  | 'indoor_games'
  | 'bbq_grill'
  | 'bird_watching';

export interface ResortFAQ {
  question: string;
  answer: string;
}

export interface Resort {
  id: string;
  name: string;
  location: Exclude<WayanadLocation, 'All Wayanad'>;
  landmarkDistance: string;
  pricePerNight: number;
  verified: boolean;
  offerPill: string;
  rating: number;
  reviewCount: number;
  hasVideoTour: boolean;
  videoLabel?: string;
  videoDuration?: string;
  primaryImage: string;
  imageAltText?: string;
  galleryImages: string[];
  description: string;
  amenities: AmenityKey[];
  maxAmenitiesVisible?: number;
  whatsappNumber: string;
  upiId: string;
  directBookingUrl: string;
  // Owner-end only map pin & coordinates (not shown publicly to visitors)
  mapUrl?: string;
  mapCoordinates?: string;
  faqs: ResortFAQ[];
}

export interface HeroAdSlide {
  id: string;
  resortId: string;
  resortName: string;
  location: Exclude<WayanadLocation, 'All Wayanad'>;
  headline: string;
  subheadline: string;
  offerTag: string;
  ctaLabel: string;
  imageUrl: string;
  redirectUrl: string;
}

export interface CrossPromoAd {
  id: string;
  resortId: string;
  resortName: string;
  location: Exclude<WayanadLocation, 'All Wayanad'>;
  tagline: string;
  offerBadge: string;
  imageUrl: string;
  redirectUrl: string;
}

export interface WeeklyDeal {
  id: string;
  resortId: string;
  resortName: string;
  location: Exclude<WayanadLocation, 'All Wayanad'>;
  dealTitle: string;
  validUntil: string;
}

export type AdSlotId =
  | 'hero_slider'
  | 'cross_promo'
  | 'notification_bar'
  | 'directory_banner';

export interface AdSlotDefinition {
  id: AdSlotId;
  name: string;
  description: string;
  weeklyPriceInr: number;
  estimatedWeeklyImpressions: number;
  recommendedSize: string;
}

export interface AdSlotConfig {
  selected: boolean;
  bannerUrl: string;
  bannerFileName: string;
  redirectUrl: string;
  headline: string;
}

export interface SeoAgentOutput {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  seoScore: number;
  schemaActive: boolean;
  indexingStatus: string;
  jsonLd: Record<string, unknown>;
}

export type SeoChecklistCategory =
  | 'meta_tags'
  | 'image_alt'
  | 'schema'
  | 'offer_profile'
  | 'amenities_media';

export interface SeoTaskItem {
  id: SeoChecklistCategory;
  title: string;
  description: string;
  completed: boolean;
  actionLabel: string;
}

export interface LocalRestaurant {
  id: string;
  name: string;
  town: string;
  regionFilter?: Exclude<WayanadLocation, 'All Wayanad'>;
  specialty: string;
  hours: string;
  avgForTwoInr: number;
  seatingCapacity?: number;
  whatsappNumber: string;
  description: string;
  primaryImage: string;
  galleryImages: string[];
  offerBadge?: string;
  rating: number;
  reviewCount: number;
  highlights: string[];
  serviceItems: ServiceLineItem[];
  faqs: ResortFAQ[];
  mapUrl?: string;
  mapCoordinates?: string;
}

export interface BudgetHotel {
  id: string;
  name: string;
  town: string;
  regionFilter?: Exclude<WayanadLocation, 'All Wayanad'>;
  priceFromInr: number;
  roomSummary: string;
  checkInPolicy?: string;
  whatsappNumber: string;
  upiId?: string;
  description: string;
  primaryImage: string;
  galleryImages: string[];
  offerBadge?: string;
  rating: number;
  reviewCount: number;
  highlights: string[];
  serviceItems: ServiceLineItem[];
  faqs: ResortFAQ[];
  mapUrl?: string;
  mapCoordinates?: string;
}

export interface TourOperator {
  id: string;
  name: string;
  services: string;
  startingPriceInr: number;
  duration: string;
  highlights: string;
  tourCategory?: string;
  vehicleType?: string;
  seatingCapacity?: number;
  coveredSpots?: string[];
  pickupMode?: string;
  guideLanguages?: string;
  operationalInclusions?: string[];
  whatsappNumber: string;
  upiId?: string;
  description: string;
  primaryImage: string;
  galleryImages: string[];
  offerBadge?: string;
  rating: number;
  reviewCount: number;
  inclusions: string[];
  serviceItems: ServiceLineItem[];
  faqs: ResortFAQ[];
  mapUrl?: string;
  mapCoordinates?: string;
}

export interface EventTicketListing {
  id: string;
  name: string;
  venue: string;
  town: string;
  regionFilter?: Exclude<WayanadLocation, 'All Wayanad'>;
  eventDates: string;
  entryTime: string;
  ticketPriceInr: number;
  stallPriceInr: number;
  availableTickets: number;
  availableStalls: number;
  whatsappNumber: string;
  upiId: string;
  description: string;
  primaryImage: string;
  galleryImages: string[];
  offerBadge?: string;
  rating: number;
  reviewCount: number;
  highlights: string[];
  serviceItems: ServiceLineItem[];
  faqs: ResortFAQ[];
  mapUrl?: string;
  mapCoordinates?: string;
}
