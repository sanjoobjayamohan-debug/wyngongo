import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type {
  DualIndexingReceipt,
  DualSeoCategory,
  DualSeoConfigRecord,
  DualSeoFaq,
  ExternalSyncStatus,
} from '../src/types/dualSeo.ts';
import {
  buildContextualAnchors,
  buildPartnerJsonLd,
  normalizeLongTailKeywords,
  normalizeMetaDescription,
  normalizeMetaTitle,
} from '../src/utils/dualSeo.ts';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'wayanad_dual_seo.sqlite');
const SCHEMA_PATH = path.resolve(process.cwd(), 'db', 'schema.sql');

let dbInstance: DatabaseSync | null = null;

interface RawSeoRow {
  partner_id: string;
  business_name: string;
  category: string;
  location: string;
  raw_keywords: string;
  description: string;
  price_range: string;
  offers: string;
  internal_listing_url: string;
  external_website_url: string;
  meta_title: string;
  meta_description: string;
  long_tail_keywords_json: string;
  faqs_json: string;
  json_ld_schema: string;
  anchor_text_variants_json: string;
  active_anchor_index: number;
  is_pro_partner: number;
  internal_index_status: string;
  internal_indexed_at: string | null;
  external_sync_status: string;
  external_sync_verified_at: string | null;
  external_script_pings: number;
  last_sync_origin: string | null;
  external_index_status: string;
  external_indexed_at: string | null;
  last_indexing_receipts_json: string;
  created_at: string;
  updated_at: string;
}

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function rowToRecord(row: RawSeoRow): DualSeoConfigRecord {
  return {
    partnerId: row.partner_id,
    businessName: row.business_name,
    category: row.category as DualSeoCategory,
    location: row.location,
    rawKeywords: row.raw_keywords,
    description: row.description,
    priceRange: row.price_range,
    offers: row.offers,
    internalListingUrl: row.internal_listing_url,
    externalWebsiteUrl: row.external_website_url,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    longTailKeywords: safeJsonParse<string[]>(row.long_tail_keywords_json, []),
    faqs: safeJsonParse<DualSeoFaq[]>(row.faqs_json, []),
    jsonLdSchema: safeJsonParse<Record<string, unknown>>(row.json_ld_schema, {}),
    anchorTextVariants: safeJsonParse<string[]>(row.anchor_text_variants_json, []),
    activeAnchorIndex: row.active_anchor_index,
    isProPartner: Boolean(row.is_pro_partner),
    internalIndexStatus: row.internal_index_status,
    internalIndexedAt: row.internal_indexed_at,
    externalSyncStatus: row.external_sync_status as ExternalSyncStatus,
    externalSyncVerifiedAt: row.external_sync_verified_at,
    externalScriptPings: row.external_script_pings,
    lastSyncOrigin: row.last_sync_origin,
    externalIndexStatus: row.external_index_status,
    externalIndexedAt: row.external_indexed_at,
    lastIndexingReceipts: safeJsonParse<DualIndexingReceipt[]>(
      row.last_indexing_receipts_json,
      []
    ),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function seedInitialPartners(db: DatabaseSync): void {
  const countRow = db
    .prepare('SELECT COUNT(*) as total FROM partners_seo_configs')
    .get() as { total: number };
  if (countRow.total > 0) return;

  const baseAppUrl =
    process.env.APP_URL?.replace(/\/+$/, '') || 'http://localhost:3000';
  const nowIso = new Date().toISOString();

  const seeds: Array<{
    partnerId: string;
    businessName: string;
    category: DualSeoCategory;
    location: string;
    rawKeywords: string;
    description: string;
    priceRange: string;
    offers: string;
    externalWebsiteUrl: string;
    isProPartner: boolean;
    externalSyncStatus: ExternalSyncStatus;
    externalScriptPings: number;
    faqs: DualSeoFaq[];
  }> = [
    {
      partnerId: 'banasura-mist-villas',
      businessName: 'Banasura Mist Eco Villas',
      category: 'Resort',
      location: 'Vythiri',
      rawKeywords:
        'private plunge pool, lake view eco villa, Banasura dam kayaking, pool resorts in vythiri',
      description:
        'Constructed with rammed earth and reclaimed Kerala teak, Banasura Mist Eco Villas offers private plunge pools overlooking Banasura Sagar Dam.',
      priceRange: '₹5,400 – ₹8,900',
      offers: 'Winter Deal: ₹2,000 + Breakfast',
      externalWebsiteUrl: 'https://banasuramist.example.com/reserve',
      isProPartner: true,
      externalSyncStatus: 'not_connected',
      externalScriptPings: 0,
      faqs: [
        {
          question: 'How far is Banasura Mist Eco Villas from Banasura Sagar Dam?',
          answer: '1.2 km from the Banasura boating jetty with morning kayaking support.',
        },
        {
          question: 'Do villas include private plunge pools?',
          answer: 'Yes, all six Lakefront Mud Villas feature private heated stone plunge pools.',
        },
        {
          question: 'Is breakfast included in direct bookings?',
          answer: 'Yes, Winter Deal direct bookings include complimentary Kerala breakfast.',
        },
        {
          question: 'Can we book directly without OTA commissions?',
          answer: 'Book via WhatsApp, UPI, or our official direct reservation link at zero markup.',
        },
        {
          question: 'What is the check-in and cancellation policy?',
          answer: 'Standard 1:00 PM check-in with free rescheduling up to 48 hours prior.',
        },
      ],
    },
    {
      partnerId: 'misty-woods-vythiri',
      businessName: 'Misty Woods Canopy Resort',
      category: 'Resort',
      location: 'Vythiri',
      rawKeywords:
        'vythiri rainforest infinity pool, pookode lake resort, treehouse stay wayanad',
      description:
        'Perched above 14 acres of Western Ghats rainforest in Vythiri with heated infinity pool and handcrafted teak canopy suites.',
      priceRange: '₹6,800 – ₹11,500',
      offers: 'Winter Deal: ₹2,000 Off + Breakfast',
      externalWebsiteUrl: 'https://mistywoodsvythiri.example.com/direct-book',
      isProPartner: true,
      externalSyncStatus: 'connected',
      externalScriptPings: 14,
      faqs: [
        {
          question: 'How close is Misty Woods to Pookode Lake?',
          answer: 'Located just 1.8 km (5 minutes) from Pookode Lake in Vythiri.',
        },
        {
          question: 'Is the infinity pool heated in winter?',
          answer: 'Yes, solar-heated to 29°C through November–February.',
        },
        {
          question: 'Are treehouses suitable for couples and families?',
          answer: 'Yes, elevated rainforest suites accommodate couples and small families.',
        },
        {
          question: 'Does the resort organize Wayanad jeep safaris?',
          answer: 'Yes, curated early-morning 4x4 ridge and wildlife safaris are available.',
        },
        {
          question: 'How do I claim the ₹2,000 Winter Deal?',
          answer: 'Book directly on our official site or WhatsApp desk listed on WayanadStays.',
        },
      ],
    },
    {
      partnerId: 'chembra-ridge-retreat',
      businessName: 'Chembra Ridge Tea Retreat',
      category: 'Resort',
      location: 'Meppadi',
      rawKeywords: 'meppadi tea estate resort, chembra peak stay, sunrise package wayanad',
      description:
        'Inside a 90-year-old organic tea estate in Meppadi with glass suites and heated ridge pool facing Chembra Peak.',
      priceRange: '₹7,200 – ₹12,400',
      offers: 'Sunrise Package: Guided Tea Walk',
      externalWebsiteUrl: 'https://chembraridge.example.com/book',
      isProPartner: true,
      externalSyncStatus: 'connected',
      externalScriptPings: 8,
      faqs: [
        {
          question: 'Does Chembra Ridge arrange Chembra Peak trek passes?',
          answer: 'Yes, our desk arranges 6:15 AM jeep transfers to the Forest Office counter.',
        },
        {
          question: 'Are tea plantation walks included?',
          answer: 'Morning guided tea-tasting walks are complimentary for direct bookings.',
        },
        {
          question: 'How far is Soochipara Waterfalls from Meppadi?',
          answer: 'Approximately 22 minutes by scenic estate road.',
        },
        {
          question: 'Is high-speed Wi-Fi available for workations?',
          answer: 'Yes, dual-ISP fiber Wi-Fi covers all glass suites.',
        },
        {
          question: 'Are pets allowed at the retreat?',
          answer: 'Select ground-level estate cottages welcome small pets on request.',
        },
      ],
    },
    {
      partnerId: 'pepper-leaf-kitchen',
      businessName: 'Pepper Leaf Kitchen',
      category: 'Restaurant',
      location: 'Kalpetta',
      rawKeywords: 'kerala meals kalpetta, banana leaf sadya wayanad, malabar chicken curry',
      description:
        'Kalpetta dining landmark serving authentic Wayanad banana-leaf Kerala sadya, freshly ground black-pepper roasts, and clay-pot curries.',
      priceRange: '₹220 – ₹550',
      offers: 'Complimentary Sulaimani Tea on Direct Table Booking',
      externalWebsiteUrl: 'https://pepperleafkitchen.example.com/menu',
      isProPartner: true,
      externalSyncStatus: 'connected',
      externalScriptPings: 6,
      faqs: [
        {
          question: 'What are the dining hours in Kalpetta?',
          answer: 'Open daily from 11:30 AM to 10:00 PM for lunch sadya and dinner.',
        },
        {
          question: 'Are vegetarian sadya meals available?',
          answer: 'Yes, traditional 9-course vegetarian banana-leaf sadya is served daily.',
        },
        {
          question: 'Can groups reserve tables ahead?',
          answer: 'Direct table reservations for 2–12 guests are available via WhatsApp.',
        },
        {
          question: 'Is parking available near Kalpetta highway?',
          answer: 'Yes, dedicated free guest parking is available on site.',
        },
        {
          question: 'Do you serve Malabar parotta and bamboo payasam?',
          answer: 'Yes, clay-pot Malabar chicken curry and bamboo rice payasam are signatures.',
        },
      ],
    },
    {
      partnerId: 'wayanad-trails-tours',
      businessName: 'Wayanad Trails & Tours',
      category: 'Tour',
      location: 'Vythiri',
      rawKeywords: '900 kandi jeep safari, wayanad sightseeing tour, chembra trek transport',
      description:
        'Licensed 4x4 off-road jeep safaris, 900 Kandi ridge expeditions, and guided Wayanad waterfall sightseeing.',
      priceRange: '₹2,400 – ₹3,900',
      offers: 'Resort Doorstep Pickup Included',
      externalWebsiteUrl: 'https://wayanadtrails.example.com/safaris',
      isProPartner: false,
      externalSyncStatus: 'not_connected',
      externalScriptPings: 0,
      faqs: [
        {
          question: 'Do safaris include resort pickup in Vythiri or Meppadi?',
          answer: 'Yes, doorstep pickup from Vythiri, Kalpetta, and Meppadi stays is included.',
        },
        {
          question: 'How many guests fit in one 4x4 jeep?',
          answer: 'Up to 6 guests per private off-road jeep.',
        },
        {
          question: 'What is covered in the 900 Kandi Glass Bridge package?',
          answer: '3.5-hour ridge safari, forest viewpoint stops, and return drop-off.',
        },
        {
          question: 'Are sunrise slots available?',
          answer: 'Yes, 6:00 AM sunrise ridge departures run daily.',
        },
        {
          question: 'Can we pay via UPI upon confirmation?',
          answer: 'Yes, instant UPI booking confirmation is supported.',
        },
      ],
    },
    {
      partnerId: 'wayanad-monsoon-music-fest',
      businessName: 'Wayanad Mist & Spice Cultural Fest',
      category: 'Event',
      location: 'Sultan Bathery',
      rawKeywords: 'wayanad cultural festival, sultan bathery weekend event, malabar food fest',
      description:
        'Weekend Wayanad culinary, tribal folk percussion, and spice-estate artisan showcase hosted near Sultan Bathery.',
      priceRange: '₹499 – ₹1,499',
      offers: 'Early Bird: 20% Off Weekend Family Pass',
      externalWebsiteUrl: 'https://wayanadfest.example.com/passes',
      isProPartner: true,
      externalSyncStatus: 'not_connected',
      externalScriptPings: 0,
      faqs: [
        {
          question: 'Where is the festival hosted in Wayanad?',
          answer: 'Hosted at Heritage Amphitheatre Grounds near Sultan Bathery.',
        },
        {
          question: 'What is included with the Weekend Family Pass?',
          answer: 'Entry for 4 guests, evening folk music performances, and spice tasting.',
        },
        {
          question: 'Are local Malabar food stalls available?',
          answer: 'Over 20 Wayanad kitchens serve bamboo biriyani, sadya, and snacks.',
        },
        {
          question: 'Is parking available at the venue?',
          answer: 'Complimentary guarded parking for cars and tour vans is included.',
        },
        {
          question: 'How do I claim the 20% Early Bird pass?',
          answer: 'Reserve via the official event pass portal linked directly from WayanadStays.',
        },
      ],
    },
  ];

  const stmt = db.prepare(`
    INSERT INTO partners_seo_configs (
      partner_id, business_name, category, location, raw_keywords, description,
      price_range, offers, internal_listing_url, external_website_url,
      meta_title, meta_description, long_tail_keywords_json, faqs_json, json_ld_schema,
      anchor_text_variants_json, active_anchor_index, is_pro_partner,
      internal_index_status, internal_indexed_at,
      external_sync_status, external_sync_verified_at, external_script_pings, last_sync_origin,
      external_index_status, external_indexed_at, last_indexing_receipts_json,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?
    )
  `);

  for (const seed of seeds) {
    const internalUrl = `${baseAppUrl}/?listing=${encodeURIComponent(seed.partnerId)}`;
    const metaTitle = normalizeMetaTitle(
      `${seed.businessName} | ${seed.location}, Wayanad`,
      seed.businessName,
      seed.location
    );
    const metaDescription = normalizeMetaDescription(
      `${seed.description} ${seed.offers}. Direct rates ${seed.priceRange}.`,
      seed.businessName,
      seed.location,
      seed.offers
    );
    const keywords = normalizeLongTailKeywords(
      [],
      seed.businessName,
      seed.category,
      seed.location,
      seed.rawKeywords
    );
    const jsonLd = buildPartnerJsonLd({
      businessName: seed.businessName,
      category: seed.category,
      location: seed.location,
      description: seed.description,
      priceRange: seed.priceRange,
      offers: seed.offers,
      externalWebsiteUrl: seed.externalWebsiteUrl,
      internalListingUrl: internalUrl,
      faqs: seed.faqs,
    });
    const anchors = buildContextualAnchors(
      seed.businessName,
      seed.category,
      seed.location,
      seed.offers
    );

    const receipts: DualIndexingReceipt[] = [
      {
        target: 'internal',
        url: internalUrl,
        notificationType: 'URL_UPDATED',
        status: 'queued_credentials_required',
        detail: 'Ready for Google Indexing API v3 dispatch (URL_UPDATED).',
        dispatchedAt: nowIso,
      },
      {
        target: 'external',
        url: seed.externalWebsiteUrl,
        notificationType: 'URL_UPDATED',
        status: 'queued_credentials_required',
        detail: 'Ready for Google Indexing API v3 dispatch (URL_UPDATED).',
        dispatchedAt: nowIso,
      },
    ];

    stmt.run(
      seed.partnerId,
      seed.businessName,
      seed.category,
      seed.location,
      seed.rawKeywords,
      seed.description,
      seed.priceRange,
      seed.offers,
      internalUrl,
      seed.externalWebsiteUrl,
      metaTitle,
      metaDescription,
      JSON.stringify(keywords),
      JSON.stringify(seed.faqs),
      JSON.stringify(jsonLd),
      JSON.stringify(anchors),
      0,
      seed.isProPartner ? 1 : 0,
      'Indexed',
      nowIso,
      seed.externalSyncStatus,
      seed.externalSyncStatus === 'connected' ? nowIso : null,
      seed.externalScriptPings,
      seed.externalSyncStatus === 'connected' ? seed.externalWebsiteUrl : null,
      seed.externalSyncStatus === 'connected' ? 'Indexed' : 'Pending',
      seed.externalSyncStatus === 'connected' ? nowIso : null,
      JSON.stringify(receipts),
      nowIso,
      nowIso
    );
  }
}

export function getSeoDatabase(): DatabaseSync {
  if (dbInstance) return dbInstance;
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  const db = new DatabaseSync(DB_PATH);
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schemaSql);
  seedInitialPartners(db);
  dbInstance = db;
  return db;
}

export function getSchemaSqlText(): string {
  return fs.readFileSync(SCHEMA_PATH, 'utf8');
}

export function listSeoConfigs(): DualSeoConfigRecord[] {
  const db = getSeoDatabase();
  const rows = db
    .prepare('SELECT * FROM partners_seo_configs ORDER BY updated_at DESC')
    .all() as unknown as RawSeoRow[];
  return rows.map(rowToRecord);
}

export function getSeoConfigByPartnerId(
  partnerId: string
): DualSeoConfigRecord | null {
  const db = getSeoDatabase();
  const row = db
    .prepare('SELECT * FROM partners_seo_configs WHERE partner_id = ?')
    .get(partnerId) as unknown as RawSeoRow | undefined;
  return row ? rowToRecord(row) : null;
}

export function upsertSeoConfig(
  record: DualSeoConfigRecord
): DualSeoConfigRecord {
  const db = getSeoDatabase();
  const nowIso = new Date().toISOString();
  const existing = getSeoConfigByPartnerId(record.partnerId);

  const stmt = db.prepare(`
    INSERT INTO partners_seo_configs (
      partner_id, business_name, category, location, raw_keywords, description,
      price_range, offers, internal_listing_url, external_website_url,
      meta_title, meta_description, long_tail_keywords_json, faqs_json, json_ld_schema,
      anchor_text_variants_json, active_anchor_index, is_pro_partner,
      internal_index_status, internal_indexed_at,
      external_sync_status, external_sync_verified_at, external_script_pings, last_sync_origin,
      external_index_status, external_indexed_at, last_indexing_receipts_json,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?
    )
    ON CONFLICT(partner_id) DO UPDATE SET
      business_name = excluded.business_name,
      category = excluded.category,
      location = excluded.location,
      raw_keywords = excluded.raw_keywords,
      description = excluded.description,
      price_range = excluded.price_range,
      offers = excluded.offers,
      internal_listing_url = excluded.internal_listing_url,
      external_website_url = excluded.external_website_url,
      meta_title = excluded.meta_title,
      meta_description = excluded.meta_description,
      long_tail_keywords_json = excluded.long_tail_keywords_json,
      faqs_json = excluded.faqs_json,
      json_ld_schema = excluded.json_ld_schema,
      anchor_text_variants_json = excluded.anchor_text_variants_json,
      active_anchor_index = excluded.active_anchor_index,
      is_pro_partner = excluded.is_pro_partner,
      internal_index_status = excluded.internal_index_status,
      internal_indexed_at = excluded.internal_indexed_at,
      external_sync_status = excluded.external_sync_status,
      external_sync_verified_at = excluded.external_sync_verified_at,
      external_script_pings = excluded.external_script_pings,
      last_sync_origin = excluded.last_sync_origin,
      external_index_status = excluded.external_index_status,
      external_indexed_at = excluded.external_indexed_at,
      last_indexing_receipts_json = excluded.last_indexing_receipts_json,
      updated_at = excluded.updated_at
  `);

  stmt.run(
    record.partnerId,
    record.businessName,
    record.category,
    record.location,
    record.rawKeywords,
    record.description,
    record.priceRange,
    record.offers,
    record.internalListingUrl,
    record.externalWebsiteUrl,
    record.metaTitle,
    record.metaDescription,
    JSON.stringify(record.longTailKeywords),
    JSON.stringify(record.faqs),
    JSON.stringify(record.jsonLdSchema),
    JSON.stringify(record.anchorTextVariants),
    record.activeAnchorIndex,
    record.isProPartner ? 1 : 0,
    record.internalIndexStatus,
    record.internalIndexedAt,
    record.externalSyncStatus,
    record.externalSyncVerifiedAt,
    record.externalScriptPings,
    record.lastSyncOrigin,
    record.externalIndexStatus,
    record.externalIndexedAt,
    JSON.stringify(record.lastIndexingReceipts),
    existing?.createdAt ?? nowIso,
    nowIso
  );

  return getSeoConfigByPartnerId(record.partnerId)!;
}

export function patchSeoConfigMeta(
  partnerId: string,
  patch: {
    externalWebsiteUrl?: string;
    isProPartner?: boolean;
    activeAnchorIndex?: number;
  }
): DualSeoConfigRecord | null {
  const existing = getSeoConfigByPartnerId(partnerId);
  if (!existing) return null;
  const updated: DualSeoConfigRecord = {
    ...existing,
    externalWebsiteUrl: patch.externalWebsiteUrl ?? existing.externalWebsiteUrl,
    isProPartner: patch.isProPartner ?? existing.isProPartner,
    activeAnchorIndex: patch.activeAnchorIndex ?? existing.activeAnchorIndex,
    jsonLdSchema:
      patch.externalWebsiteUrl && patch.externalWebsiteUrl !== existing.externalWebsiteUrl
        ? buildPartnerJsonLd({
            businessName: existing.businessName,
            category: existing.category,
            location: existing.location,
            description: existing.description,
            priceRange: existing.priceRange,
            offers: existing.offers,
            externalWebsiteUrl: patch.externalWebsiteUrl,
            internalListingUrl: existing.internalListingUrl,
            faqs: existing.faqs,
          })
        : existing.jsonLdSchema,
  };
  return upsertSeoConfig(updated);
}

export function recordExternalScriptPing(
  partnerId: string,
  origin: string
): DualSeoConfigRecord | null {
  const db = getSeoDatabase();
  const existing = getSeoConfigByPartnerId(partnerId);
  if (!existing) return null;
  const nowIso = new Date().toISOString();

  db.prepare(`
    UPDATE partners_seo_configs
    SET external_sync_status = 'connected',
        external_sync_verified_at = ?,
        external_script_pings = external_script_pings + 1,
        last_sync_origin = ?,
        updated_at = ?
    WHERE partner_id = ?
  `).run(nowIso, origin.slice(0, 255), nowIso, partnerId);

  return getSeoConfigByPartnerId(partnerId);
}

export function setExternalSyncVerification(
  partnerId: string,
  connected: boolean,
  originOrReason: string
): DualSeoConfigRecord | null {
  const db = getSeoDatabase();
  const existing = getSeoConfigByPartnerId(partnerId);
  if (!existing) return null;
  const nowIso = new Date().toISOString();

  db.prepare(`
    UPDATE partners_seo_configs
    SET external_sync_status = ?,
        external_sync_verified_at = ?,
        last_sync_origin = ?,
        updated_at = ?
    WHERE partner_id = ?
  `).run(
    connected ? 'connected' : 'not_connected',
    connected ? nowIso : existing.externalSyncVerifiedAt,
    connected ? originOrReason.slice(0, 255) : existing.lastSyncOrigin,
    nowIso,
    partnerId
  );

  return getSeoConfigByPartnerId(partnerId);
}

export function updateDualIndexingReceipts(
  partnerId: string,
  receipts: DualIndexingReceipt[]
): DualSeoConfigRecord | null {
  const db = getSeoDatabase();
  const existing = getSeoConfigByPartnerId(partnerId);
  if (!existing) return null;
  const nowIso = new Date().toISOString();

  const internalReceipt = receipts.find((r) => r.target === 'internal');
  const externalReceipt = receipts.find((r) => r.target === 'external');

  const internalStatus =
    internalReceipt?.status === 'submitted'
      ? 'Indexed via API'
      : internalReceipt?.status === 'queued_credentials_required'
        ? 'Indexed (Schema Active)'
        : existing.internalIndexStatus;

  const externalStatus =
    externalReceipt?.status === 'submitted'
      ? 'URL_UPDATED Dispatched'
      : externalReceipt?.status === 'queued_credentials_required'
        ? 'Queued (API Token Needed)'
        : existing.externalIndexStatus;

  db.prepare(`
    UPDATE partners_seo_configs
    SET internal_index_status = ?,
        internal_indexed_at = ?,
        external_index_status = ?,
        external_indexed_at = ?,
        last_indexing_receipts_json = ?,
        updated_at = ?
    WHERE partner_id = ?
  `).run(
    internalStatus,
    nowIso,
    externalStatus,
    nowIso,
    JSON.stringify(receipts),
    nowIso,
    partnerId
  );

  return getSeoConfigByPartnerId(partnerId);
}
