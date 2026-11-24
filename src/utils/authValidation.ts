import type { PartnerAccount, PartnerCategory } from '../types/resort';

export type SignupAccountRole =
  | 'Tourist'
  | 'Resort owner'
  | 'Restaurant'
  | 'Tour agency';

export const PARTNER_CATEGORY_OPTIONS: {
  id: PartnerCategory;
  label: string;
  shortDesc: string;
}[] = [
  { id: 'resort', label: 'Resorts', shortDesc: 'Eco-villas, treehouses & estate stays' },
  { id: 'budget_hotel', label: 'Budget Hotels', shortDesc: 'Clean A/C & Non-A/C rooms' },
  { id: 'restaurant', label: 'Restaurants', shortDesc: 'Kerala meals, dining & cafes' },
  { id: 'tour', label: 'Book a Tour', shortDesc: '4x4 jeep safaris, treks & cabs' },
  { id: 'events', label: 'Events & Tickets', shortDesc: 'Fests, entry passes & stalls' },
];

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  percent: 0 | 25 | 50 | 75 | 100;
  label:
    | 'Use 8+ characters, a number and mixed case'
    | 'Too short'
    | 'Weak'
    | 'Fair'
    | 'Good'
    | 'Strong';
  tone: 'neutral' | 'red' | 'amber' | 'emerald';
  hasMinLength: boolean;
  hasMixedCase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
}

export function evaluatePasswordStrength(
  password: string
): PasswordStrengthResult {
  const hasMinLength = password.length >= 8;
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (password.length === 0) {
    return {
      score: 0,
      percent: 0,
      label: 'Use 8+ characters, a number and mixed case',
      tone: 'neutral',
      hasMinLength,
      hasMixedCase,
      hasNumber,
      hasSymbol,
    };
  }

  let rawScore = 0;
  if (hasMinLength) rawScore += 1;
  if (hasMixedCase) rawScore += 1;
  if (hasNumber) rawScore += 1;
  if (hasSymbol) rawScore += 1;

  const score = Math.min(4, Math.max(0, rawScore)) as 0 | 1 | 2 | 3 | 4;
  const percent = (score === 0 ? 25 : score * 25) as 25 | 50 | 75 | 100;

  if (!hasMinLength) {
    return {
      score,
      percent: 25,
      label: 'Too short',
      tone: 'red',
      hasMinLength,
      hasMixedCase,
      hasNumber,
      hasSymbol,
    };
  }

  if (score <= 1) {
    return {
      score,
      percent: 25,
      label: 'Weak',
      tone: 'red',
      hasMinLength,
      hasMixedCase,
      hasNumber,
      hasSymbol,
    };
  }

  if (score === 2) {
    return {
      score,
      percent: 50,
      label: 'Fair',
      tone: 'amber',
      hasMinLength,
      hasMixedCase,
      hasNumber,
      hasSymbol,
    };
  }

  if (score === 3) {
    return {
      score,
      percent: 75,
      label: 'Good',
      tone: 'emerald',
      hasMinLength,
      hasMixedCase,
      hasNumber,
      hasSymbol,
    };
  }

  return {
    score: 4,
    percent: 100,
    label: 'Strong',
    tone: 'emerald',
    hasMinLength,
    hasMixedCase,
    hasNumber,
    hasSymbol,
  };
}

export function extractMobileDigits(mobile: string): string {
  return mobile.replace(/\D/g, '');
}

export function isValidMobileNumber(mobile: string): boolean {
  const trimmed = mobile.trim();
  if (!trimmed || /[^0-9+\s\-()]/.test(trimmed)) return false;
  const digits = extractMobileDigits(trimmed);
  return digits.length >= 10 && digits.length <= 14;
}

export function isValidPhoneOrEmail(contact: string): boolean {
  const trimmed = contact.trim();
  if (!trimmed) return false;
  if (trimmed.includes('@')) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  }
  return isValidMobileNumber(trimmed);
}

export function canAccessPartnerDashboard(
  account: PartnerAccount | null
): boolean {
  return Boolean(
    account &&
      account.businessName.trim().length > 0 &&
      (account.email.trim().length > 0 || account.phone.trim().length > 0)
  );
}
