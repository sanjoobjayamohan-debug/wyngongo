import { useMemo, useState } from 'react';
import { Compass, Flame, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import {
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';
import type { Resort } from '../types/resort';
import {
  buildWidgetEntranceTransition,
  DASHBOARD_VIEWPORT_CONFIG,
  SUBTLE_ENTRANCE_INITIAL,
  SUBTLE_ENTRANCE_VISIBLE,
} from '../utils/motionPresets';
import {
  buildSeoHeatmapData,
  getHeatmapTileColors,
  type HeatmapRegionId,
  type HeatmapTier,
  type SeoGeoZonePoint,
} from '../utils/seoHeatmap';

interface SeoHeatmapWidgetProps {
  resort: Resort;
  ownerSeoNotes: string;
  onBoostAreaKeyword: (keywordPhrase: string) => void;
}

const HEATMAP_LEGEND: Array<{ tier: HeatmapTier; range: string }> = [
  { tier: 'Low', range: 'Low' },
  { tier: 'Moderate', range: 'Moderate' },
  { tier: 'High', range: 'High' },
  { tier: 'Peak', range: 'Peak' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: SeoGeoZonePoint }>;
}

function GeoHeatmapTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const zone = payload[0].payload;
  const colors = getHeatmapTileColors(zone.tier);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs max-w-[230px]">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-slate-900">{zone.region}, Wayanad</span>
        <span
          className="px-2 py-0.5 rounded font-semibold text-[10px]"
          style={{ backgroundColor: colors.fill, color: colors.text }}
        >
          {zone.tier}
        </span>
      </div>
      <p className="text-[11px] text-slate-500 mt-0.5">{zone.corridor}</p>
      <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 tabular-nums">
        <div className="flex justify-between gap-3">
          <span className="text-slate-600">Search Volume</span>
          <span className="font-bold text-slate-900">
            {zone.monthlySearches.toLocaleString('en-IN')} / mo
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-600">Heat Score</span>
          <span className="font-semibold text-emerald-800">{zone.intensity}/100</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-slate-600">Seasonal Trend</span>
          <span className="font-semibold text-emerald-700">+{zone.growthPct}% YoY</span>
        </div>
      </div>
    </div>
  );
}

