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
import { getStartups } from "@/lib/supabase-startups";
import { MOCK_COUNTRIES, MOCK_METRICS, MOCK_SECTORS, MOCK_ACTIONS, getCountryBrief } from "@/lib/mock-data";
import { COUNTRY_EDUCATION } from "@/lib/country-education";
import { StartupCard } from "@/components/ui/startup-card";
import type { CountryProfile, Startup } from "@/types";
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
  const [country, startups] = await Promise.all([
    getCountryProfile(iso3.toUpperCase()),
    getStartups({ country_iso3: iso3.toUpperCase() }).catch((): Startup[] => []),
  ]);

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

          {/* Header row: flag + name + badge — all on one axis */}
          <div className="flex items-center gap-3 px-6 py-5">
            <CountryFlag iso3={country.iso3} countryName={country.name} size="lg" />
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 leading-tight truncate">{country.name}</h1>
              <p className="text-sm text-slate-400">{country.region}</p>
            </div>
            <div className="flex-shrink-0">
              <FreshnessBadge freshness={country.freshness} updatedAt={country.scores.updated_at} />
            </div>
          </div>

          {/* AI brief quote — full-width, same horizontal padding */}
          {country.ai_brief?.summary && (
            <p className="text-sm text-slate-400 italic px-6 pb-5 leading-relaxed line-clamp-2 border-b border-slate-100">
              &ldquo;{country.ai_brief.summary}&rdquo;
            </p>
          )}

          {/* Score strip — px-6 matches header so columns align with content above */}
          <div className="grid grid-cols-3 border-t border-slate-100">
            <div className="px-6 py-5 border-r border-slate-100 transition-colors hover:bg-rose-50/60">
              <div className="text-3xl font-bold tabular-nums leading-none text-rose-700">
                {Math.round(country.scores.need)}<span className="text-sm font-normal text-slate-300 ml-0.5">/100</span>
              </div>
              <div className="text-xs font-semibold text-slate-700 mt-1.5">Need</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Humanitarian pressure</div>
            </div>
            <div className="px-6 py-5 border-r border-slate-100 transition-colors hover:bg-emerald-50/60">
              <div className="text-3xl font-bold tabular-nums leading-none text-emerald-700">
                {Math.round(country.scores.opportunity)}<span className="text-sm font-normal text-slate-300 ml-0.5">/100</span>
              </div>
              <div className="text-xs font-semibold text-slate-700 mt-1.5">Opportunity</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Growth potential</div>
            </div>
            <div className="px-6 py-5 transition-colors hover:bg-blue-50/60">
              <div className="text-3xl font-bold tabular-nums leading-none text-blue-700">
                {Math.round(country.scores.stability)}<span className="text-sm font-normal text-slate-300 ml-0.5">/100</span>
              </div>
              <div className="text-xs font-semibold text-slate-700 mt-1.5">Stability</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Governance score</div>
            </div>
          </div>

          {/* Sectors — same px-6 */}
          {country.priority_sectors.length > 0 && (
            <div className="flex gap-2 flex-wrap px-6 py-3 border-t border-slate-100 bg-slate-50/40">
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

            {/* Startup signals */}
            {startups.length > 0 && (
              <div>
                <SectionHeader
                  title="Startup Signals"
                  action={
                    <Link href="/startups" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      All startups →
                    </Link>
                  }
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  {startups.slice(0, 4).map((s) => (
                    <StartupCard key={s.id} startup={s} />
                  ))}
                </div>
                {startups.length > 4 && (
                  <p className="text-xs text-slate-400 mt-3">
                    +{startups.length - 4} more startups in {country.name} —{' '}
                    <Link href="/startups" className="text-blue-500 hover:underline">browse all</Link>
                  </p>
                )}
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
