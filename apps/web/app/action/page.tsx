"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { ActionCard } from "@/components/ui/action-card";
import type { ActionCard as ActionCardType, ActionType } from "@/types";

const FILTERS: { value: ActionType | "all"; label: string; desc: string }[] = [
  { value: "all", label: "All", desc: "Every verified opportunity" },
  { value: "donate", label: "💚 Donate", desc: "Support vetted programmes financially" },
  { value: "volunteer", label: "🤝 Volunteer", desc: "Contribute skills and time" },
  { value: "invest", label: "📈 Invest", desc: "Impact-first capital deployment" },
  { value: "learn", label: "📚 Learn", desc: "Deepen your understanding" },
];

export default function ActionPage() {
  const [actions, setActions] = useState<ActionCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ActionType | "all">("all");

  useEffect(() => {
    setLoading(true);
    const url = filter === "all" ? "/api/v1/actions" : `/api/v1/actions?type=${filter}`;
    fetch(url)
      .then((r) => r.json())
      .then((res) => {
        setActions(res.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  const activeFilter = FILTERS.find((f) => f.value === filter)!;

  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader
          title="Take Action"
          description="Verified opportunities to donate, volunteer, invest, and learn — linked to real needs in African countries."
        />

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-2">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filter === value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mb-6">{activeFilter.desc}</p>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                <div className="skeleton h-5 w-32 mb-3 rounded" />
                <div className="skeleton h-4 w-full mb-1 rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
              </div>
            ))
          ) : actions.length > 0 ? (
            actions.map((action) => <ActionCard key={action.id} action={action} />)
          ) : (
            <p className="col-span-3 text-slate-400 text-sm py-12 text-center">
              No actions found for this filter.
            </p>
          )}
        </div>
      </PageShell>
    </>
  );
}
