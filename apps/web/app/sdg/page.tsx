import { Navbar } from "@/components/layout/navbar";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "SDG Explorer" };

const GOALS = [
  { n: 1, label: "No Poverty", color: "bg-red-500" },
  { n: 2, label: "Zero Hunger", color: "bg-amber-600" },
  { n: 3, label: "Good Health", color: "bg-green-500" },
  { n: 4, label: "Quality Education", color: "bg-red-600" },
  { n: 5, label: "Gender Equality", color: "bg-orange-500" },
  { n: 6, label: "Clean Water", color: "bg-blue-500" },
  { n: 7, label: "Affordable Energy", color: "bg-yellow-500" },
  { n: 8, label: "Decent Work", color: "bg-red-700" },
  { n: 9, label: "Industry & Innovation", color: "bg-orange-600" },
  { n: 10, label: "Reduced Inequalities", color: "bg-pink-600" },
  { n: 11, label: "Sustainable Cities", color: "bg-amber-500" },
  { n: 12, label: "Responsible Consumption", color: "bg-yellow-600" },
  { n: 13, label: "Climate Action", color: "bg-green-700" },
  { n: 14, label: "Life Below Water", color: "bg-blue-600" },
  { n: 15, label: "Life on Land", color: "bg-green-600" },
  { n: 16, label: "Peace & Justice", color: "bg-blue-700" },
  { n: 17, label: "Partnerships", color: "bg-slate-700" },
];

export default function SDGPage() {
  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader
          title="SDG Explorer"
          description="Track progress on the UN Sustainable Development Goals across African countries — linked to verified data from UN SDG indicators."
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-10">
          {GOALS.map(({ n, label, color }) => (
            <div
              key={n}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col gap-2 opacity-60 cursor-not-allowed"
              title="Coming in Phase 3"
            >
              <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                {n}
              </div>
              <p className="text-xs font-medium text-slate-700 leading-snug">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 max-w-lg">
          <p className="text-sm font-semibold text-blue-800 mb-1">Coming in Phase 3</p>
          <p className="text-sm text-blue-700">
            SDG Explorer will show per-country progress on all 17 goals with indicator drill-down, trend charts, and peer comparisons. Data sourced from UN SDG API and World Bank.
          </p>
        </div>
      </PageShell>
    </>
  );
}
