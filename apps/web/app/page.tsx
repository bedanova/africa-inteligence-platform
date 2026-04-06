import { Navbar } from "@/components/layout/navbar";
import { PageShell, SectionHeader } from "@/components/layout/page-shell";
import { AIBriefCard } from "@/components/ui/ai-brief-card";
import { CountryCard } from "@/components/ui/country-card";
import { ScoreChip } from "@/components/ui/score-chip";
import { CountryComparisonChart } from "@/components/ui/country-comparison-chart";
import { getCountries, getBriefs } from "@/lib/supabase-server";
import { MOCK_COUNTRIES, MOCK_BRIEFS } from "@/lib/mock-data";
import type { HomeOverview, CountrySummary, LeaderboardEntry } from "@/types";

function buildLeaderboard(countries: CountrySummary[], key: "need" | "opportunity" | "stability", desc = true, limit = 4): LeaderboardEntry[] {
  return [...countries]
    .sort((a, b) => desc ? b.scores[key] - a.scores[key] : a.scores[key] - b.scores[key])
    .slice(0, limit)
    .map((c) => ({ iso3: c.iso3, name: c.name, flag_emoji: c.flag_emoji, score: c.scores[key] }));
}

async function getHomeData(): Promise<HomeOverview | null> {
  try {
    const [countries, briefs] = await Promise.all([getCountries(), getBriefs()]);
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
    return null;
  }
}

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <>
      <Navbar />
      <PageShell>
        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">Africa Intelligence</h1>
            {data && (
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                  data.ingest_status === "ok"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    data.ingest_status === "ok" ? "bg-green-500" : "bg-amber-500"
                  }`}
                />
                {data.ingest_status === "ok" ? "Live" : "Partial data"}
              </span>
            )}
          </div>
          <p className="text-slate-500 max-w-2xl">
            Daily AI briefs, verified partners, and actionable insights — grounded in cited data
            from UN, World Bank, WHO, ACLED, and more.
          </p>
          {data && (
            <p className="text-xs text-slate-400 mt-1">
              Snapshot:{" "}
              {new Date(data.snapshot_date).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        {/* Score legend */}
        <div className="flex gap-2 flex-wrap mb-8">
          {(
            [
              { type: "need", value: 75, desc: "humanitarian + health pressure (0–100)" },
              { type: "opportunity", value: 60, desc: "economy + connectivity + startup signals (0–100)" },
              { type: "stability", value: 55, desc: "governance + peace + institutions (0–100)" },
            ] as const
          ).map(({ type, value, desc }) => (
            <div
              key={type}
              className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-100 rounded-xl px-4 py-2 shadow-sm"
            >
              <ScoreChip type={type} value={value} size="sm" showLabel />
              <span className="text-slate-300">·</span>
              <span className="text-xs">{desc}</span>
            </div>
          ))}
        </div>

        {/* Leaderboards */}
        {data && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <LeaderboardBlock
              title="Highest Need"
              entries={data.leaderboards.highest_need}
              scoreType="need"
            />
            <LeaderboardBlock
              title="Top Opportunity"
              entries={data.leaderboards.fastest_opportunity}
              scoreType="opportunity"
            />
            <LeaderboardBlock
              title="Most Stable"
              entries={data.leaderboards.most_improved_stability}
              scoreType="stability"
            />
            <LeaderboardBlock
              title="Attention Gap"
              entries={data.leaderboards.attention_gap}
              scoreType="need"
            />
          </div>
        )}

        {/* Country comparison chart */}
        {data && data.countries.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-10">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              Score Comparison — All Countries
            </h3>
            <CountryComparisonChart countries={data.countries} />
          </div>
        )}

        {/* Today's AI Briefs */}
        <div className="mb-10">
          <SectionHeader
            title="Today in Africa"
            action={
              <a href="/briefs" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                All briefs →
              </a>
            }
          />
          {data ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.top_briefs.map((brief) => (
                <AIBriefCard key={brief.id} brief={brief} />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <AIBriefCard key={i} brief={null as never} loading />
              ))}
            </div>
          )}
        </div>

        {/* Countries */}
        <div>
          <SectionHeader
            title="Countries"
            action={
              <a
                href="/countries"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                All countries →
              </a>
            }
          />
          {data ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.countries.map((country) => (
                <CountryCard key={country.iso3} country={country} />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <CountryCard key={i} country={null as never} loading />
              ))}
            </div>
          )}
        </div>
      </PageShell>
    </>
  );
}

function LeaderboardBlock({
  title,
  entries,
  scoreType,
}: {
  title: string;
  entries: { iso3: string; name: string; flag_emoji: string; score: number; delta?: number }[];
  scoreType: "need" | "opportunity" | "stability";
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        {title}
      </h3>
      <ol className="space-y-2">
        {entries.map((entry, i) => (
          <li key={entry.iso3} className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 w-4 text-right flex-shrink-0">
              {i + 1}
            </span>
            <span className="text-base leading-none flex-shrink-0">{entry.flag_emoji}</span>
            <a
              href={`/countries/${entry.iso3.toLowerCase()}`}
              className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors truncate min-w-0"
            >
              {entry.name}
            </a>
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
