-- ============================================================================
-- WayanadStays Dual-SEO Automation Engine — Database Schema
-- Stores both Internal Programmatic SEO state and External Website Sync state
-- ============================================================================

CREATE TABLE IF NOT EXISTS partners_seo_configs (
  partner_id TEXT PRIMARY KEY,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('Resort', 'Budget Hotel', 'Restaurant', 'Tour', 'Event')
  ),
  location TEXT NOT NULL,
  raw_keywords TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  price_range TEXT NOT NULL DEFAULT '',
  offers TEXT NOT NULL DEFAULT '',

  -- Dual Domain Mapping (Internal Directory + External Owner Domain)
  internal_listing_url TEXT NOT NULL,
  external_website_url TEXT NOT NULL DEFAULT '',

  -- Module 1: AI-Generated SEO Metadata & Structured Schema
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  long_tail_keywords_json TEXT NOT NULL DEFAULT '[]',
  faqs_json TEXT NOT NULL DEFAULT '[]',
  json_ld_schema TEXT NOT NULL DEFAULT '{}',

  -- Module 3: High-Authority Contextual Backlink & Anchor Rotation
  anchor_text_variants_json TEXT NOT NULL DEFAULT '[]',
  active_anchor_index INTEGER NOT NULL DEFAULT 0,
  is_pro_partner INTEGER NOT NULL DEFAULT 0,

  -- Internal SEO & Google Indexing State
  internal_index_status TEXT NOT NULL DEFAULT 'Indexed',
  internal_indexed_at TEXT,

  -- Module 2: External Website 1-Line Sync Script State
  external_sync_status TEXT NOT NULL DEFAULT 'not_connected' CHECK (
    external_sync_status IN ('connected', 'not_connected')
  ),
  external_sync_verified_at TEXT,
  external_script_pings INTEGER NOT NULL DEFAULT 0,
  last_sync_origin TEXT,

  -- Module 4: Dual Google Indexing API Worker Receipts
  external_index_status TEXT NOT NULL DEFAULT 'Pending',
  external_indexed_at TEXT,
  last_indexing_receipts_json TEXT NOT NULL DEFAULT '[]',

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_partners_seo_category
  ON partners_seo_configs (category);

CREATE INDEX IF NOT EXISTS idx_partners_seo_sync_status
  ON partners_seo_configs (external_sync_status);
