export interface DateRangeValidation {
  valid: boolean;
  nights: number;
  error?: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseIsoDateUtc(isoDate: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const [y, m, d] = isoDate.split('-').map(Number);
  const utc = Date.UTC(y, m - 1, d);
  const check = new Date(utc);
  if (
    check.getUTCFullYear() !== y ||
    check.getUTCMonth() !== m - 1 ||
    check.getUTCDate() !== d
  ) {
    return null;
  }
  return utc;
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysIso(isoDate: string, days: number): string {
  const utc = parseIsoDateUtc(isoDate);
  if (utc === null) return isoDate;
  const next = new Date(utc + days * MS_PER_DAY);
  const y = next.getUTCFullYear();
  const m = String(next.getUTCMonth() + 1).padStart(2, '0');
  const d = String(next.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDefaultDateRange(baseDate: Date = new Date()): {
  today: string;
  checkIn: string;
  checkOut: string;
} {
  const today = toIsoDate(baseDate);
  const checkIn = addDaysIso(today, 2);
  const checkOut = addDaysIso(checkIn, 2);
  return { today, checkIn, checkOut };
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const inUtc = parseIsoDateUtc(checkIn);
  const outUtc = parseIsoDateUtc(checkOut);
  if (inUtc === null || outUtc === null) return 0;
  const diff = Math.round((outUtc - inUtc) / MS_PER_DAY);
  return diff > 0 ? diff : 0;
}

export function validateDateRange(
  checkIn: string,
  checkOut: string
): DateRangeValidation {
  const inUtc = parseIsoDateUtc(checkIn);
  const outUtc = parseIsoDateUtc(checkOut);

  if (inUtc === null || outUtc === null) {
    return {
      valid: false,
      nights: 0,
      error: 'Select both check-in and check-out dates.',
    };
  }

  const nights = Math.round((outUtc - inUtc) / MS_PER_DAY);
  if (nights <= 0) {
    return {
      valid: false,
      nights: 0,
      error: 'Check-out date must be after check-in date.',
    };
  }

  return { valid: true, nights };
}

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatDateShort(isoDate: string): string {
  const utc = parseIsoDateUtc(isoDate);
  if (utc === null) return isoDate;
  const d = new Date(utc);
  return `${d.getUTCDate()} ${SHORT_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
