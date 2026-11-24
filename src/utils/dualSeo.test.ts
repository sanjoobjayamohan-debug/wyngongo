import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildContextualAnchors,
  buildDualSeoClientJsPayload,
  buildEmbedScriptSnippet,
  buildPartnerJsonLd,
  isPublicExternalUrl,
  mapCategoryToSchemaType,
  normalizeLongTailKeywords,
  normalizeMetaDescription,
  normalizeMetaTitle,
  pickRotatedAnchorText,
  sanitizeSafeHttpUrl,
  serializeSafeForInlineScript,
  validateDualSeoGenerateInput,
} from './dualSeo.ts';
import type { DualSeoConfigRecord } from '../types/dualSeo.ts';

describe('Dual-SEO Engine Pure Helpers', () => {
  it('maps Wayanad directory categories to Schema.org types accurately', () => {
    assert.equal(mapCategoryToSchemaType('Resort'), 'LodgingBusiness');
    assert.equal(mapCategoryToSchemaType('Budget Hotel'), 'LodgingBusiness');
    assert.equal(mapCategoryToSchemaType('Restaurant'), 'Restaurant');
    assert.equal(mapCategoryToSchemaType('Tour'), 'TouristTrip');
    assert.equal(mapCategoryToSchemaType('Event'), 'Event');
  });

  it('validates URLs and blocks unsafe schemes or private/loopback SSRF hosts', () => {
    assert.equal(sanitizeSafeHttpUrl('javascript:alert(1)'), null);
    assert.equal(sanitizeSafeHttpUrl('data:text/html,<h1>x</h1>'), null);
    assert.equal(
      sanitizeSafeHttpUrl('https://banasuramist.example.com/book'),
      'https://banasuramist.example.com/book'
    );

    assert.equal(isPublicExternalUrl('http://127.0.0.1:3000/test').safe, false);
    assert.equal(isPublicExternalUrl('http://169.254.169.254/latest').safe, false);
    assert.equal(isPublicExternalUrl('http://192.168.1.10/admin').safe, false);
    assert.equal(isPublicExternalUrl('http://localhost:8080').safe, false);
    assert.equal(isPublicExternalUrl('https://banasuramist.com').safe, true);
  });

  it('enforces max 60-char meta title and max 155-char meta description', () => {
    const title = normalizeMetaTitle(
      'Banasura Mist Eco Villas Luxury Rainforest Pool Resort in Vythiri Wayanad Kerala India',
      'Banasura Mist Eco Villas',
      'Vythiri'
    );
    assert.ok(title.length <= 60);
    assert.ok(title.length >= 15);

    const desc = normalizeMetaDescription(
      'Book direct at Banasura Mist Eco Villas overlooking Banasura Sagar Dam in Vythiri, Wayanad with private plunge pools, organic Malabar breakfast, campfires, and zero OTA fees.',
      'Banasura Mist Eco Villas',
      'Vythiri',
      'Winter Deal: ₹2,000 Off'
    );
    assert.ok(desc.length <= 155);
    assert.ok(desc.length >= 40);
  });

  it('produces 10 hyperlocal Wayanad long-tail keywords', () => {
    const keywords = normalizeLongTailKeywords(
      ['pool resorts in vythiri', 'banasura dam villas'],
      'Banasura Mist Eco Villas',
      'Resort',
      'Vythiri',
      'private plunge pool, winter package'
    );
    assert.equal(keywords.length, 10);
    assert.ok(keywords.includes('pool resorts in vythiri'));
  });

  it('builds JSON-LD with sameAs and url linking external domain and internal listing', () => {
    const jsonLd = buildPartnerJsonLd({
      businessName: 'Banasura Mist Eco Villas',
      category: 'Resort',
      location: 'Vythiri',
      description: 'Lakefront eco villas near Banasura Dam.',
      priceRange: '₹5,400+',
      offers: 'Winter Deal: ₹2,000 + Breakfast',
      externalWebsiteUrl: 'https://banasuramist.example.com',
      internalListingUrl: 'https://wayanadstays.example.com/?listing=banasura-mist-villas',
      faqs: [
        {
          question: 'How close is the dam?',
          answer: '1.2 km from Banasura Sagar Dam.',
        },
      ],
    });

    const graph = jsonLd['@graph'] as Record<string, unknown>[];
    assert.equal(graph[0]['@type'], 'LodgingBusiness');
    assert.equal(graph[0].url, 'https://banasuramist.example.com/');
    assert.deepEqual(graph[0].sameAs, [
      'https://banasuramist.example.com/',
      'https://wayanadstays.example.com/?listing=banasura-mist-villas',
    ]);
    assert.equal(graph[1]['@type'], 'FAQPage');
  });

  it('generates contextual keyword-rich anchors and rotates cleanly', () => {
    const variants = buildContextualAnchors(
      'Banasura Mist Eco Villas',
      'Resort',
      'Vythiri',
      'Winter Deal: ₹2,000 + Breakfast'
    );
    assert.ok(variants.length >= 2);
    assert.ok(
      variants[0].includes('Official Booking Website') &&
        variants[0].includes('Banasura Mist Eco Villas') &&
        variants[0].includes('Vythiri')
    );
    assert.notEqual(pickRotatedAnchorText(variants, 'p1', 0), pickRotatedAnchorText(variants, 'p1', 1));
  });

  it('escapes inline script JSON safely against </script> breakout and builds dual-seo.js', () => {
    const escaped = serializeSafeForInlineScript({
      note: '</script><script>alert(1)</script>',
    });
    assert.equal(escaped.includes('</script>'), false);
    assert.ok(escaped.includes('\\u003c'));

    const sampleRecord: DualSeoConfigRecord = {
      partnerId: 'banasura-mist-villas',
      businessName: 'Banasura Mist Eco Villas',
      category: 'Resort',
      location: 'Vythiri',
      rawKeywords: 'plunge pool, lake view',
      description: 'Lakefront eco villas in Vythiri.',
      priceRange: '₹5,400+',
      offers: 'Winter Deal: ₹2,000 + Breakfast',
      internalListingUrl: 'https://wayanadstays.app/?listing=banasura-mist-villas',
      externalWebsiteUrl: 'https://banasuramist.example.com',
      metaTitle: 'Banasura Mist Eco Villas | Vythiri Pool Resort',
      metaDescription: 'Book lakefront eco villas in Vythiri near Banasura Dam.',
      longTailKeywords: ['vythiri pool resort', 'banasura dam stay'],
      faqs: [],
      jsonLdSchema: { '@context': 'https://schema.org', '@type': 'LodgingBusiness' },
      anchorTextVariants: [
        'Official Booking Website – Banasura Mist Eco Villas in Vythiri, Wayanad',
      ],
      activeAnchorIndex: 0,
      isProPartner: true,
      internalIndexStatus: 'Indexed',
      internalIndexedAt: '2026-11-23T00:00:00.000Z',
      externalSyncStatus: 'not_connected',
      externalSyncVerifiedAt: null,
      externalScriptPings: 0,
      lastSyncOrigin: null,
      externalIndexStatus: 'Pending',
      externalIndexedAt: null,
      lastIndexingReceipts: [],
      createdAt: '2026-11-23T00:00:00.000Z',
      updatedAt: '2026-11-23T00:00:00.000Z',
    };

    const snippet = buildEmbedScriptSnippet('https://api.yourdomain.com', 'PARTNER_123');
    assert.equal(
      snippet,
      '<script src="https://api.yourdomain.com/v1/dual-seo.js?partner_id=PARTNER_123" async></script>'
    );

    const js = buildDualSeoClientJsPayload(sampleRecord, 'https://api.yourdomain.com');
    assert.ok(js.includes('application/ld+json'));
    assert.ok(js.includes('og:title'));
    assert.ok(js.includes('canonical'));
    assert.ok(js.includes('\\u002fapi\\u002fseo\\u002fping'));
  });

  it('validates /api/seo/generate payload requirements', () => {
    const bad = validateDualSeoGenerateInput({
      business_name: 'Test',
      category: 'Resort',
      location: 'Vythiri',
      external_website_url: 'javascript:alert(1)',
    });
    assert.equal(bad.valid, false);

    const good = validateDualSeoGenerateInput({
      business_name: 'Misty Woods Canopy Resort',
      category: 'Resort',
      location: 'Vythiri',
      external_website_url: 'https://mistywoodsvythiri.example.com',
    });
    assert.equal(good.valid, true);
  });
});
