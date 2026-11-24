import type { PartnerCategory, Resort, SeoAgentOutput } from '../types/resort';

const WAYANAD_BASE_KEYWORDS: Record<Resort['location'], string[]> = {
  Vythiri: [
    'vythiri family stay',
    'pool resorts in vythiri',
    'wayanad misty treehouse',
    'pookode lake resort',
  ],
  Meppadi: [
    'meppadi tea estate resort',
    'chembra peak stay',
    'soochipara waterfall resort',
    'wayanad honeymoon villa',
  ],
  Mananthavady: [
    'mananthavady coffee estate stay',
    'kuruvadweep eco resort',
    'wayanad budget resort',
    'heritage planter bungalow',
  ],
  'Sultan Bathery': [
    'sultan bathery boutique resort',
    'edakkal caves stay',
    'wayanad wildlife safari resort',
    'family campfire stay wayanad',
  ],
  Thirunelli: [
    'thirunelli forest camp',
    'brahmagiri riverside resort',
    'wayanad nature glamping',
    'kerala forest retreat',
  ],
};

function sanitizeToken(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim();
}

export function extractKeywordsFromNotes(
  notes: string,
  location: Resort['location']
): string[] {
  const base = WAYANAD_BASE_KEYWORDS[location] ?? [];
  const rawPhrases = notes
    .split(/[,;\n]+/)
    .map(sanitizeToken)
    .filter((token) => token.length >= 3);

  const combined: string[] = [];

  for (const phrase of rawPhrases) {
    const words = phrase.split(/\s+/).filter(Boolean);
    if (words.length <= 4) {
      combined.push(phrase);
    } else {
      for (let i = 0; i < words.length; i += 2) {
        const chunk = words.slice(i, i + 3).join(' ');
        if (chunk.length >= 4) combined.push(chunk);
      }
    }
  }

  for (const kw of base) {
    if (!combined.includes(kw)) {
      combined.push(kw);
    }
  }

  return Array.from(new Set(combined)).slice(0, 8);
}

export function optimizeResortSeo(
  resort: Resort,
  ownerNotes: string
): SeoAgentOutput {
  const trimmedNotes = ownerNotes.trim();
  const keywords = extractKeywordsFromNotes(trimmedNotes, resort.location);

  const highlightPhrase = trimmedNotes
    ? trimmedNotes
        .split(/[,.;\n]+/)[0]
        .trim()
        .replace(/^\w/, (c) => c.toUpperCase())
    : `${resort.landmarkDistance}`;

  const rawTitle = `${resort.name} | ${resort.location} Resort (${resort.offerPill.split(':')[0]})`;
  const metaTitle =
    rawTitle.length > 64 ? `${rawTitle.slice(0, 61).trim()}...` : rawTitle;

  const rawDesc = `Book ${resort.name} in ${resort.location}, Wayanad (${resort.landmarkDistance}). ${highlightPhrase}. Direct rates from ₹${resort.pricePerNight.toLocaleString('en-IN')}/night — ${resort.offerPill}.`;
  const metaDescription =
    rawDesc.length > 160 ? `${rawDesc.slice(0, 157).trim()}...` : rawDesc;

  // Score calculation: baseline 78, boosts up to 94 when owner enriches notes + offer + video
  let score = 78;
  if (trimmedNotes.length >= 12) score += 8;
  if (trimmedNotes.length >= 35) score += 4;
  if (resort.hasVideoTour) score += 2;
  if (resort.offerPill.trim().length >= 8) score += 2;
  const seoScore = Math.min(94, score);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: resort.name,
    address: {
      '@type': 'PostalAddress',
      addressLocality: resort.location,
      addressRegion: 'Wayanad, Kerala',
      addressCountry: 'IN',
    },
    priceRange: `₹${resort.pricePerNight.toLocaleString('en-IN')}+`,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: resort.rating,
      reviewCount: resort.reviewCount,
    },
    url: resort.directBookingUrl,
  };

  return {
    metaTitle,
    metaDescription,
    keywords,
    seoScore,
    schemaActive: true,
    indexingStatus: trimmedNotes ? 'Re-indexed just now' : 'Indexed 2 hrs ago',
    jsonLd,
  };
}

