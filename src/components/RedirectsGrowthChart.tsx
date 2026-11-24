import { motion } from 'motion/react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  buildWidgetEntranceTransition,
  SUBTLE_ENTRANCE_INITIAL,
  SUBTLE_ENTRANCE_VISIBLE,
} from '../utils/motionPresets';

export interface WeeklyRedirectPoint {
  weekLabel: string;
  dateRange: string;
  redirects: number;
  whatsappClicks: number;
}

const WEEKLY_REDIRECT_DATA_BY_RESORT: Record<string, WeeklyRedirectPoint[]> = {
  'banasura-mist-villas': [
    { weekLabel: 'Oct 25', dateRange: 'Oct 25 – Oct 31', redirects: 48, whatsappClicks: 31 },
    { weekLabel: 'Nov 01', dateRange: 'Nov 01 – Nov 07', redirects: 59, whatsappClicks: 38 },
    { weekLabel: 'Nov 08', dateRange: 'Nov 08 – Nov 14', redirects: 68, whatsappClicks: 44 },
    { weekLabel: 'Nov 15', dateRange: 'Nov 15 – Nov 21', redirects: 77, whatsappClicks: 52 },
    { weekLabel: 'Nov 22', dateRange: 'Nov 22 – Nov 23*', redirects: 90, whatsappClicks: 61 },
  ],
  'misty-woods-vythiri': [
    { weekLabel: 'Oct 25', dateRange: 'Oct 25 – Oct 31', redirects: 64, whatsappClicks: 42 },
    { weekLabel: 'Nov 01', dateRange: 'Nov 01 – Nov 07', redirects: 72, whatsappClicks: 49 },
    { weekLabel: 'Nov 08', dateRange: 'Nov 08 – Nov 14', redirects: 85, whatsappClicks: 58 },
    { weekLabel: 'Nov 15', dateRange: 'Nov 15 – Nov 21', redirects: 94, whatsappClicks: 63 },
    { weekLabel: 'Nov 22', dateRange: 'Nov 22 – Nov 23*', redirects: 112, whatsappClicks: 76 },
  ],
};

const DEFAULT_REDIRECT_SERIES: WeeklyRedirectPoint[] = [
  { weekLabel: 'Oct 25', dateRange: 'Oct 25 – Oct 31', redirects: 42, whatsappClicks: 26 },
  { weekLabel: 'Nov 01', dateRange: 'Nov 01 – Nov 07', redirects: 51, whatsappClicks: 33 },
  { weekLabel: 'Nov 08', dateRange: 'Nov 08 – Nov 14', redirects: 60, whatsappClicks: 39 },
  { weekLabel: 'Nov 15', dateRange: 'Nov 15 – Nov 21', redirects: 71, whatsappClicks: 46 },
  { weekLabel: 'Nov 22', dateRange: 'Nov 22 – Nov 23*', redirects: 84, whatsappClicks: 55 },
];

interface RedirectsGrowthChartProps {
  resortId: string;
  resortName: string;
}

export function RedirectsGrowthChart({
  resortId,
  resortName,
}: RedirectsGrowthChartProps) {
  const data = WEEKLY_REDIRECT_DATA_BY_RESORT[resortId] ?? DEFAULT_REDIRECT_SERIES;
  const total30d = data.reduce((sum, pt) => sum + pt.redirects, 0);
  const firstWeek = data[0]?.redirects ?? 1;
  const lastWeek = data[data.length - 1]?.redirects ?? firstWeek;
  const growthPct = Math.round(((lastWeek - firstWeek) / firstWeek) * 100);

  return (
    <motion.section
      aria-labelledby="weekly-redirects-chart-heading"
      data-testid="weekly-redirects-chart"
      initial={SUBTLE_ENTRANCE_INITIAL}
      animate={SUBTLE_ENTRANCE_VISIBLE}
      transition={buildWidgetEntranceTransition(2)}
      className="rounded-2xl border border-slate-200 bg-white p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2
            id="weekly-redirects-chart-heading"
            className="text-lg font-bold text-slate-900"
          >
            Weekly Booking Redirects (Last 30 Days)
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Direct WhatsApp, UPI &amp; official booking link clicks for {resortName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs tabular-nums">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full bg-emerald-800 inline-block"
              aria-hidden="true"
            />
            <span className="text-slate-600">Total Redirects</span>
            <span className="font-bold text-slate-900">{total30d} clicks</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"
              aria-hidden="true"
            />
            <span className="text-slate-600">WhatsApp Inquiries</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
            +{growthPct}% 30-day growth
          </span>
        </div>
      </div>

      <div className="mt-5 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 16, left: -12, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="weekLabel"
              tick={{ fill: '#475569', fontSize: 12 }}
              axisLine={{ stroke: '#CBD5E1' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#475569', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                borderRadius: '0.75rem',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
              }}
              labelFormatter={(label, payload) => {
                const row = payload?.[0]?.payload as WeeklyRedirectPoint | undefined;
                return row ? row.dateRange : String(label);
              }}
            />
            <Line
              type="monotone"
              dataKey="redirects"
              name="Weekly Booking Redirects"
              stroke="#065F46"
              strokeWidth={2.5}
              isAnimationActive={false}
              dot={{ r: 4, fill: '#065F46', strokeWidth: 2, stroke: '#FFFFFF' }}
              activeDot={{ r: 6, fill: '#065F46' }}
            />
            <Line
              type="monotone"
              dataKey="whatsappClicks"
              name="WhatsApp Direct Clicks"
              stroke="#D97706"
              strokeWidth={2}
              strokeDasharray="4 3"
              isAnimationActive={false}
              dot={{ r: 3.5, fill: '#D97706', strokeWidth: 2, stroke: '#FFFFFF' }}
              activeDot={{ r: 5, fill: '#D97706' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}
