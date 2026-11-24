import assert from 'node:assert/strict';
import test from 'node:test';
import { INITIAL_RESORTS } from '../data/mockWayanadData';
import {
  buildResortComparisonMatrix,
  MAX_COMPARE_RESORTS,
  toggleCompareResort,
} from './resortCompare';

test('toggleCompareResort adds up to 3 resorts and enforces max limit', () => {
  let ids: string[] = [];

  const r1 = toggleCompareResort(ids, 'misty-woods-vythiri');
  assert.equal(r1.added, true);
  assert.equal(r1.limitReached, false);
  ids = r1.nextIds;

  const r2 = toggleCompareResort(ids, 'banasura-mist-villas');
  assert.equal(r2.added, true);
  ids = r2.nextIds;

  const r3 = toggleCompareResort(ids, 'chembra-ridge-retreat');
  assert.equal(r3.added, true);
  ids = r3.nextIds;
  assert.equal(ids.length, MAX_COMPARE_RESORTS);

  // Attempting to add a 4th should return limitReached without mutating
  const r4 = toggleCompareResort(ids, 'canopy-nest-treehouses');
  assert.equal(r4.added, false);
  assert.equal(r4.limitReached, true);
  assert.deepEqual(r4.nextIds, ids);

  // Toggling an existing ID removes it cleanly
  const removeSecond = toggleCompareResort(ids, 'banasura-mist-villas');
  assert.equal(removeSecond.removed, true);
  assert.equal(removeSecond.limitReached, false);
  assert.deepEqual(removeSecond.nextIds, [
    'misty-woods-vythiri',
    'chembra-ridge-retreat',
  ]);
});

test('buildResortComparisonMatrix identifies best price, top rated, and union amenities', () => {
  const matrix = buildResortComparisonMatrix(INITIAL_RESORTS, [
    'misty-woods-vythiri',
    'banasura-mist-villas',
    'chembra-ridge-retreat',
  ]);

  assert.equal(matrix.resorts.length, 3);
  assert.equal(matrix.bestPriceResortId, 'banasura-mist-villas'); // ₹5,400 < ₹6,800 < ₹7,200
  assert.equal(matrix.topRatedResortId, 'misty-woods-vythiri'); // 4.9 (214) > 4.9 (142) > 4.8 (176)
  assert.equal(matrix.mostAmenitiesResortId, 'misty-woods-vythiri'); // 6 > 5
  assert.ok(matrix.amenityRows.includes('treehouse'));
  assert.ok(matrix.amenityRows.includes('pool'));
});

test('buildResortComparisonMatrix handles single resort or unknown IDs gracefully', () => {
  const single = buildResortComparisonMatrix(INITIAL_RESORTS, [
    'unknown-id',
    'misty-woods-vythiri',
  ]);

  assert.equal(single.resorts.length, 1);
  assert.equal(single.bestPriceResortId, null);
  assert.equal(single.topRatedResortId, null);
  assert.ok(single.amenityRows.length >= 1);
});
