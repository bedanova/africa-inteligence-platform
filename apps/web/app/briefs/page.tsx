import { Navbar } from "@/components/layout/navbar";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { AIBriefCard } from "@/components/ui/ai-brief-card";
import { getBriefs } from "@/lib/supabase-server";
import { MOCK_BRIEFS } from "@/lib/mock-data";

export const metadata = { title: "AI Briefs" };

async function getAllBriefs() {
  try {
    return await getBriefs();
  } catch {
    return MOCK_BRIEFS;
  }
}

export default async function BriefsPage() {
  const briefs = await getAllBriefs();
  const continentBriefs = briefs.filter((b) => b.scope === "continent");
  const countryBriefs = briefs.filter((b) => b.scope === "country");

  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader
          title="AI Briefs"
          description="Daily AI-generated summaries grounded in cited data from official sources. Every statement links to its evidence."
        />

        {continentBriefs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Africa Overview</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {continentBriefs.map((b) => <AIBriefCard key={b.id} brief={b} />)}
            </div>
          </div>
        )}

        {countryBriefs.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Country Briefs</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {countryBriefs.map((b) => <AIBriefCard key={b.id} brief={b} />)}
            </div>
          </div>
        )}
      </PageShell>
    </>
  );
}
