import { AMENITY_KEYS } from '../data/amenitiesCatalog';
import type { AmenityKey, Resort } from '../types/resort';

export const MAX_COMPARE_RESORTS = 3;

export interface ToggleCompareResult {
  nextIds: string[];
  added: boolean;
  removed: boolean;
  limitReached: boolean;
}

export function toggleCompareResort(
  selectedIds: string[],
  resortId: string,
  maxCount: number = MAX_COMPARE_RESORTS
): ToggleCompareResult {
  if (selectedIds.includes(resortId)) {
    return {
      nextIds: selectedIds.filter((id) => id !== resortId),
      added: false,
      removed: true,
      limitReached: false,
    };
  }

  if (selectedIds.length >= maxCount) {
    return {
      nextIds: selectedIds,
      added: false,
      removed: false,
      limitReached: true,
    };
  }

  return {
    nextIds: [...selectedIds, resortId],
    added: true,
    removed: false,
    limitReached: false,
  };
}

export interface ResortComparisonMatrix {
  resorts: Resort[];
  bestPriceResortId: string | null;
  topRatedResortId: string | null;
  mostAmenitiesResortId: string | null;
  amenityRows: AmenityKey[];
}

export function buildResortComparisonMatrix(
  allResorts: Resort[],
  selectedIds: string[]
): ResortComparisonMatrix {
  const resortMap = new Map(allResorts.map((r) => [r.id, r]));
  const selectedResorts: Resort[] = [];

  for (const id of selectedIds) {
    const match = resortMap.get(id);
    if (match && !selectedResorts.some((r) => r.id === match.id)) {
      selectedResorts.push(match);
    }
    if (selectedResorts.length >= MAX_COMPARE_RESORTS) break;
  }

  if (selectedResorts.length === 0) {
    return {
      resorts: [],
      bestPriceResortId: null,
      topRatedResortId: null,
      mostAmenitiesResortId: null,
      amenityRows: [],
    };
  }

  let bestPriceResortId: string | null = null;
  let topRatedResortId: string | null = null;
  let mostAmenitiesResortId: string | null = null;

  if (selectedResorts.length >= 2) {
    const sortedByPrice = [...selectedResorts].sort(
      (a, b) => a.pricePerNight - b.pricePerNight
    );
    if (sortedByPrice[0].pricePerNight < sortedByPrice[1].pricePerNight) {
      bestPriceResortId = sortedByPrice[0].id;
    }

    const sortedByRating = [...selectedResorts].sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    });
    if (
      sortedByRating[0].rating > sortedByRating[1].rating ||
      (sortedByRating[0].rating === sortedByRating[1].rating &&
        sortedByRating[0].reviewCount > sortedByRating[1].reviewCount)
    ) {
      topRatedResortId = sortedByRating[0].id;
    }

    const sortedByAmenities = [...selectedResorts].sort(
      (a, b) => b.amenities.length - a.amenities.length
    );
    if (sortedByAmenities[0].amenities.length > sortedByAmenities[1].amenities.length) {
      mostAmenitiesResortId = sortedByAmenities[0].id;
    }
  }

  const presentAmenities = new Set<AmenityKey>();
  for (const resort of selectedResorts) {
    for (const key of resort.amenities) {
      presentAmenities.add(key);
    }
  }

  const amenityRows = AMENITY_KEYS.filter((key) => presentAmenities.has(key));

  return {
    resorts: selectedResorts,
    bestPriceResortId,
    topRatedResortId,
    mostAmenitiesResortId,
    amenityRows,
  };
}
