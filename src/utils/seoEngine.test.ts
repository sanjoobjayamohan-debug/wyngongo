import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDesignerWhatsappHref,
  buildSimpleGooglePreview,
  extractKeywordsFromNotes,
  optimizeResortSeo,
} from './seoEngine';
import type { Resort } from '../types/resort';

const sampleResort: Resort = {
  id: 'banasura-mist',
  name: 'Banasura Mist Eco Villas',
  location: 'Vythiri',
  landmarkDistance: '1.2 km from Banasura Sagar Dam',
  pricePerNight: 5400,
  verified: true,
  offerPill: 'Winter Deal: ₹2,000 + Breakfast',
  rating: 4.9,
  reviewCount: 128,
  hasVideoTour: true,
  primaryImage: '/src/assets/images/resort_banasura_villa_1795504229875.jpg',
  galleryImages: ['/src/assets/images/resort_banasura_villa_1795504229875.jpg'],
  description: 'Eco villas near Banasura Dam.',
  amenities: ['pool', 'campfire', 'dining'],
  whatsappNumber: '919847012345',
  upiId: 'banasuramist@okaxis',
  directBookingUrl: 'https://banasuramist.in',
  faqs: [],
};

test('extractKeywordsFromNotes combines owner keywords with Wayanad location terms', () => {
  const keywords = extractKeywordsFromNotes(
    'heated plunge pool, honeymoon villa, kayaking',
    'Vythiri'
  );
  assert.ok(keywords.includes('heated plunge pool'));
  assert.ok(keywords.includes('honeymoon villa'));
  assert.ok(keywords.includes('vythiri family stay'));
  assert.ok(keywords.length <= 8);
});

test('optimizeResortSeo upgrades score and builds valid LodgingBusiness JSON-LD', () => {
  const baseline = optimizeResortSeo(sampleResort, '');
  assert.equal(baseline.seoScore, 82);
  assert.equal(baseline.schemaActive, true);
  assert.equal(baseline.indexingStatus, 'Indexed 2 hrs ago');

  const optimized = optimizeResortSeo(
    sampleResort,
    'private plunge pool, honeymoon lake view cottage, organic Kerala breakfast'
  );
  assert.ok(optimized.seoScore > baseline.seoScore);
  assert.equal(optimized.indexingStatus, 'Re-indexed just now');
  assert.ok(optimized.metaTitle.length <= 64);
  assert.ok(optimized.metaDescription.length <= 160);
  assert.equal(optimized.jsonLd['@type'], 'LodgingBusiness');
});

test('buildSimpleGooglePreview starts at 78/100 baseline and increases on Auto-Optimize', () => {
  const initial = buildSimpleGooglePreview({
    businessName: 'Poopoli Flower Fest',
    category: 'events',
    location: 'Ambalavayal',
    plainWords: 'Annual floral exhibition with food stalls and evening music.',
    offerText: 'Early Bird Entry ₹150',
    optimized: false,
  });
  assert.equal(initial.visibilityScore, 78);
  assert.match(initial.googleBreadcrumbUrl, /^wayngongo\.com/);
  assert.ok(initial.googleTitle.length <= 62);
  assert.ok(initial.googleDescription.length <= 155);

  const boosted = buildSimpleGooglePreview({
    businessName: 'Poopoli Flower Fest',
    category: 'events',
    location: 'Ambalavayal',
    plainWords: 'Annual floral exhibition with food stalls and evening music.',
    offerText: 'Early Bird Entry ₹150',
    optimized: true,
    externalWebsiteUrl: 'https://poopolifest.in',
  });
  assert.ok(boosted.visibilityScore > initial.visibilityScore);
  assert.equal(boosted.visibilityScore, 94);
});

test('buildDesignerWhatsappHref creates shareable WhatsApp link containing script tag', () => {
  const href = buildDesignerWhatsappHref(
    'Kabani Bamboo Cafe',
    '<script src="https://wayngongo.com/v1/dual-seo.js?partner_id=kabani" async></script>'
  );
  assert.ok(href.startsWith('https://wa.me/?text='));
  assert.match(decodeURIComponent(href), /Kabani Bamboo Cafe/);
  assert.match(decodeURIComponent(href), /dual-seo\.js/);
});
