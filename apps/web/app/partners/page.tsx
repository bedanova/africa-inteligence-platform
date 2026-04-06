"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { OrgCard } from "@/components/ui/org-card";
import type { Organization, ActionType } from "@/types";

const ACTION_FILTERS: { value: ActionType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "donate", label: "Donate" },
  { value: "volunteer", label: "Volunteer" },
  { value: "invest", label: "Invest" },
  { value: "learn", label: "Learn" },
];

export default function PartnersPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ActionType | "all">("all");

  useEffect(() => {
    setLoading(true);
    const url = filter === "all" ? "/api/v1/partners" : `/api/v1/partners?action=${filter}`;
    fetch(url)
      .then((r) => r.json())
      .then((res) => {
        setOrgs(res.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filter]);

  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader
          title="Verified Partners"
          description="Organisations verified by our editorial team — rated A or B based on transparency, impact evidence, and data quality."
        />

        {/* Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {ACTION_FILTERS.map(({ value, label }) => (
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

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <OrgCard key={i} org={null as never} loading />)
            : orgs.length > 0
            ? orgs.map((org) => <OrgCard key={org.id} org={org} />)
            : (
              <p className="col-span-3 text-slate-400 text-sm py-12 text-center">
                No partners found for this filter.
              </p>
            )}
        </div>
      </PageShell>
    </>
  );
}
