import type { Resort, WayanadLocation } from '../types/resort';
import { AMENITIES_CATALOG } from '../data/amenitiesCatalog';
import { extractKeywordsFromNotes } from './seoEngine';

export type HeatmapRegionId = Exclude<WayanadLocation, 'All Wayanad'> | 'Kalpetta';

export type HeatmapTier = 'Peak' | 'High' | 'Moderate' | 'Low';

export interface SeoGeoZonePoint {
  region: HeatmapRegionId;
  corridor: string;
  x: number; // Relative West -> East position across Wayanad (0 - 100)
  y: number; // Relative South -> North position across Wayanad (0 - 100)
  monthlySearches: number;
  intensity: number; // Normalized 0 - 100
  tier: HeatmapTier;
  growthPct: number;
  topKeyword: string;
  competition: 'Low' | 'Medium' | 'High';
  isHomeRegion: boolean;
}

export interface SeoKeywordGeoCell {
  keyword: string;
  region: HeatmapRegionId;
  monthlySearches: number;
  intensity: number;
  tier: HeatmapTier;
}

export interface SeoHeatmapDataset {
  resortId: string;
  resortName: string;
  homeRegion: HeatmapRegionId;
  keywords: string[];
  zones: SeoGeoZonePoint[];
  matrix: SeoKeywordGeoCell[];
  peakZone: SeoGeoZonePoint;
  totalMonthlyVolume: number;
}

interface BaseWayanadZone {
  region: HeatmapRegionId;
  corridor: string;
  x: number;
  y: number;
  baseDemand: number;
  growthPct: number;
  competition: 'Low' | 'Medium' | 'High';
  signatureSuffix: string;
}

export const WAYANAD_GEO_ZONES: readonly BaseWayanadZone[] = [
  {
    region: 'Vythiri',
    corridor: 'Pookode Lake & Lakkidi',
    x: 24,
    y: 28,
    baseDemand: 1480,
    growthPct: 38,
    competition: 'High',
    signatureSuffix: 'near Pookode Lake',
  },
  {
    region: 'Meppadi',
    corridor: 'Chembra Peak & Soochipara',
    x: 62,
    y: 24,
    baseDemand: 1240,
    growthPct: 31,
    competition: 'Medium',
    signatureSuffix: 'tea estate resorts',
  },
  {
    region: 'Kalpetta',
    corridor: 'Central Wayanad & Glass Bridge',
    x: 45,
    y: 44,
    baseDemand: 1120,
    growthPct: 26,
    competition: 'Medium',
    signatureSuffix: 'family stays',
  },
  {
    region: 'Sultan Bathery',
    corridor: 'Edakkal Caves & Muthanga',
    x: 78,
    y: 52,
    baseDemand: 940,
    growthPct: 22,
    competition: 'Low',
    signatureSuffix: 'near Edakkal Caves',
  },
  {
    region: 'Mananthavady',
    corridor: 'Kuruvadweep & Kabini River',
    x: 34,
    y: 74,
    baseDemand: 810,
    growthPct: 29,
    competition: 'Low',
    signatureSuffix: 'riverfront villas',
  },
  {
    region: 'Thirunelli',
    corridor: 'Brahmagiri & Temple Valley',
    x: 50,
    y: 89,
    baseDemand: 630,
    growthPct: 19,
    competition: 'Low',
    signatureSuffix: 'forest camp stays',
  },
] as const;

const REGION_AFFINITY: Record<HeatmapRegionId, Partial<Record<HeatmapRegionId, number>>> = {
  Vythiri: { Vythiri: 1.38, Kalpetta: 1.15, Meppadi: 1.08, Mananthavady: 0.88, 'Sultan Bathery': 0.84, Thirunelli: 0.72 },
  Meppadi: { Meppadi: 1.4, Vythiri: 1.16, Kalpetta: 1.1, 'Sultan Bathery': 0.94, Mananthavady: 0.8, Thirunelli: 0.7 },
  Kalpetta: { Kalpetta: 1.35, Vythiri: 1.2, Meppadi: 1.14, 'Sultan Bathery': 0.96, Mananthavady: 0.92, Thirunelli: 0.75 },
  'Sultan Bathery': { 'Sultan Bathery': 1.42, Meppadi: 1.05, Kalpetta: 1.08, Vythiri: 0.92, Mananthavady: 0.88, Thirunelli: 0.78 },
  Mananthavady: { Mananthavady: 1.42, Thirunelli: 1.24, Kalpetta: 1.02, Vythiri: 0.9, 'Sultan Bathery': 0.86, Meppadi: 0.76 },
  Thirunelli: { Thirunelli: 1.48, Mananthavady: 1.28, Kalpetta: 0.96, Vythiri: 0.85, 'Sultan Bathery': 0.82, Meppadi: 0.72 },
};

export function classifyHeatmapTier(intensity: number): HeatmapTier {
  if (intensity >= 82) return 'Peak';
  if (intensity >= 60) return 'High';
  if (intensity >= 38) return 'Moderate';
  return 'Low';
}

export function getHeatmapTileColors(tier: HeatmapTier): {
  fill: string;
  text: string;
  border: string;
  badgeBg: string;
} {
  switch (tier) {
    case 'Peak':
      return {
        fill: '#D97706',
        text: '#FFFFFF',
        border: '#B45309',
        badgeBg: '#FEF3C7',
      };
    case 'High':
      return {
        fill: '#065F46',
        text: '#FFFFFF',
        border: '#044E3A',
        badgeBg: '#D1FAE5',
      };
    case 'Moderate':
      return {
        fill: '#34D399',
        text: '#022C22',
        border: '#10B981',
        badgeBg: '#ECFDF5',
      };
    case 'Low':
    default:
      return {
        fill: '#D1FAE5',
        text: '#065F46',
        border: '#A7F3D0',
        badgeBg: '#F8FAFC',
      };
  }
}

