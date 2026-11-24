import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSeoChecklist, sliceVisibleAmenities } from './seoChecklist';
import { optimizeResortSeo } from './seoEngine';
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
  reviewCount: 142,
  hasVideoTour: true,
  videoLabel: '30s Tour',
  primaryImage: '/src/assets/images/resort_banasura_villa_1795504229875.jpg',
  imageAltText: '',
  galleryImages: ['/src/assets/images/resort_banasura_villa_1795504229875.jpg'],
  description: 'Eco villas near Banasura Dam.',
  amenities: ['pool', 'campfire', 'jeep_safari', 'dining', 'wifi', 'ayurveda_spa'],
  maxAmenitiesVisible: 4,
  whatsappNumber: '919847044556',
  upiId: 'banasuramist@okicici',
  directBookingUrl: 'https://banasuramist.in',
  faqs: [],
};

test('evaluateSeoChecklist tracks incomplete meta & alt-text and reaches 100% when completed', () => {
  const seo = optimizeResortSeo(sampleResort, 'private plunge pool');
  const initial = evaluateSeoChecklist(sampleResort, seo, false);

  assert.equal(initial.totalCount, 5);
  assert.equal(initial.completedCount, 3);
  assert.equal(initial.percent, 60);

  const updatedResort: Resort = {
    ...sampleResort,
    imageAltText: 'Banasura Mist Eco Villas plunge pool overlooking Banasura Dam in Vythiri',
  };
  const complete = evaluateSeoChecklist(updatedResort, seo, true);
  assert.equal(complete.completedCount, 5);
  assert.equal(complete.percent, 100);
});

test('sliceVisibleAmenities caps displayed amenities at maxVisible', () => {
  const capped = sliceVisibleAmenities(sampleResort.amenities, 4);
  assert.equal(capped.visible.length, 4);
  assert.equal(capped.totalCount, 6);
  assert.equal(capped.hiddenCount, 2);

  const all = sliceVisibleAmenities(sampleResort.amenities, 12);
  assert.equal(all.visible.length, 6);
  assert.equal(all.hiddenCount, 0);
});
