import { Navbar } from "@/components/layout/navbar";
import { PageShell, PageHeader } from "@/components/layout/page-shell";
import { CountryCard } from "@/components/ui/country-card";
import { api } from "@/lib/api";
import type { CountrySummary } from "@/types";

async function getCountries(): Promise<CountrySummary[]> {
  try {
    const res = await api.get<CountrySummary[]>("/api/v1/countries");
    return res.data;
  } catch {
    return [];
  }
}

export const metadata = { title: "Countries" };

export default async function CountriesPage() {
  const countries = await getCountries();

  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader
          title="Countries"
          description="Need, Opportunity, and Stability scores for African countries — updated daily from verified data sources."
        />
        {countries.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {countries.map((c) => (
              <CountryCard key={c.iso3} country={c} />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CountryCard key={i} country={null as never} loading />
            ))}
          </div>
        )}
      </PageShell>
    </>
  );
}
