import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { PageShell, SectionHeader } from "@/components/layout/page-shell";
import { MetricsSection } from "@/components/ui/metrics-section";
import { AIBriefCard } from "@/components/ui/ai-brief-card";
import { ActionCard } from "@/components/ui/action-card";
import { FreshnessBadge } from "@/components/ui/freshness-badge";
import { CountryFlag } from "@/components/ui/country-flag";
import { CountryEducationPanel } from "@/components/ui/country-education-panel";
import { getCountry, getMetrics, getMetricsWithHistory, getSectors, getActions, getCountryBriefFromDb } from "@/lib/supabase-server";
import { MOCK_COUNTRIES, MOCK_METRICS, MOCK_SECTORS, MOCK_ACTIONS, getCountryBrief } from "@/lib/mock-data";
import { COUNTRY_EDUCATION } from "@/lib/country-education";
import type { CountryProfile } from "@/types";
import type { Metadata } from "next";

async function getCountryProfile(iso3: string): Promise<CountryProfile | null> {
  try {
    const [summary, metrics, sectors, actions, brief] = await Promise.all([
      getCountry(iso3),
      getMetricsWithHistory(iso3),
      getSectors(iso3),
      getActions(iso3),
      getCountryBriefFromDb(iso3),
    ]);
    if (!summary) return null;
    return { ...summary, ai_brief: brief, metrics, priority_sectors: sectors, trusted_actions: actions };
  } catch {
    const summary = MOCK_COUNTRIES.find((c) => c.iso3 === iso3);
    if (!summary) return null;
    return {
      ...summary,
      ai_brief: getCountryBrief(iso3),
      metrics: MOCK_METRICS[iso3] ?? [],
      priority_sectors: MOCK_SECTORS[iso3] ?? [],
      trusted_actions: MOCK_ACTIONS[iso3] ?? [],
    };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ iso3: string }>;
}): Promise<Metadata> {
  const { iso3 } = await params;
  const country = await getCountryProfile(iso3.toUpperCase());
  if (!country) return { title: "Country not found" };
  const desc = country.ai_brief?.summary ?? `Live data, AI briefs, and verified impact actions for ${country.name}.`
  return {
    title: country.name,
    description: desc,
    openGraph: {
      title: `${country.name} | AfricaImpactLab`,
      description: desc,
    },
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ iso3: string }>;
}) {
  const { iso3 } = await params;
  const country = await getCountryProfile(iso3.toUpperCase());

  if (!country) notFound();

  return (
    <>
      <Navbar />
      <PageShell>
        <Link href="/countries" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          All countries
        </Link>

        {/* Hero */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
          {/* Top band */}
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4">
              <CountryFlag iso3={country.iso3} countryName={country.name} size="xl" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 leading-tight">{country.name}</h1>
                    <p className="text-sm text-slate-400 mt-0.5">{country.region}</p>
                  </div>
                  <FreshnessBadge freshness={country.freshness} updatedAt={country.scores.updated_at} />
                </div>
                {country.ai_brief?.summary && (
                  <p className="text-sm text-slate-500 italic mt-3 leading-relaxed line-clamp-2">
                    &ldquo;{country.ai_brief.summary}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Score strip */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
            {[
              { type: 'need' as const,        value: country.scores.need,        label: 'Need',        desc: 'Humanitarian pressure', color: 'text-rose-700',    bg: 'hover:bg-rose-50/50' },
              { type: 'opportunity' as const, value: country.scores.opportunity, label: 'Opportunity', desc: 'Growth potential',       color: 'text-emerald-700', bg: 'hover:bg-emerald-50/50' },
              { type: 'stability' as const,   value: country.scores.stability,   label: 'Stability',   desc: 'Governance score',      color: 'text-blue-700',    bg: 'hover:bg-blue-50/50' },
            ].map(({ value, label, desc, color, bg }) => (
              <div key={label} className={`px-5 py-4 transition-colors ${bg}`}>
                <div className={`text-3xl font-bold tabular-nums ${color}`}>{Math.round(value)}<span className="text-base font-normal text-slate-400 ml-0.5">/100</span></div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">{label}</div>
                <div className="text-xs text-slate-400">{desc}</div>
              </div>
            ))}
          </div>

          {/* Sectors */}
          {country.priority_sectors.length > 0 && (
            <div className="flex gap-2 flex-wrap px-6 py-3 border-t border-slate-100 bg-slate-50/50">
              {country.priority_sectors.map((s) => (
                <span key={s} className="text-xs bg-white text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {COUNTRY_EDUCATION[country.iso3] && (
          <div className="mb-6">
            <CountryEducationPanel
              education={COUNTRY_EDUCATION[country.iso3]}
              countryName={country.name}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {country.ai_brief && (
              <div>
                <SectionHeader title="AI Brief" />
                <AIBriefCard brief={country.ai_brief} />
              </div>
            )}

            {country.metrics.length > 0 && (
              <div>
                <SectionHeader title="Key Indicators" />
                <MetricsSection
                  metrics={country.metrics}
                  iso3={country.iso3}
                  countryName={country.name}
                />
              </div>
            )}
          </div>

          {country.trusted_actions.length > 0 && (
            <div>
              <SectionHeader title="Trusted Actions" />
              <div className="space-y-3">
                {country.trusted_actions.map((a) => (
                  <ActionCard key={a.id} action={a} />
                ))}
              </div>
            </div>
          )}
        </div>
      </PageShell>
    </>
  );
}
