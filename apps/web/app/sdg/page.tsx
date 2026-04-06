import { Navbar } from "@/components/layout/navbar"
import { PageShell, PageHeader } from "@/components/layout/page-shell"
import { SDGExplorer } from "@/components/ui/sdg-explorer"
import { getCountries, getMetrics } from "@/lib/supabase-server"
import { MOCK_COUNTRIES } from "@/lib/mock-data"
import type { CountryMetric, CountrySummary } from "@/types"
import type { Metadata } from "next"

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: "SDG Explorer" }

async function getSDGData(): Promise<{
  countries: CountrySummary[]
  metrics: Record<string, CountryMetric[]>
}> {
  try {
    const countries = await getCountries()
    const metricsArr = await Promise.all(countries.map((c) => getMetrics(c.iso3)))
    const metrics: Record<string, CountryMetric[]> = {}
    countries.forEach((c, i) => { metrics[c.iso3] = metricsArr[i] })
    return { countries, metrics }
  } catch {
    return { countries: MOCK_COUNTRIES, metrics: {} }
  }
}

export default async function SDGPage() {
  const { countries, metrics } = await getSDGData()

  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader
          title="SDG Explorer"
          description="Track progress on the UN Sustainable Development Goals — click any goal with live data to see per-country breakdown."
        />
        <SDGExplorer countries={countries} metrics={metrics} />
      </PageShell>
    </>
  )
}
