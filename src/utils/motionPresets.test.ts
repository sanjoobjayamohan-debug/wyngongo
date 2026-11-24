import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCardEntranceTransition,
  buildWidgetEntranceTransition,
  DASHBOARD_WIDGET_DURATION_SEC,
  getStaggerDelay,
  MAX_STAGGER_INDEX,
  PREMIUM_EASE,
  RESORT_CARD_DURATION_SEC,
} from './motionPresets';

test('getStaggerDelay clamps negative indices to 0 and caps stagger delay at MAX_STAGGER_INDEX', () => {
  assert.equal(getStaggerDelay(-3), 0);
  assert.equal(getStaggerDelay(0), 0);
  assert.ok(getStaggerDelay(2) > getStaggerDelay(1));
  assert.equal(getStaggerDelay(MAX_STAGGER_INDEX + 10), getStaggerDelay(MAX_STAGGER_INDEX));
});

test('buildCardEntranceTransition and buildWidgetEntranceTransition return crisp compositor durations and easing curve', () => {
  const cardTx = buildCardEntranceTransition(3);
  assert.equal(cardTx.duration, RESORT_CARD_DURATION_SEC);
  assert.deepEqual(cardTx.ease, PREMIUM_EASE);
  assert.ok(cardTx.delay > 0 && cardTx.delay <= 0.4);

  const widgetTx = buildWidgetEntranceTransition(2);
  assert.equal(widgetTx.duration, DASHBOARD_WIDGET_DURATION_SEC);
  assert.deepEqual(widgetTx.ease, PREMIUM_EASE);
  assert.equal(widgetTx.delay, 0.1);
});
