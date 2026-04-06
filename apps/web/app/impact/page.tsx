import { Navbar } from "@/components/layout/navbar";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Impact Dashboards" };

const PREVIEW_METRICS = [
  { label: "People reached", value: "2.4M", desc: "Estimated beneficiaries across verified programmes" },
  { label: "Funds tracked", value: "$18M", desc: "Verified capital deployed through platform partners" },
  { label: "Volunteer hours", value: "12,400", desc: "Remote and in-country hours logged" },
  { label: "Organisations", value: "8", desc: "Verified partners with published impact reports" },
];

export default function ImpactPage() {
  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader
          title="Impact Dashboards"
          description="Verified outcomes from partner organisations — linking your actions to measurable change."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {PREVIEW_METRICS.map(({ label, value, desc }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 opacity-60">
              <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
              <p className="text-sm font-medium text-slate-700 mb-1">{label}</p>
              <p className="text-xs text-slate-400">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 max-w-lg">
          <p className="text-sm font-semibold text-blue-800 mb-1">Coming in Phase 3</p>
          <p className="text-sm text-blue-700">
            Impact Dashboards will surface verified outcome data from partner reports — showing where donations go, what volunteer work achieves, and how capital is deployed. All figures will carry source citations and audit trails.
          </p>
        </div>
      </PageShell>
    </>
  );
}
