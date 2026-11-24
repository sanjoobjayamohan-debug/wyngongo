import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addDaysIso,
  calculateNights,
  formatDateShort,
  getDefaultDateRange,
  validateDateRange,
} from './bookingDates';

test('calculateNights computes exact night count for valid check-in/check-out', () => {
  assert.equal(calculateNights('2026-11-26', '2026-11-29'), 3);
  assert.equal(calculateNights('2026-11-30', '2026-12-02'), 2);
});

test('calculateNights returns 0 for inverted or same-day dates', () => {
  assert.equal(calculateNights('2026-11-26', '2026-11-26'), 0);
  assert.equal(calculateNights('2026-11-28', '2026-11-26'), 0);
});

test('validateDateRange returns descriptive error when check-out is not after check-in', () => {
  const invalid = validateDateRange('2026-12-05', '2026-12-03');
  assert.equal(invalid.valid, false);
  assert.equal(invalid.nights, 0);
  assert.ok(invalid.error);

  const valid = validateDateRange('2026-12-05', '2026-12-08');
  assert.equal(valid.valid, true);
  assert.equal(valid.nights, 3);
});

test('getDefaultDateRange yields a 2-night default window starting 2 days out', () => {
  const base = new Date(2026, 10, 23); // Nov 23, 2026
  const range = getDefaultDateRange(base);
  assert.equal(range.today, '2026-11-23');
  assert.equal(range.checkIn, '2026-11-25');
  assert.equal(range.checkOut, '2026-11-27');
  assert.equal(calculateNights(range.checkIn, range.checkOut), 2);
});

test('addDaysIso and formatDateShort format dates cleanly across month boundaries', () => {
  assert.equal(addDaysIso('2026-11-29', 3), '2026-12-02');
  assert.equal(formatDateShort('2026-12-02'), '2 Dec 2026');
});