function deterministicJitter(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 10007;
  }
  return 0.9 + (hash % 23) / 100; // 0.90 .. 1.12
}

export function buildResortHeatmapKeywords(
  resort: Resort,
  ownerNotes: string
): string[] {
  const fromNotes = extractKeywordsFromNotes(ownerNotes, resort.location);
  const amenityTerms = resort.amenities
    .slice(0, 3)
    .map((key) => {
      const def = AMENITIES_CATALOG[key];
      return def ? `${def.label.toLowerCase()} ${resort.location.toLowerCase()}` : null;
    })
    .filter((v): v is string => Boolean(v));

  const baseTerms = [
    `resorts in ${resort.location.toLowerCase()}`,
    `direct booking wayanad resort`,
    ...amenityTerms,
    ...fromNotes,
  ];

  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const term of baseTerms) {
    const clean = term.trim();
    const key = clean.toLowerCase();
    if (!clean || seen.has(key)) continue;
    seen.add(key);
    deduped.push(clean);
    if (deduped.length >= 5) break;
  }
  return deduped;
}

export function buildSeoHeatmapData(
  resort: Resort,
  ownerNotes: string,
  selectedKeyword?: string | null
): SeoHeatmapDataset {
  const keywords = buildResortHeatmapKeywords(resort, ownerNotes);
  const homeRegion: HeatmapRegionId = resort.location;
  const affinityMap = REGION_AFFINITY[homeRegion] ?? REGION_AFFINITY.Vythiri;

  const matrix: SeoKeywordGeoCell[] = [];
  const rawZoneTotals = new Map<HeatmapRegionId, number>();

  for (const zone of WAYANAD_GEO_ZONES) {
    const affinity = affinityMap[zone.region] ?? 1.0;
    let zoneTotal = 0;

    keywords.forEach((kw, kwIdx) => {
      const kwWeight = Math.max(0.55, 1.12 - kwIdx * 0.12);
      const regionMatchBoost = kw.toLowerCase().includes(zone.region.toLowerCase())
        ? 1.24
        : 1.0;
      const jitter = deterministicJitter(`${resort.id}:${zone.region}:${kw}`);
      const monthlySearches = Math.round(
        (zone.baseDemand / 3.4) * affinity * kwWeight * regionMatchBoost * jitter
      );
      zoneTotal += monthlySearches;
      matrix.push({
        keyword: kw,
        region: zone.region,
        monthlySearches,
        intensity: 0,
        tier: 'Low',
      });
    });

    rawZoneTotals.set(zone.region, zoneTotal);
  }

  // Filter totals if a specific keyword is focused
  const activeTotals = new Map<HeatmapRegionId, number>();
  for (const zone of WAYANAD_GEO_ZONES) {
    if (selectedKeyword && keywords.includes(selectedKeyword)) {
      const cell = matrix.find(
        (c) => c.region === zone.region && c.keyword === selectedKeyword
      );
      activeTotals.set(zone.region, cell?.monthlySearches ?? 0);
    } else {
      activeTotals.set(zone.region, rawZoneTotals.get(zone.region) ?? 0);
    }
  }

  const maxActiveVolume = Math.max(1, ...Array.from(activeTotals.values()));
  const minActiveVolume = Math.min(...Array.from(activeTotals.values()));
  const span = Math.max(1, maxActiveVolume - minActiveVolume);

  const maxCellVolume = Math.max(1, ...matrix.map((c) => c.monthlySearches));
  for (const cell of matrix) {
    const intensity = Math.round((cell.monthlySearches / maxCellVolume) * 100);
    cell.intensity = intensity;
    cell.tier = classifyHeatmapTier(intensity);
  }

  const zones: SeoGeoZonePoint[] = WAYANAD_GEO_ZONES.map((zone) => {
    const monthlySearches = activeTotals.get(zone.region) ?? 0;
    const normalized =
      minActiveVolume === maxActiveVolume
        ? 100
        : Math.round(28 + ((monthlySearches - minActiveVolume) / span) * 72);
    const tier = classifyHeatmapTier(normalized);
    const bestCellForZone = matrix
      .filter((c) => c.region === zone.region)
      .sort((a, b) => b.monthlySearches - a.monthlySearches)[0];

    return {
      region: zone.region,
      corridor: zone.corridor,
      x: zone.x,
      y: zone.y,
      monthlySearches,
      intensity: normalized,
      tier,
      growthPct: zone.growthPct,
      topKeyword:
        selectedKeyword && keywords.includes(selectedKeyword)
          ? selectedKeyword
          : bestCellForZone?.keyword ?? `${zone.region} ${zone.signatureSuffix}`,
      competition: zone.competition,
      isHomeRegion: zone.region === homeRegion,
    };
  });

  const peakZone = [...zones].sort(
    (a, b) => b.monthlySearches - a.monthlySearches
  )[0];
  const totalMonthlyVolume = zones.reduce((sum, z) => sum + z.monthlySearches, 0);

  return {
    resortId: resort.id,
    resortName: resort.name,
    homeRegion,
    keywords,
    zones,
    matrix,
    peakZone,
    totalMonthlyVolume,
  };
}
