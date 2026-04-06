import { Navbar } from "@/components/layout/navbar";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { AIBriefCard } from "@/components/ui/ai-brief-card";
import { api } from "@/lib/api";
import type { HomeOverview } from "@/types";

async function getBriefs() {
  try {
    const res = await api.get<HomeOverview>("/api/v1/home/overview");
    return res.data.top_briefs;
  } catch {
    return [];
  }
}

export const metadata = { title: "AI Briefs" };

export default async function BriefsPage() {
  const briefs = await getBriefs();

  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader
          title="AI Briefs"
          description="Daily AI-generated summaries grounded in cited data from official sources. Every statement links to its evidence."
        />
        <div className="grid md:grid-cols-2 gap-4">
          {briefs.map((b) => (
            <AIBriefCard key={b.id} brief={b} />
          ))}
        </div>
      </PageShell>
    </>
  );
}
