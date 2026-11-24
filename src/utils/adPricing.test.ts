import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AD_SLOT_CATALOG,
  calculateAdTariff,
  formatInr,
  isValidRedirectUrl,
  validateAdConfigs,
} from './adPricing';
import type { AdSlotConfig, AdSlotId } from '../types/resort';

function createBaseConfigs(): Record<AdSlotId, AdSlotConfig> {
  return {
    hero_slider: {
      selected: false,
      bannerUrl: '/src/assets/images/hero_misty_woods_vythiri_1795504229144.jpg',
      bannerFileName: 'hero.jpg',
      redirectUrl: 'https://banasuramist.in/book',
      headline: 'Monsoon Pool Retreat in Vythiri',
    },
    cross_promo: {
      selected: false,
      bannerUrl: '/src/assets/images/resort_banasura_villa_1795504229875.jpg',
      bannerFileName: 'cross.jpg',
      redirectUrl: 'https://banasuramist.in/offers',
      headline: 'Save ₹2,000 on Direct Lake Villa Bookings',
    },
    notification_bar: {
      selected: false,
      bannerUrl: '',
      bannerFileName: '',
      redirectUrl: 'https://banasuramist.in/flash',
      headline: 'Flash Offer: Free Kayaking + Breakfast at Banasura Mist',
    },
    directory_banner: {
      selected: false,
      bannerUrl: '/src/assets/images/hero_chembra_ridge_meppadi_1795504229570.jpg',
      bannerFileName: 'dir.jpg',
      redirectUrl: 'https://banasuramist.in/direct',
      headline: 'Book Direct & Skip OTA Fees',
    },
  };
}

test('calculateAdTariff sums selected weekly slot tariffs accurately', () => {
  const configs = createBaseConfigs();
  configs.hero_slider.selected = true; // 1500
  configs.notification_bar.selected = true; // 500

  const summary = calculateAdTariff(configs, AD_SLOT_CATALOG);
  assert.equal(summary.slotCount, 2);
  assert.equal(summary.totalWeeklyInr, 2000);
  assert.equal(summary.estimatedWeeklyImpressions, 8400 + 11200);
});

test('calculateAdTariff returns 0 when all slots are unselected', () => {
  const configs = createBaseConfigs();
  const summary = calculateAdTariff(configs, AD_SLOT_CATALOG);
  assert.equal(summary.slotCount, 0);
  assert.equal(summary.totalWeeklyInr, 0);
});

test('isValidRedirectUrl accepts https, http, and upi deep links', () => {
  assert.equal(isValidRedirectUrl('https://banasuramist.in/book'), true);
  assert.equal(isValidRedirectUrl('upi://pay?pa=resort@okicici&pn=Resort'), true);
  assert.equal(isValidRedirectUrl('not-a-url'), false);
  assert.equal(isValidRedirectUrl(''), false);
});

test('validateAdConfigs flags missing banner or invalid URL on selected slots', () => {
  const configs = createBaseConfigs();
  const emptyCheck = validateAdConfigs(configs);
  assert.equal(emptyCheck.valid, false);
  assert.ok(emptyCheck.generalError);

  configs.hero_slider.selected = true;
  configs.hero_slider.redirectUrl = 'invalid-link';
  const urlCheck = validateAdConfigs(configs);
  assert.equal(urlCheck.valid, false);
  assert.ok(urlCheck.errors.hero_slider);

  configs.hero_slider.redirectUrl = 'https://banasuramist.in/book';
  const validCheck = validateAdConfigs(configs);
  assert.equal(validCheck.valid, true);
});

test('formatInr formats Indian Rupee values with proper grouping', () => {
  assert.equal(formatInr(1500), '₹1,500');
  assert.equal(formatInr(3400), '₹3,400');
});
