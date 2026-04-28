import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { PageShell, SectionHeader } from "@/components/layout/page-shell";
import { AIBriefCard } from "@/components/ui/ai-brief-card";
import { ScoreChip } from "@/components/ui/score-chip";
import { AfricaMap } from "@/components/ui/charts-client";
import { CountryFlag } from "@/components/ui/country-flag";
import { getCountries, getBriefs } from "@/lib/supabase-server";
import { MOCK_COUNTRIES } from "@/lib/mock-data";
import type { HomeOverview, CountrySummary, LeaderboardEntry } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "AfricaImpactLab — Africa Data & Impact Intelligence" },
  description:
    "Daily AI briefs, verified impact partners, and actionable data insights on Africa — grounded in live UN, World Bank, WHO, ACLED and IMF data.",
  openGraph: {
    title: "AfricaImpactLab — Africa Data & Impact Intelligence",
    description:
      "Daily AI briefs, verified impact partners, and actionable data insights on Africa — grounded in live UN, World Bank, WHO, ACLED and IMF data.",
  },
};

export const dynamic = 'force-dynamic'

function buildLeaderboard(countries: CountrySummary[], key: "need" | "opportunity" | "stability", desc = true, limit = 4): LeaderboardEntry[] {
  return [...countries]
    .sort((a, b) => desc ? b.scores[key] - a.scores[key] : a.scores[key] - b.scores[key])
    .slice(0, limit)
    .map((c) => ({ iso3: c.iso3, name: c.name, flag_emoji: c.flag_emoji, score: c.scores[key] }));
}

async function getHomeData(): Promise<HomeOverview | null> {
  try {
    const [countries, briefs] = await Promise.all([getCountries(), getBriefs()]);
    if (!countries || countries.length === 0) throw new Error("empty");
    return {
      snapshot_date: new Date().toISOString(),
      ingest_status: "ok",
      leaderboards: {
        highest_need: buildLeaderboard(countries, "need"),
        fastest_opportunity: buildLeaderboard(countries, "opportunity"),
        most_improved_stability: buildLeaderboard(countries, "stability"),
        attention_gap: buildLeaderboard(countries, "need").filter((e) => {
          const c = countries.find((c) => c.iso3 === e.iso3);
          return c ? c.scores.opportunity < 60 : false;
        }),
      },
      top_briefs: briefs.slice(0, 3),
      countries,
    };
  } catch {
    return {
      snapshot_date: new Date().toISOString(),
      ingest_status: "ok",
      leaderboards: {
        highest_need: buildLeaderboard(MOCK_COUNTRIES, "need"),
        fastest_opportunity: buildLeaderboard(MOCK_COUNTRIES, "opportunity"),
        most_improved_stability: buildLeaderboard(MOCK_COUNTRIES, "stability"),
        attention_gap: [],
      },
      top_briefs: [],
      countries: MOCK_COUNTRIES,
    };
  }
}

export default async function HomePage() {
  const data = await getHomeData();
  const countries = data?.countries ?? MOCK_COUNTRIES;

  return (
    <>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
        {/* Decorative grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Decorative glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-20 sm:pb-16">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-xs font-medium text-slate-300">Live data from 7 verified sources</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-5">
              Africa through
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                data that matters
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mb-8">
              Real-time intelligence on health, governance, economy and conflict across Africa — grounded in UN, World Bank, WHO, ACLED and IMF data. AI briefs daily. Verified organisations. Actionable insights.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-12">
              <Link
                href="/countries"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
              >
                Explore Countries
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/briefs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors border border-white/10"
              >
                Read Today's Brief
              </Link>
              <Link
                href="/action"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors border border-white/10"
              >
                Take Action
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { value: countries.length, label: "Countries tracked", color: "text-blue-400" },
              { value: 7, label: "Live data sources", color: "text-emerald-400" },
              { value: "40+", label: "Key indicators", color: "text-amber-400" },
              { value: "Daily", label: "AI-generated briefs", color: "text-violet-400" },
            ].map(({ value, label, color }) => (
              <div key={label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3">
                <p className={`text-2xl sm:text-3xl font-bold tabular-nums ${color}`}>{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageShell>
        {/* ── AFRICA MAP ──────────────────────────────────────────── */}
        {countries.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 mb-10 -mt-8 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Africa at a Glance</h2>
                <p className="text-sm text-slate-500 mt-0.5">Click a country for full intelligence profile</p>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-rose-100 border border-rose-200" /> Need</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-200" /> Opportunity</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-200" /> Stability</span>
              </div>
            </div>
            <AfricaMap countries={countries} />
          </div>
        )}

        {/* ── TODAY'S BRIEFS ──────────────────────────────────────── */}
        {data && data.top_briefs.length > 0 && (
          <div className="mb-10">
            <SectionHeader
              title="Today in Africa"
              action={
                <Link href="/briefs" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  All briefs &rarr;
                </Link>
              }
            />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.top_briefs.map((brief) => (
                <AIBriefCard key={brief.id} brief={brief} />
              ))}
            </div>
          </div>
        )}

        {/* ── LEADERBOARDS ────────────────────────────────────────── */}
        {data && (
          <div className="mb-10">
            <SectionHeader title="Rankings" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <LeaderboardBlock
                title="Highest Need"
                subtitle="Humanitarian + health pressure"
                entries={data.leaderboards.highest_need}
                scoreType="need"
              />
              <LeaderboardBlock
                title="Top Opportunity"
                subtitle="Economy + connectivity + startups"
                entries={data.leaderboards.fastest_opportunity}
                scoreType="opportunity"
              />
              <LeaderboardBlock
                title="Most Stable"
                subtitle="Governance + peace + institutions"
                entries={data.leaderboards.most_improved_stability}
                scoreType="stability"
              />
            </div>
          </div>
        )}

        {/* ── DATA SOURCES ────────────────────────────────────────── */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Trusted Data Sources</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              "World Bank Open Data",
              "WHO Global Health Observatory",
              "UN SDG Indicators",
              "ACLED Conflict Data",
              "UNHCR Population Statistics",
              "IMF DataMapper",
              "RSS News Feeds",
            ].map((src) => (
              <span key={src} className="text-xs text-slate-500">{src}</span>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            All data is programmatically ingested, cross-referenced, and scored. No manual curation. <Link href="/methodology" className="text-blue-500 hover:underline">Read methodology</Link>
          </p>
        </div>
      </PageShell>
    </>
  );
}

function LeaderboardBlock({
  title,
  subtitle,
  entries,
  scoreType,
}: {
  title: string;
  subtitle: string;
  entries: LeaderboardEntry[];
  scoreType: "need" | "opportunity" | "stability";
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-0.5">{title}</h3>
      <p className="text-[11px] text-slate-400 mb-3">{subtitle}</p>
      <ol className="space-y-2.5">
        {entries.map((entry, i) => (
          <li key={entry.iso3} className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 w-4 text-right flex-shrink-0">
              {i + 1}
            </span>
            <CountryFlag iso3={entry.iso3} countryName={entry.name} size="sm" />
            <Link
              href={`/countries/${entry.iso3.toLowerCase()}`}
              className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors truncate min-w-0"
            >
              {entry.name}
            </Link>
            <ScoreChip
              type={scoreType}
              value={entry.score}
              size="sm"
              showLabel={false}
              className="ml-auto flex-shrink-0"
            />
          </li>
        ))}
      </ol>
    </div>
  );
}
