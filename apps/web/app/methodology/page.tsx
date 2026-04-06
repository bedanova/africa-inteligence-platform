import { Navbar } from "@/components/layout/navbar";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Methodology" };

const SOURCES = [
  { name: "World Bank Open Data", type: "GDP, poverty, education, infrastructure" },
  { name: "UN SDG Indicators", type: "17 goals, 230+ indicators" },
  { name: "WHO Global Health Observatory", type: "Mortality, disease burden, health systems" },
  { name: "ACLED", type: "Armed conflict events, fatalities, protest data" },
  { name: "GSMA Intelligence", type: "Mobile connectivity, internet access" },
  { name: "V-Dem Dataset", type: "Governance, democracy, institutional quality" },
  { name: "OCHA ReliefWeb", type: "Humanitarian situation reports" },
  { name: "AfDB African Economic Outlook", type: "Macroeconomic forecasts, regional analysis" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900 mb-3">{title}</h2>
      {children}
    </section>
  );
}

export default function MethodologyPage() {
  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader
          title="Methodology"
          description="How we calculate scores, generate briefs, and verify partners."
        />

        <div className="space-y-6 max-w-3xl">

          <Section title="The Three Scores">
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Every country is assigned three composite scores updated daily from verified data sources. Each score runs from 0 to 100.
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-400 mt-1.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Need (0–100)</p>
                  <p className="text-sm text-slate-600">Composite of humanitarian pressure, food insecurity, health burden (under-5 mortality, disease prevalence), and displacement. Higher = greater need.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-400 mt-1.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Opportunity (0–100)</p>
                  <p className="text-sm text-slate-600">GDP growth trajectory, internet and mobile connectivity, startup ecosystem activity, trade openness, and youth demographics. Higher = more opportunity.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Stability (0–100)</p>
                  <p className="text-sm text-slate-600">Governance quality (V-Dem), conflict pressure (ACLED events), rule of law, institutional performance, and political stability indices. Higher = more stable.</p>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Data Sources">
            <p className="text-sm text-slate-600 mb-4">
              All indicators are sourced from official, peer-reviewed, or institutionally verified datasets. No proprietary or unverifiable sources are used.
            </p>
            <div className="divide-y divide-slate-100">
              {SOURCES.map((s) => (
                <div key={s.name} className="py-2.5 flex gap-4">
                  <span className="text-sm font-medium text-slate-800 w-56 flex-shrink-0">{s.name}</span>
                  <span className="text-sm text-slate-500">{s.type}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="AI Briefs">
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              AI briefs are generated using a Retrieval-Augmented Generation (RAG) pipeline. The model is given only the current day&apos;s ingested data — it cannot draw on prior memory or training data to make factual claims.
            </p>
            <ul className="space-y-2">
              {[
                "Every factual claim in a brief must link to a source in the citation list.",
                "Briefs without citations are never published.",
                "The confidence score (0–1) reflects citation coverage and source quality.",
                "Stale briefs (>48h) are flagged and the last valid snapshot is shown.",
              ].map((point, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-600">
                  <span className="text-blue-400 flex-shrink-0">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Partner Verification">
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              Organisations listed in the Partner Directory are reviewed by our editorial team on a rolling basis.
            </p>
            <div className="space-y-3">
              {[
                { tier: "A", desc: "Independently audited financials, published impact reports, and at least one third-party evaluation." },
                { tier: "B", desc: "Self-reported financials reviewed by our team, clear mission alignment, active programme evidence." },
                { tier: "C", desc: "Listed but not fully reviewed. Proceed with independent due diligence." },
              ].map(({ tier, desc }) => (
                <div key={tier} className="flex gap-3">
                  <span className="flex-shrink-0 text-xs font-bold bg-slate-100 text-slate-700 w-6 h-6 rounded-full flex items-center justify-center">
                    {tier}
                  </span>
                  <p className="text-sm text-slate-600">{desc}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Freshness & Degradation">
            <p className="text-sm text-slate-600 leading-relaxed">
              Each data point carries a freshness flag: <strong className="text-slate-800">fresh</strong> (updated within 24h), <strong className="text-slate-800">aging</strong> (24–72h), or <strong className="text-slate-800">stale</strong> (over 72h or source unavailable). On source failure, the platform returns the last valid snapshot and displays a freshness warning rather than showing empty data.
            </p>
          </Section>

        </div>
      </PageShell>
    </>
  );
}
