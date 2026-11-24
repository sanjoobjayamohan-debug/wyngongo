export type DualSeoCategory =
  | 'Resort'
  | 'Budget Hotel'
  | 'Restaurant'
  | 'Tour'
  | 'Event';

export type DualSeoSchemaType =
  | 'LodgingBusiness'
  | 'Restaurant'
  | 'TouristTrip'
  | 'Event';

export interface DualSeoFaq {
  question: string;
  answer: string;
}

export type ExternalSyncStatus = 'connected' | 'not_connected';

export interface DualIndexingReceipt {
  target: 'internal' | 'external';
  url: string;
  notificationType: 'URL_UPDATED';
  status:
    | 'submitted'
    | 'queued_credentials_required'
    | 'skipped_invalid_url'
    | 'failed';
  httpStatus?: number;
  detail: string;
  dispatchedAt: string;
}

export interface DualSeoConfigRecord {
  partnerId: string;
  businessName: string;
  category: DualSeoCategory;
  location: string;
  rawKeywords: string;
  description: string;
  priceRange: string;
  offers: string;
  internalListingUrl: string;
  externalWebsiteUrl: string;
  metaTitle: string;
  metaDescription: string;
  longTailKeywords: string[];
  faqs: DualSeoFaq[];
  jsonLdSchema: Record<string, unknown>;
  anchorTextVariants: string[];
  activeAnchorIndex: number;
  isProPartner: boolean;
  internalIndexStatus: string;
  internalIndexedAt: string | null;
  externalSyncStatus: ExternalSyncStatus;
  externalSyncVerifiedAt: string | null;
  externalScriptPings: number;
  lastSyncOrigin: string | null;
  externalIndexStatus: string;
  externalIndexedAt: string | null;
  lastIndexingReceipts: DualIndexingReceipt[];
  createdAt: string;
  updatedAt: string;
}

export interface DualSeoGenerateInput {
  partner_id?: string;
  business_name: string;
  category: DualSeoCategory;
  location: string;
  raw_keywords: string;
  description: string;
  price_range: string;
  offers: string;
  external_website_url: string;
  internal_listing_url?: string;
  is_pro_partner?: boolean;
}

export interface DualSeoVerifyResult {
  partnerId: string;
  connected: boolean;
  externalSyncStatus: ExternalSyncStatus;
  externalWebsiteUrl: string;
  method: 'script_tag_detected' | 'live_beacon_verified' | 'not_detected';
  externalScriptPings: number;
  verifiedAt: string | null;
  message: string;
}
