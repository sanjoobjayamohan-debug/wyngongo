import type {
  DualSeoCategory,
  DualSeoConfigRecord,
  DualSeoFaq,
  DualSeoGenerateInput,
  DualSeoSchemaType,
} from '../types/dualSeo';

const VALID_CATEGORIES: DualSeoCategory[] = [
  'Resort',
  'Budget Hotel',
  'Restaurant',
  'Tour',
  'Event',
];

export function mapCategoryToSchemaType(
  category: DualSeoCategory
): DualSeoSchemaType {
  switch (category) {
    case 'Resort':
    case 'Budget Hotel':
      return 'LodgingBusiness';
    case 'Restaurant':
      return 'Restaurant';
    case 'Tour':
      return 'TouristTrip';
    case 'Event':
      return 'Event';
  }
}

export function slugifyPartnerId(name: string, fallback = 'partner'): string {
  const clean = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return clean || fallback;
}

export function sanitizeSafeHttpUrl(rawUrl: string): string | null {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function isPrivateOrLoopbackHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    return true;
  }
  const ipv4Match = host.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4Match) {
    const [, aStr, bStr] = ipv4Match;
    const a = Number(aStr);
    const b = Number(bStr);
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
  }
  return false;
}

export function isPublicExternalUrl(rawUrl: string): {
  safe: boolean;
  normalized?: string;
  reason?: string;
} {
  const normalized = sanitizeSafeHttpUrl(rawUrl);
  if (!normalized) {
    return {
      safe: false,
      reason: 'Please enter a valid http:// or https:// website URL.',
    };
  }
  const parsed = new URL(normalized);
  if (isPrivateOrLoopbackHost(parsed.hostname)) {
    return {
      safe: false,
      reason:
        'External website URL must point to a public domain (local/private network addresses are blocked).',
    };
  }
  return { safe: true, normalized };
}

export function validateDualSeoGenerateInput(
  input: Partial<DualSeoGenerateInput>
): { valid: boolean; error?: string } {
  if (!input.business_name || input.business_name.trim().length < 2) {
    return { valid: false, error: 'Business name is required (at least 2 characters).' };
  }
  if (!input.category || !VALID_CATEGORIES.includes(input.category)) {
    return {
      valid: false,
      error: 'Category must be one of Resort, Budget Hotel, Restaurant, Tour, or Event.',
    };
  }
  if (!input.location || input.location.trim().length < 2) {
    return { valid: false, error: 'Wayanad location is required.' };
  }
  if (!input.external_website_url || !sanitizeSafeHttpUrl(input.external_website_url)) {
    return {
      valid: false,
      error: 'Valid external_website_url (http:// or https://) is required for Dual-SEO linking.',
    };
  }
  return { valid: true };
}

function clampAtWordBoundary(text: string, maxLen: number): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;
  const sliced = cleaned.slice(0, maxLen);
  const lastSpace = sliced.lastIndexOf(' ');
  if (lastSpace >= Math.floor(maxLen * 0.65)) {
    return sliced.slice(0, lastSpace).replace(/[\s\-|:,]+$/, '');
  }
  return sliced.trim();
}

export function normalizeMetaTitle(
  rawTitle: string,
  businessName: string,
  location: string
): string {
  const candidate = rawTitle.trim() || `${businessName} | Best Stay in ${location}, Wayanad`;
  return clampAtWordBoundary(candidate, 60);
}

export function normalizeMetaDescription(
  rawDescription: string,
  businessName: string,
  location: string,
  offers: string
): string {
  const fallback = `Book ${businessName} in ${location}, Wayanad directly. ${offers || 'Verified local rates & instant confirmation.'}`;
  const candidate = rawDescription.trim() || fallback;
  return clampAtWordBoundary(candidate, 155);
}

export function normalizeLongTailKeywords(
  keywords: string[],
  businessName: string,
  category: DualSeoCategory,
  location: string,
  rawKeywords: string
): string[] {
  const extras = rawKeywords
    .split(/[,;\n]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length >= 3);

  const fallbacks = [
    `${category.toLowerCase()} in ${location.toLowerCase()} wayanad`,
    `${businessName.toLowerCase()} ${location.toLowerCase()} direct booking`,
    `best ${category.toLowerCase()} near ${location.toLowerCase()} wayanad`,
    `wayanad ${location.toLowerCase()} family package`,
    `wayanad winter special ${category.toLowerCase()}`,
    `${location.toLowerCase()} kerala tourism stay`,
    `affordable ${category.toLowerCase()} wayanad`,
    `wayanad weekend getaway ${location.toLowerCase()}`,
    `zero commission ${category.toLowerCase()} wayanad`,
    `${location.toLowerCase()} banasura chembra travel guide`,
  ];

  const merged = Array.from(
    new Set(
      [...keywords, ...extras, ...fallbacks]
        .map((k) => k.trim().toLowerCase())
        .filter((k) => k.length >= 3)
    )
  );
  return merged.slice(0, 10);
}