export function SeoHeatmapWidget({
  resort,
  ownerSeoNotes,
  onBoostAreaKeyword,
}: SeoHeatmapWidgetProps) {
  const [focusedKeyword, setFocusedKeyword] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<HeatmapRegionId | null>(null);
  const [boostNotice, setBoostNotice] = useState<string | null>(null);

  const dataset = useMemo(
    () => buildSeoHeatmapData(resort, ownerSeoNotes, focusedKeyword),
    [resort, ownerSeoNotes, focusedKeyword]
  );

  const activeZone =
    dataset.zones.find((z) => z.region === selectedRegion) ?? dataset.peakZone;

  const activeColors = getHeatmapTileColors(activeZone.tier);

  const handleTriggerBoost = (zone: SeoGeoZonePoint) => {
    const phrase = `${zone.topKeyword} ${zone.region.toLowerCase()}`;
    onBoostAreaKeyword(phrase);
    setBoostNotice(
      `Added "${phrase}" to AI SEO Agent and refreshed Wayanad metadata.`
    );
  };

  return (
    <motion.section
      aria-labelledby="seo-heatmap-heading"
      data-testid="seo-heatmap-widget"
      initial={SUBTLE_ENTRANCE_INITIAL}
      whileInView={SUBTLE_ENTRANCE_VISIBLE}
      viewport={DASHBOARD_VIEWPORT_CONFIG}
      transition={buildWidgetEntranceTransition(1)}
      className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5"
    >
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Geographical Demand Intelligence</span>
          </div>
          <h2
            id="seo-heatmap-heading"
            className="text-lg font-bold text-slate-900 mt-0.5"
          >
            SEO Heatmap — Wayanad Keyword Search Volume
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Highlights the Wayanad zones where{' '}
            <span className="font-semibold text-slate-800">{resort.name}</span>{' '}
            keywords generate the highest monthly search demand.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-semibold tabular-nums">
            <Flame className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
            <span>
              Peak: {dataset.peakZone.region} (
              {dataset.peakZone.monthlySearches.toLocaleString('en-IN')}/mo)
            </span>
          </div>

          {/* 4-Step Heat Scale Legend */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
            aria-label="Heatmap intensity scale"
          >
            {HEATMAP_LEGEND.map((item) => {
              const colors = getHeatmapTileColors(item.tier);
              return (
                <span key={item.tier} className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700">
                  <span
                    className="w-3 h-3 rounded-xs border"
                    style={{
                      backgroundColor: colors.fill,
                      borderColor: colors.border,
                    }}
                    aria-hidden="true"
                  />
                  <span>{item.range}</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Keyword Filter Strip */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-600 mr-1">
          Filter keyword:
        </span>
        <button
          type="button"
          onClick={() => {
            setFocusedKeyword(null);
            setBoostNotice(null);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
            focusedKeyword === null
              ? 'bg-[#065F46] border-[#065F46] text-white'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          All Resort Keywords
        </button>
        {dataset.keywords.map((kw) => {
          const active = focusedKeyword === kw;
          return (
            <button
              key={kw}
              type="button"
              onClick={() => {
                setFocusedKeyword(kw);
                setBoostNotice(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                active
                  ? 'bg-[#D1FAE5] border-[#065F46] text-[#065F46] font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {kw}
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Visualization: Recharts Geo Scatter Heatmap + Area/Keyword Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_1fr] gap-6 items-start">
        {/* Left: Recharts Geographical Search Volume Heatmap */}
        <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Wayanad Spatial Search Volume Map
              </h3>
              <p className="text-[11px] text-slate-500">
                Bubble size &amp; heat color reflect monthly search volume by geographical corridor
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-700 tabular-nums shrink-0">
              {dataset.totalMonthlyVolume.toLocaleString('en-IN')} total/mo
            </span>
          </div>

          <div className="relative h-72 w-full bg-white rounded-xl border border-slate-200/80 p-2">
            {/* Subtle Geographical Compass Watermark */}
            <div className="hidden sm:block pointer-events-none absolute top-2.5 right-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider z-10">
              North · Brahmagiri
            </div>
            <div className="hidden sm:block pointer-events-none absolute bottom-7 left-10 text-[10px] font-semibold text-slate-400 uppercase tracking-wider z-10">
              SW · Vythiri Ghat
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 28, right: 28, bottom: 16, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[10, 92]}
                  name="West to East"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={(v) => (v === 20 ? 'West' : v === 80 ? 'East' : '')}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[10, 100]}
                  name="South to North"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={(v) => (v === 20 ? 'South' : v === 90 ? 'North' : '')}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickLine={false}
                  width={42}
                />
                <ZAxis
                  type="number"
                  dataKey="monthlySearches"
                  range={[360, 1550]}
                  name="Monthly Searches"
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3', stroke: '#065F46' }}
                  content={<GeoHeatmapTooltip />}
                />
                <Scatter
                  name="Wayanad Zones"
                  data={dataset.zones}
                  isAnimationActive={false}
                  onClick={(point) => {
                    const payload = (point as unknown as { payload?: SeoGeoZonePoint })
                      ?.payload;
                    if (payload?.region) {
                      setSelectedRegion(payload.region);
                      setBoostNotice(null);
                    }
                  }}
                >
                  {dataset.zones.map((zone) => {
                    const colors = getHeatmapTileColors(zone.tier);
                    const isSelected = zone.region === activeZone.region;
                    return (
                      <Cell
                        key={zone.region}
                        fill={colors.fill}
                        fillOpacity={isSelected ? 0.96 : 0.84}
                        stroke={isSelected ? '#0F172A' : colors.border}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        className="cursor-pointer"
                      />
                    );
                  })}
                  <LabelList
                    dataKey="region"
                    position="top"
                    offset={10}
                    style={{
                      fill: '#0F172A',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Clickable Region Pills Summary */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {dataset.zones.map((zone) => {
              const colors = getHeatmapTileColors(zone.tier);
              const isSelected = zone.region === activeZone.region;
              return (
                <button
                  key={zone.region}
                  type="button"
                  data-testid={`heatmap-zone-btn-${zone.region}`}
                  onClick={() => {
                    setSelectedRegion(zone.region);
                    setBoostNotice(null);
                  }}
                  className={`text-left px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[#065F46] bg-[#D1FAE5]/40'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {zone.region}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: colors.fill }}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600 tabular-nums mt-0.5">
                    {zone.monthlySearches.toLocaleString('en-IN')} / mo
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Area × Keyword Intensity Matrix + Selected Zone Action Spotlight */}
        <div className="min-w-0 space-y-4">
          {/* Selected Zone Spotlight */}
          <div
            data-testid="heatmap-zone-spotlight"
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#065F46]" aria-hidden="true" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeZone.region} Corridor
                  </h3>
                  {activeZone.isHomeRegion && (
                    <span className="px-2 py-0.5 rounded bg-[#D1FAE5] text-[#065F46] text-[10px] font-bold">
                      Property Area
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{activeZone.corridor}</p>
              </div>
              <span
                className="px-2.5 py-1 rounded-md text-xs font-bold shrink-0"
                style={{
                  backgroundColor: activeColors.fill,
                  color: activeColors.text,
                }}
              >
                {activeZone.tier} Volume
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 tabular-nums">
              <div className="min-w-0 rounded-lg bg-white border border-slate-200/80 p-2.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">
                  Monthly Searches
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {activeZone.monthlySearches.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="min-w-0 rounded-lg bg-white border border-slate-200/80 p-2.5">
                <span className="block text-[10px] font-semibold text-slate-500 uppercase">
                  Demand Growth
                </span>
                <p className="text-sm font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>+{activeZone.growthPct}%</span>
                </p>
              </div>
              <div className="min-w-0 rounded-lg bg-white border border-slate-200/80 p-2.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">
                  Competition
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {activeZone.competition}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <p className="text-[11px] text-slate-600 truncate">
                Top query:{' '}
                <span className="font-semibold text-slate-900">
                  &ldquo;{activeZone.topKeyword}&rdquo;
                </span>
              </p>
              <button
                type="button"
                onClick={() => handleTriggerBoost(activeZone)}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#065F46] hover:bg-[#044E3A] text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Boost {activeZone.region} in AI SEO</span>
              </button>
            </div>

            {boostNotice && (
              <p
                role="status"
                className="text-[11px] font-semibold text-[#065F46] bg-[#D1FAE5]/60 border border-[#065F46]/20 rounded-lg px-3 py-1.5"
              >
                {boostNotice}
              </p>
            )}
          </div>

          {/* Geographical Area × Keyword Intensity Matrix */}
          <div className="min-w-0 rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                Keyword × Area Volume Matrix
              </span>
              <span className="text-[11px] text-slate-500">Monthly searches</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    <th className="py-2 px-3 font-semibold text-slate-600">Keyword</th>
                    {dataset.zones.map((z) => (
                      <th
                        key={z.region}
                        className="py-2 px-1.5 font-semibold text-slate-700 text-center whitespace-nowrap"
                      >
                        {z.region === 'Sultan Bathery' ? 'S. Bathery' : z.region}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dataset.keywords.map((kw) => (
                    <tr key={kw}>
                      <td className="py-2 px-3 font-medium text-slate-800 max-w-[140px] truncate">
                        {kw}
                      </td>
                      {dataset.zones.map((zone) => {
                        const cell = dataset.matrix.find(
                          (c) => c.keyword === kw && c.region === zone.region
                        );
                        if (!cell) return <td key={zone.region} />;
                        const colors = getHeatmapTileColors(cell.tier);
                        return (
                          <td key={zone.region} className="p-1 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRegion(zone.region);
                                setFocusedKeyword(kw);
                                setBoostNotice(null);
                              }}
                              title={`${kw} in ${zone.region}: ${cell.monthlySearches} monthly searches (${cell.tier})`}
                              className="w-full py-1 px-1 rounded font-bold tabular-nums transition-transform hover:scale-[1.04] cursor-pointer"
                              style={{
                                backgroundColor: colors.fill,
                                color: colors.text,
                              }}
                            >
                              {cell.monthlySearches}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
