import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_RESORTS } from '../data/mockWayanadData.ts';
import {
  buildSeoHeatmapData,
  classifyHeatmapTier,
  getHeatmapTileColors,
  WAYANAD_GEO_ZONES,
} from './seoHeatmap.ts';

describe('SEO Heatmap Geographical Calculations', () => {
  it('generates heatmap data across all 6 Wayanad geographical zones', () => {
    const resort = INITIAL_RESORTS[1]; // Banasura Mist Eco Villas (Vythiri)
    const dataset = buildSeoHeatmapData(
      resort,
      'private plunge pool, lake view eco villa, Banasura dam kayaking'
    );

    assert.equal(dataset.zones.length, WAYANAD_GEO_ZONES.length);
    assert.equal(dataset.keywords.length, 5);
    assert.equal(dataset.matrix.length, 30);
    assert.equal(dataset.homeRegion, 'Vythiri');
    assert.equal(dataset.peakZone.region, 'Vythiri');
    assert.ok(dataset.totalMonthlyVolume > 0);
  });

  it('adapts peak search volume and keyword filtering when switching resorts or keywords', () => {
    const meppadiResort = INITIAL_RESORTS.find((r) => r.location === 'Meppadi')!;
    const allKeywords = buildSeoHeatmapData(meppadiResort, 'chembra peak tea estate');
    assert.equal(allKeywords.peakZone.region, 'Meppadi');

    const singleKeyword = buildSeoHeatmapData(
      meppadiResort,
      'chembra peak tea estate',
      allKeywords.keywords[0]
    );
    assert.ok(singleKeyword.totalMonthlyVolume < allKeywords.totalMonthlyVolume);
    assert.equal(singleKeyword.zones[0].topKeyword, allKeywords.keywords[0]);
  });

  it('classifies heat tiers and maps distinct accessible colors', () => {
    assert.equal(classifyHeatmapTier(90), 'Peak');
    assert.equal(classifyHeatmapTier(70), 'High');
    assert.equal(classifyHeatmapTier(45), 'Moderate');
    assert.equal(classifyHeatmapTier(20), 'Low');

    assert.equal(getHeatmapTileColors('Peak').fill, '#D97706');
    assert.equal(getHeatmapTileColors('High').fill, '#065F46');
  });
});