export function buildContextualAnchors(
  businessName: string,
  category: DualSeoCategory,
  location: string,
  offers?: string
): string[] {
  const cleanName = businessName.trim();
  const cleanLoc = location.trim();
  const shortOffer = offers?.split(/[:·-]/)[0]?.trim();

  const variants = [
    `Official Booking Website – ${cleanName} in ${cleanLoc}, Wayanad`,
    `Book Direct at ${cleanName} (${cleanLoc} ${category}) – Zero Markup`,
    shortOffer
      ? `${cleanName} Official Site · ${shortOffer} (${cleanLoc}, Wayanad)`
      : `Official Partner Portal – ${cleanName}, ${cleanLoc}, Wayanad`,
  ];
  return Array.from(new Set(variants));
}

export function pickRotatedAnchorText(
  variants: string[],
  partnerId: string,
  overrideIndex?: number
): string {
  if (variants.length === 0) {
    return 'Official Wayanad Partner Booking Website';
  }
  if (typeof overrideIndex === 'number' && Number.isFinite(overrideIndex)) {
    const safeIdx = Math.abs(Math.floor(overrideIndex)) % variants.length;
    return variants[safeIdx];
  }
  let hash = 0;
  for (let i = 0; i < partnerId.length; i += 1) {
    hash = (hash * 31 + partnerId.charCodeAt(i)) >>> 0;
  }
  return variants[hash % variants.length];
}

export function buildPartnerJsonLd(params: {
  businessName: string;
  category: DualSeoCategory;
  location: string;
  description: string;
  priceRange: string;
  offers: string;
  externalWebsiteUrl: string;
  internalListingUrl: string;
  faqs: DualSeoFaq[];
}): Record<string, unknown> {
  const schemaType = mapCategoryToSchemaType(params.category);
  const safeExternal = sanitizeSafeHttpUrl(params.externalWebsiteUrl);
  const safeInternal = sanitizeSafeHttpUrl(params.internalListingUrl);
  const sameAs = Array.from(
    new Set([safeExternal, safeInternal].filter((u): u is string => Boolean(u)))
  );

  const entityNode: Record<string, unknown> = {
    '@type': schemaType,
    name: params.businessName,
    description: params.description,
    url: safeExternal ?? safeInternal ?? '',
    sameAs,
    priceRange: params.priceRange || '₹₹',
    address: {
      '@type': 'PostalAddress',
      addressLocality: params.location,
      addressRegion: 'Wayanad, Kerala',
      addressCountry: 'IN',
    },
  };

  if (params.offers.trim()) {
    entityNode.makesOffer = {
      '@type': 'Offer',
      name: params.offers.trim(),
      availability: 'https://schema.org/InStock',
      url: safeExternal ?? safeInternal ?? '',
    };
  }

  if (schemaType === 'Event') {
    entityNode.eventAttendanceMode =
      'https://schema.org/OfflineEventAttendanceMode';
    entityNode.location = {
      '@type': 'Place',
      name: `${params.businessName}, ${params.location}`,
      address: entityNode.address,
    };
  }

  if (schemaType === 'TouristTrip') {
    entityNode.touristType = ['Family Travelers', 'Nature & Adventure Tourists'];
  }

  const faqEntities = params.faqs.slice(0, 5).map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      entityNode,
      ...(faqEntities.length > 0
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: faqEntities,
            },
          ]
        : []),
    ],
  };
}

export function serializeSafeForInlineScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\//g, '\\u002f')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function buildEmbedScriptSnippet(
  apiOrigin: string,
  partnerId: string
): string {
  const cleanOrigin = apiOrigin.replace(/\/+$/, '');
  return `<script src="${cleanOrigin}/v1/dual-seo.js?partner_id=${encodeURIComponent(
    partnerId
  )}" async></script>`;
}

