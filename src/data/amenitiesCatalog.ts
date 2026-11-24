import {
  Binoculars,
  Compass,
  Flame,
  Footprints,
  Gamepad2,
  Leaf,
  Sparkles,
  Trees,
  UtensilsCrossed,
  Waves,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import type { AmenityKey } from '../types/resort';

export interface AmenityDefinition {
  key: AmenityKey;
  label: string;
  detail: string;
  Icon: LucideIcon;
}

export const AMENITIES_CATALOG: Record<AmenityKey, AmenityDefinition> = {
  pool: {
    key: 'pool',
    label: 'Infinity / Plunge Pool',
    detail: 'Valley or lake facing heated pool',
    Icon: Waves,
  },
  campfire: {
    key: 'campfire',
    label: 'Evening Campfire',
    detail: 'Guided starlit firepit & music',
    Icon: Flame,
  },
  treehouse: {
    key: 'treehouse',
    label: 'Canopy Treehouse',
    detail: 'Elevated hardwood & bamboo deck',
    Icon: Trees,
  },
  jeep_safari: {
    key: 'jeep_safari',
    label: '4x4 Jeep Safari',
    detail: 'Estate trails & wildlife pickups',
    Icon: Compass,
  },
  dining: {
    key: 'dining',
    label: 'Malabar Dining',
    detail: 'Farm-to-table Kerala kitchen',
    Icon: UtensilsCrossed,
  },
  wifi: {
    key: 'wifi',
    label: 'High-Speed Wi-Fi',
    detail: 'Fibre connectivity for workations',
    Icon: Wifi,
  },
  ayurveda_spa: {
    key: 'ayurveda_spa',
    label: 'Ayurveda & Spa',
    detail: 'Traditional Kerala herbal therapies',
    Icon: Sparkles,
  },
  waterfall_trek: {
    key: 'waterfall_trek',
    label: 'Guided Waterfall Trek',
    detail: 'Private stream & forest trail walk',
    Icon: Footprints,
  },
  tea_estate_walk: {
    key: 'tea_estate_walk',
    label: 'Tea & Spice Walk',
    detail: 'Morning plantation tasting tour',
    Icon: Leaf,
  },
  indoor_games: {
    key: 'indoor_games',
    label: 'Indoor Games Lounge',
    detail: 'Carrom, table tennis & board games',
    Icon: Gamepad2,
  },
  bbq_grill: {
    key: 'bbq_grill',
    label: 'Live Pepper BBQ Grill',
    detail: 'Outdoor evening grill on request',
    Icon: Flame,
  },
  bird_watching: {
    key: 'bird_watching',
    label: 'Hornbill Birding Trail',
    detail: 'Dawn naturalist bird-spotting walk',
    Icon: Binoculars,
  },
};

export const AMENITY_KEYS = Object.keys(AMENITIES_CATALOG) as AmenityKey[];

export const AMENITY_MAX_OPTIONS = [
  { value: 2, label: 'Show max 2 amenities' },
  { value: 4, label: 'Show max 4 amenities' },
  { value: 6, label: 'Show max 6 amenities' },
  { value: 8, label: 'Show max 8 amenities' },
  { value: 12, label: 'Show all (up to 12)' },
];
