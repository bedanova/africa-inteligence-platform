import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { PageShell, SectionHeader } from "@/components/layout/page-shell";
import { ScoreChip } from "@/components/ui/score-chip";
import { MetricCard } from "@/components/ui/metric-card";
import { AIBriefCard } from "@/components/ui/ai-brief-card";
import { ActionCard } from "@/components/ui/action-card";
import { FreshnessBadge } from "@/components/ui/freshness-badge";
import { api } from "@/lib/api";
import type { CountryProfile } from "@/types";
import type { Metadata } from "next";

async function getCountry(iso3: string): Promise<CountryProfile | null> {
  try {
    const res = await api.get<CountryProfile>(`/api/v1/countries/${iso3.toUpperCase()}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ iso3: string }>;
}): Promise<Metadata> {
  const { iso3 } = await params;
  const country = await getCountry(iso3);
  if (!country) return { title: "Country not found" };
  return {
    title: country.name,
    description: country.ai_brief?.summary,
  };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ iso3: string }>;
}) {
  const { iso3 } = await params;
  const country = await getCountry(iso3);

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

          {country.priority_sectors.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {country.priority_sectors.map((s) => (
                <span
                  key={s}
                  className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: AI brief + metrics */}
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

          {/* Right: Trusted Actions */}
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
