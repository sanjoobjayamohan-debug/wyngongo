import type { AdSlotConfig, AdSlotDefinition, AdSlotId } from '../types/resort';

export const AD_SLOT_CATALOG: AdSlotDefinition[] = [
  {
    id: 'hero_slider',
    name: 'Top Hero Slider',
    description: 'Full-width spotlight carousel above all Wayngongo listings.',
    weeklyPriceInr: 1500,
    estimatedWeeklyImpressions: 8400,
    recommendedSize: '1600 × 500 px',
  },
  {
    id: 'cross_promo',
    name: 'Bottom Detail Page Ad',
    description: 'Featured cross-promotion card shown at the bottom of stay, dining, tour & event detail pages.',
    weeklyPriceInr: 800,
    estimatedWeeklyImpressions: 4200,
    recommendedSize: '960 × 540 px',
  },
  {
    id: 'notification_bar',
    name: 'Site Notification',
    description: 'Pinned top announcement strip visible across every screen.',
    weeklyPriceInr: 500,
    estimatedWeeklyImpressions: 11200,
    recommendedSize: 'Text + Direct Deal Link',
  },
  {
    id: 'directory_banner',
    name: 'Category Banner',
    description: 'High-visibility banner spotlight between directory & category rows.',
    weeklyPriceInr: 600,
    estimatedWeeklyImpressions: 3600,
    recommendedSize: '1200 × 320 px',
  },
];

export interface AdTariffSummary {
  selectedSlots: AdSlotDefinition[];
  totalWeeklyInr: number;
  estimatedWeeklyImpressions: number;
  slotCount: number;
}

export function calculateAdTariff(
  configs: Record<AdSlotId, AdSlotConfig>,
  catalog: AdSlotDefinition[] = AD_SLOT_CATALOG
): AdTariffSummary {
  const selectedSlots = catalog.filter((slot) => configs[slot.id]?.selected);
  const totalWeeklyInr = selectedSlots.reduce(
    (sum, slot) => sum + slot.weeklyPriceInr,
    0
  );
  const estimatedWeeklyImpressions = selectedSlots.reduce(
    (sum, slot) => sum + slot.estimatedWeeklyImpressions,
    0
  );

  return {
    selectedSlots,
    totalWeeklyInr,
    estimatedWeeklyImpressions,
    slotCount: selectedSlots.length,
  };
}

export function isValidRedirectUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('upi://pay?')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export interface AdValidationResult {
  valid: boolean;
  errors: Partial<Record<AdSlotId, string>>;
  generalError?: string;
}

export function validateAdConfigs(
  configs: Record<AdSlotId, AdSlotConfig>
): AdValidationResult {
  const errors: Partial<Record<AdSlotId, string>> = {};
  const selectedIds = (Object.keys(configs) as AdSlotId[]).filter(
    (id) => configs[id].selected
  );

  if (selectedIds.length === 0) {
    return {
      valid: false,
      errors,
      generalError: 'Select at least one ad placement slot to publish.',
    };
  }

  for (const id of selectedIds) {
    const cfg = configs[id];
    if (!isValidRedirectUrl(cfg.redirectUrl)) {
      errors[id] = 'Enter a valid https:// website URL or upi:// booking link.';
    } else if (id !== 'notification_bar' && !cfg.bannerUrl.trim()) {
      errors[id] = 'Select or upload a banner image for this slot.';
    } else if (id === 'notification_bar' && !cfg.headline.trim()) {
      errors[id] = 'Enter a short broadcast headline for the site notification.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
