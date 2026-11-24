import type { UserRatingEntry } from '../types/resort';

export const RATING_LABELS: Record<number, string> = {
  1: 'Needs Improvement',
  2: 'Fair',
  3: 'Good Stay',
  4: 'Very Good',
  5: 'Exceptional',
};

export function validateUserRatingInput(
  stars: number,
  comment: string
): { valid: boolean; error?: string } {
  if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
    return { valid: false, error: 'Please select a rating between 1 and 5 stars.' };
  }
  if (comment.trim().length > 400) {
    return { valid: false, error: 'Please keep your review note under 400 characters.' };
  }
  return { valid: true };
}

export function computeUpdatedRating(
  baseRating: number,
  baseCount: number,
  userRatings: UserRatingEntry[]
): {
  averageRating: number;
  totalReviews: number;
} {
  const safeBaseCount = Math.max(0, baseCount);
  if (userRatings.length === 0) {
    return {
      averageRating: Number(baseRating.toFixed(1)),
      totalReviews: safeBaseCount,
    };
  }
  const userSum = userRatings.reduce((acc, item) => acc + item.stars, 0);
  const totalCount = safeBaseCount + userRatings.length;
  const weightedTotal = baseRating * safeBaseCount + userSum;
  return {
    averageRating: Number((weightedTotal / totalCount).toFixed(1)),
    totalReviews: totalCount,
  };
}
