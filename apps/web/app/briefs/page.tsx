import { Navbar } from "@/components/layout/navbar";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { AIBriefCard } from "@/components/ui/ai-brief-card";
import { BriefsHistory } from "./briefs-history";
import { getBriefs } from "@/lib/supabase-server";
import { MOCK_BRIEFS } from "@/lib/mock-data";
import type { AIBrief } from "@/types";

export const dynamic = 'force-dynamic'
export const metadata = {
  title: "AI Briefs",
  description: "Daily AI-generated country briefings grounded in live UN, World Bank, WHO and ACLED data — covering 20 African countries.",
  openGraph: {
    title: "AI Briefs | AfricaImpactLab",
    description: "Daily AI briefs on African countries — data-grounded, cited, updated every morning.",
  },
}

async function getAllBriefs() {
  try {
    return await getBriefs();
  } catch {
    return MOCK_BRIEFS;
  }
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  return d.toISOString().slice(0, 10) === now.toISOString().slice(0, 10)
}

function groupByDate(briefs: AIBrief[]): { date: string; label: string; briefs: AIBrief[] }[] {
  const groups: Record<string, AIBrief[]> = {}
  for (const b of briefs) {
    const date = new Date(b.generated_at).toISOString().slice(0, 10)
    if (!groups[date]) groups[date] = []
    groups[date].push(b)
  }
  return Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, briefs]) => ({
      date,
      label: new Date(date + 'T12:00:00Z').toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      }),
      briefs,
    }))
}

export default async function BriefsPage() {
  const briefs = await getAllBriefs();

  // Separate today's briefs from historical
  const todayBriefs = briefs.filter((b) => isToday(b.generated_at));
  const olderBriefs = briefs.filter((b) => !isToday(b.generated_at));

  // Group older briefs by date
  const historicalGroups = groupByDate(olderBriefs);

  // Today's "Did you know" — pick the first one found
  const todayFact = todayBriefs.find((b) => b.did_you_know)?.did_you_know;

  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader
          title="AI Briefs"
          description="Daily AI-generated summaries grounded in cited data from official sources. Every statement links to its evidence. New briefs every day."
        />

        {/* Today's "Did you know?" fact — prominent display */}
        {todayFact && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 mb-8 flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">💡</span>
            <div>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Did you know?</p>
              <p className="text-base text-indigo-900 leading-relaxed font-medium">{todayFact}</p>
            </div>
          </div>
        )}

        {/* Today's briefs */}
        {todayBriefs.length > 0 ? (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-slate-900">Today&apos;s Briefs</h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Fresh
              </span>
            </div>

            {/* Continent briefs first */}
            {todayBriefs.filter((b) => b.scope === 'continent').length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Africa Overview</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {todayBriefs.filter((b) => b.scope === 'continent').map((b) => (
                    <AIBriefCard key={b.id} brief={b} />
                  ))}
                </div>
              </div>
            )}

            {/* Country briefs */}
            {todayBriefs.filter((b) => b.scope === 'country').length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Country Briefs</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {todayBriefs.filter((b) => b.scope === 'country').map((b) => (
                    <AIBriefCard key={b.id} brief={b} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* If no today's briefs, show all briefs as the main content */
          <div className="mb-10">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-700">
              <strong>No briefs generated today yet.</strong> Briefs are generated daily at 07:00 UTC, or run manually via <code className="bg-blue-100 px-1 rounded text-xs">/admin</code>.
            </div>

            {briefs.length > 0 && (
              <>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Latest Briefs</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {briefs.slice(0, 6).map((b) => <AIBriefCard key={b.id} brief={b} />)}
                </div>
              </>
            )}
          </div>
        )}

        {/* Historical briefs — client component for "show more" */}
        {historicalGroups.length > 0 && (
          <BriefsHistory groups={historicalGroups} />
        )}
      </PageShell>
    </>
  );
}