export interface SimpleGooglePreview {
  visibilityScore: number;
  googleTitle: string;
  googleBreadcrumbUrl: string;
  googleDescription: string;
  popularSearches: string[];
}

const CATEGORY_PREVIEW_VERB: Record<PartnerCategory, string> = {
  resort: 'Direct Resort Stays',
  budget_hotel: 'Clean Budget Rooms',
  restaurant: 'Authentic Wayanad Dining',
  tour: 'Guided Wayanad Tours',
  events: 'Tickets & Festival Passes',
};

export function buildSimpleGooglePreview(input: {
  businessName: string;
  category: PartnerCategory;
  location: string;
  plainWords: string;
  offerText: string;
  optimized: boolean;
  externalWebsiteUrl?: string;
}): SimpleGooglePreview {
  const cleanName = input.businessName.trim() || 'Your Wayanad Business';
  const cleanLocation = input.location.trim() || 'Wayanad';
  const cleanNotes = input.plainWords.trim();
  const cleanOffer = input.offerText.trim() || 'Book Direct — Zero Extra Fee';

  const slug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const rawTitle = input.optimized
    ? `${cleanName} — ${CATEGORY_PREVIEW_VERB[input.category]} in ${cleanLocation}, Wayanad`
    : `${cleanName} | ${cleanLocation}, Wayanad`;
  const googleTitle =
    rawTitle.length > 62 ? `${rawTitle.slice(0, 59).trim()}...` : rawTitle;

  const noteSnippet = cleanNotes
    ? cleanNotes.replace(/\s+/g, ' ').slice(0, 95)
    : `Popular ${CATEGORY_PREVIEW_VERB[input.category].toLowerCase()} in ${cleanLocation}, Wayanad.`;

  const rawDesc = `${noteSnippet}${noteSnippet.endsWith('.') ? '' : '.'} ${cleanOffer} on Wayngongo.`;
  const googleDescription =
    rawDesc.length > 155 ? `${rawDesc.slice(0, 152).trim()}...` : rawDesc;

  // Baseline 78/100 out of the box, jumps up to 94/100 when owner auto-optimizes with plain-text details
  let score = 78;
  if (input.optimized) {
    score += 8;
    if (cleanNotes.length >= 20) score += 5;
    if (input.externalWebsiteUrl && input.externalWebsiteUrl.trim().length > 8) {
      score += 3;
    }
  }
  const visibilityScore = Math.min(96, score);

  const popularSearches = [
    `${cleanLocation.toLowerCase()} ${
      input.category === 'events'
        ? 'fest tickets'
        : input.category === 'restaurant'
          ? 'best food'
          : input.category === 'tour'
            ? 'jeep tour'
            : input.category === 'budget_hotel'
              ? 'budget rooms'
              : 'best resorts'
    }`,
    `wayanad ${cleanName.toLowerCase().split(' ').slice(0, 2).join(' ')}`,
    `${cleanLocation.toLowerCase()} direct booking`,
  ];

  return {
    visibilityScore,
    googleTitle,
    googleBreadcrumbUrl: `wayngongo.com › ${cleanLocation.toLowerCase().replace(/\s+/g, '-')} › ${slug || 'listing'}`,
    googleDescription,
    popularSearches,
  };
}

export function buildDesignerWhatsappHref(
  businessName: string,
  scriptSnippet: string
): string {
  const cleanName = businessName.trim() || 'our Wayanad website';
  const msg = `Hi! Please paste this 1-line Wayngongo Google Visibility tag inside the <head> section of ${cleanName}'s website so our latest Wayanad offers and hours appear automatically on Google:\n\n${scriptSnippet}\n\nThank you!`;
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}
