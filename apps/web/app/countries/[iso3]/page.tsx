import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { PageShell, SectionHeader } from "@/components/layout/page-shell";
import { ScoreChip } from "@/components/ui/score-chip";
import { MetricCard } from "@/components/ui/metric-card";
import { AIBriefCard } from "@/components/ui/ai-brief-card";
import { ActionCard } from "@/components/ui/action-card";
import { FreshnessBadge } from "@/components/ui/freshness-badge";
import { ScoreGaugeChart } from "@/components/ui/charts-client";
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
  return { title: country.name, description: country.ai_brief?.summary };
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-5xl leading-none" role="img" aria-label={`${country.name} flag`}>
              {country.flag_emoji}
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{country.name}</h1>
              <p className="text-sm text-slate-400">{country.region}</p>
              <FreshnessBadge freshness={country.freshness} className="mt-1" />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-4">
            <ScoreChip type="need" value={country.scores.need} size="lg" />
            <ScoreChip type="opportunity" value={country.scores.opportunity} size="lg" />
            <ScoreChip type="stability" value={country.scores.stability} size="lg" />
          </div>

          <ScoreGaugeChart
            need={country.scores.need}
            opportunity={country.scores.opportunity}
            stability={country.scores.stability}
          />

          {country.priority_sectors.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {country.priority_sectors.map((s) => (
                <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
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
                <div className="grid sm:grid-cols-2 gap-3">
                  {country.metrics.map((m) => (
                    <MetricCard key={m.key} metric={m} />
                  ))}
                </div>
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
