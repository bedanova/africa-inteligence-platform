"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { CountryCard } from "@/components/ui/country-card";
import type { CountrySummary, Region } from "@/types";

const REGIONS: { value: Region | "all"; label: string }[] = [
  { value: "all", label: "All regions" },
  { value: "Eastern Africa", label: "Eastern Africa" },
  { value: "Western Africa", label: "Western Africa" },
  { value: "Southern Africa", label: "Southern Africa" },
  { value: "Northern Africa", label: "Northern Africa" },
  { value: "Central Africa", label: "Central Africa" },
];

export default function CountriesPage() {
  const [countries, setCountries] = useState<CountrySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region | "all">("all");

  useEffect(() => {
    setLoading(true);
    const url = region === "all" ? "/api/v1/countries" : `/api/v1/countries?region=${encodeURIComponent(region)}`;
    fetch(url)
      .then((r) => r.json())
      .then((res) => {
        setCountries(res.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [region]);

  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader
          title="Countries"
          description="Need, Opportunity, and Stability scores for African countries — updated daily from verified data sources."
        />

        {/* Region filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {REGIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setRegion(value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                region === value
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <CountryCard key={i} country={null as never} loading />)
            : countries.length > 0
            ? countries.map((c) => <CountryCard key={c.iso3} country={c} />)
            : (
              <p className="col-span-4 text-slate-400 text-sm py-12 text-center">
                No countries found for this region.
              </p>
            )}
        </div>
      </PageShell>
    </>
  );
}
