import test from 'node:test';
import assert from 'node:assert/strict';
import { computeUpdatedRating, validateUserRatingInput } from './userRatings';

test('validateUserRatingInput enforces 1-5 star range', () => {
  assert.equal(validateUserRatingInput(0, 'Great').valid, false);
  assert.equal(validateUserRatingInput(6, 'Great').valid, false);
  assert.equal(validateUserRatingInput(5, 'Amazing hospitality').valid, true);
  assert.equal(validateUserRatingInput(4, '').valid, true);
});

test('computeUpdatedRating recalculates weighted rating average and review count', () => {
  const base = computeUpdatedRating(4.8, 10, []);
  assert.equal(base.averageRating, 4.8);
  assert.equal(base.totalReviews, 10);

  const updated = computeUpdatedRating(4.0, 2, [
    {
      id: 'r1',
      authorName: 'Meera',
      stars: 5,
      comment: 'Loved the stay',
      createdAt: '2026-11-24',
    },
    {
      id: 'r2',
      authorName: 'Rahul',
      stars: 5,
      comment: 'Clean rooms',
      createdAt: '2026-11-24',
    },
  ]);
  // (4.0 * 2 + 5 + 5) / 4 = 18 / 4 = 4.5
  assert.equal(updated.averageRating, 4.5);
  assert.equal(updated.totalReviews, 4);
});
