import { cn, formatNum } from "@/lib/utils";
import { FreshnessBadge } from "./freshness-badge";
import { SourceBadge } from "./source-badge";
import type { CountryMetric } from "@/types";

const METRIC_CONTEXT: Record<string, string> = {
  mortality_u5:               'Deaths per 1,000 live births before age 5. Sub-Saharan Africa average: ~65.',
  maternal_mortality:         'Deaths per 100,000 live births. Global average: 223; sub-Saharan Africa: ~450.',
  life_expectancy:            'Average years a newborn is expected to live. Sub-Saharan Africa average: ~62 years.',
  gdp_growth:                 'Annual % change in national economic output. Global average: ~3%.',
  internet_access:            'Share of population using the internet. Africa average: ~43%.',
  poverty_215:                'Share of population living on less than $2.15/day. Global extreme poverty threshold.',
  gini:                       'Income inequality index 0–100. Higher = more unequal. Africa average: ~43.',
  water_access:               'Share using safely managed drinking water. Global average: ~74%.',
  electricity_access:         'Share of population with access to electricity. Sub-Saharan Africa average: ~47%.',
  women_in_parliament:        'Share of parliamentary seats held by women. Global average: ~27%.',
  female_labor_participation: 'Share of women ages 15+ who are employed or seeking work. Global average: ~47%.',
  school_enrollment_primary:  'Net % of primary school-age children attending school.',
  literacy_rate:              'Share of adults (15+) who can read and write. Africa average: ~70%.',
  co2_per_capita:             'Metric tonnes of CO₂ per person per year. Global average: ~4.7t.',
  political_stability:        'World Governance Indicators score 0–100. Higher = more stable. Normalized from -2.5/+2.5 scale.',
  undernourishment:           'Share of population with insufficient food intake. Africa average: ~20%.',
  forest_area:                '% of land covered by forest. Africa average: ~22%.',
  urban_population:           'Share of population living in urban areas. Africa average: ~44%.',
  renewable_electricity:      '% of electricity from renewable sources (hydro, solar, wind, geothermal).',
  health_expenditure:         'Government + private health spending as % of GDP. Global average: ~10%.',
  physicians_per_10k:         'Medical doctors per 10,000 people. Sub-Saharan Africa average: ~2.2.',
  hospital_beds:              'Hospital beds per 1,000 people. Sub-Saharan Africa average: ~1.3.',
  gdp_per_capita:             'GDP per person in current USD. Sub-Saharan Africa average: ~$1,700.',
  sanitation_access:          'Share using safely managed sanitation. Global average: ~57%.',
  mobile_subscriptions:       'SIM cards per 100 people (can exceed 100 due to multiple SIMs). Africa average: ~85.',
  access_to_finance:          '% of adults with a bank or mobile money account. Africa average: ~55%.',
  agricultural_land:          '% of land used for crops or livestock. Africa average: ~43%.',
  govt_debt:                  'Government gross debt as % of GDP. Emerging market average: ~65%.',
  current_account:            'Exports minus imports as % of GDP. Negative = more imports than exports.',
  conflict_events:            'Total recorded armed conflict events in the last full year. Source: ACLED.',
  conflict_fatalities:        'Reported deaths from armed conflict in the last full year. Source: ACLED.',
  refugees_origin:            'Number of refugees and asylum seekers who fled this country. Source: UNHCR.',
  idps:                       'People displaced within their own country. Africa hosts the most IDPs globally. Source: UNHCR.',
}

interface MetricCardProps {
  metric: CountryMetric;
  className?: string;
  loading?: boolean;
}

const trendIcon = {
  up: (
    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-label="Trending up">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941" />
    </svg>
  ),
  down: (
    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-label="Trending down">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.306-4.307a11.95 11.95 0 0 1 5.814 5.519l2.74 1.22m0 0-5.94 2.28m5.94-2.28-2.28-5.941" />
    </svg>
  ),
  flat: (
    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-label="Stable">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  ),
};

export function MetricCard({ metric, className, loading }: MetricCardProps) {
  if (loading) {
    return (
      <div className={cn("bg-white rounded-xl border border-slate-100 p-4 shadow-sm", className)}>
        <div className="skeleton h-3 w-24 mb-3 rounded" />
        <div className="skeleton h-7 w-16 mb-2 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-shadow",
        metric.freshness === "stale" && "opacity-70 border-red-100",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {metric.label}
        </span>
        {metric.trend && trendIcon[metric.trend]}
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold text-slate-900 tabular-nums">
          {typeof metric.value === 'number' ? formatNum(metric.value) : metric.value}
        </span>
        {metric.unit && (
          <span className="text-sm text-slate-400 font-medium">{metric.unit}</span>
        )}
      </div>

      {METRIC_CONTEXT[metric.key] && (
        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed italic">{METRIC_CONTEXT[metric.key]}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <SourceBadge source={metric.source} year={metric.source_year} />
        <FreshnessBadge freshness={metric.freshness} />
      </div>
    </div>
  );
}
