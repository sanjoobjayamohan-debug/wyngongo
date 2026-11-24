export const PREMIUM_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const RESORT_CARD_DURATION_SEC = 0.32;
export const DASHBOARD_WIDGET_DURATION_SEC = 0.34;
export const STAGGER_STEP_SEC = 0.045;
export const MAX_STAGGER_INDEX = 8;

export function getStaggerDelay(index: number, stepSec = STAGGER_STEP_SEC): number {
  const safeIndex = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0;
  return Math.min(safeIndex, MAX_STAGGER_INDEX) * stepSec;
}

export function buildCardEntranceTransition(index: number) {
  return {
    duration: RESORT_CARD_DURATION_SEC,
    delay: getStaggerDelay(index),
    ease: PREMIUM_EASE,
  };
}

export function buildWidgetEntranceTransition(index = 0) {
  return {
    duration: DASHBOARD_WIDGET_DURATION_SEC,
    delay: getStaggerDelay(index, 0.05),
    ease: PREMIUM_EASE,
  };
}

export const SUBTLE_ENTRANCE_INITIAL = {
  opacity: 0,
  y: 12,
} as const;

export const SUBTLE_ENTRANCE_VISIBLE = {
  opacity: 1,
  y: 0,
} as const;

export const DASHBOARD_VIEWPORT_CONFIG = {
  once: true,
  amount: 0.02,
} as const;