export function buildDualSeoClientJsPayload(
  config: DualSeoConfigRecord,
  apiOrigin: string
): string {
  const cleanOrigin = apiOrigin.replace(/\/+$/, '');
  const payload = {
    partnerId: config.partnerId,
    title: config.metaTitle,
    description: config.metaDescription,
    keywords: config.longTailKeywords.join(', '),
    ogTitle: config.metaTitle,
    ogDescription: config.metaDescription,
    jsonLd: config.jsonLdSchema,
    canonicalUrl:
      sanitizeSafeHttpUrl(config.externalWebsiteUrl) ??
      config.internalListingUrl,
    directoryUrl: config.internalListingUrl,
    directoryLabel: `Verified on Wayngongo — ${config.businessName} (${config.location})`,
    pingEndpoint: `${cleanOrigin}/api/seo/ping`,
  };

  return `/* Wayngongo Dual-SEO Sync Agent v1 (Partner: ${config.partnerId.replace(
    /[^a-zA-Z0-9_-]/g,
    ''
  )}) */
(function () {
  var DATA = ${serializeSafeForInlineScript(payload)};
  var doc = document;
  var head = doc.head || doc.getElementsByTagName('head')[0];
  if (!head) return;

  function upsertMeta(attrName, attrVal, content) {
    if (!content) return;
    var selector = 'meta[' + attrName + '="' + attrVal + '"]';
    var el = head.querySelector(selector);
    if (!el) {
      el = doc.createElement('meta');
      el.setAttribute(attrName, attrVal);
      el.setAttribute('data-wayanad-dual-seo', '1');
      head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function upsertLink(relVal, hrefVal, idTag) {
    if (!hrefVal) return;
    var selector = 'link[data-wayanad-dual-seo="' + idTag + '"]';
    var el = head.querySelector(selector);
    if (!el) {
      el = doc.createElement('link');
      el.setAttribute('rel', relVal);
      el.setAttribute('data-wayanad-dual-seo', idTag);
      head.appendChild(el);
    }
    el.setAttribute('href', hrefVal);
  }

  // 1. Update Document Title, Meta Description, Keywords & OpenGraph Tags
  if (DATA.title) {
    doc.title = DATA.title;
  }
  upsertMeta('name', 'description', DATA.description);
  upsertMeta('name', 'keywords', DATA.keywords);
  upsertMeta('property', 'og:title', DATA.ogTitle);
  upsertMeta('property', 'og:description', DATA.ogDescription);

  // 2. Inject Live JSON-LD Structured Schema (Offers, Price, sameAs, FAQ)
  var schemaTag = head.querySelector('script[data-wayanad-dual-seo="schema"]');
  if (!schemaTag) {
    schemaTag = doc.createElement('script');
    schemaTag.type = 'application/ld+json';
    schemaTag.setAttribute('data-wayanad-dual-seo', 'schema');
    head.appendChild(schemaTag);
  }
  schemaTag.textContent = JSON.stringify(DATA.jsonLd);

  // 3. Inject Canonical & Reciprocal Authority Links to WayanadStays Directory
  upsertLink('canonical', DATA.canonicalUrl || window.location.href, 'canonical');
  upsertLink('alternate', DATA.directoryUrl, 'directory-link');

  function mountReciprocalLink() {
    if (!doc.body || !DATA.directoryUrl) return;
    if (doc.querySelector('a[data-wayanad-dual-seo="reciprocal-badge"]')) return;
    var anchor = doc.createElement('a');
    anchor.href = DATA.directoryUrl;
    anchor.rel = 'noopener';
    anchor.setAttribute('data-wayanad-dual-seo', 'reciprocal-badge');
    anchor.textContent = DATA.directoryLabel;
    anchor.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
    doc.body.appendChild(anchor);
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', mountReciprocalLink);
  } else {
    mountReciprocalLink();
  }

  // 4. Send Non-Blocking Sync Ping so Partner Dashboard Confirms Live Script Connection
  try {
    var activeScript = doc.currentScript || doc.querySelector('script[src*="/v1/dual-seo.js"]');
    var pingTarget = DATA.pingEndpoint;
    if (activeScript && activeScript.src) {
      try {
        pingTarget = new URL(activeScript.src).origin + '/api/seo/ping';
      } catch (err) {}
    }
    var pingPayload = JSON.stringify({
      partner_id: DATA.partnerId,
      origin: window.location.origin,
      page_url: window.location.href
    });
    if (navigator.sendBeacon) {
      var blob = new Blob([pingPayload], { type: 'text/plain;charset=UTF-8' });
      navigator.sendBeacon(pingTarget, blob);
    } else if (typeof fetch === 'function') {
      fetch(pingTarget, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: pingPayload,
        keepalive: true,
        mode: 'cors'
      }).catch(function () {});
    }
  } catch (e) {}
})();
`;
}
