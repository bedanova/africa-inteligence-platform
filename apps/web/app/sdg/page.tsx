import { Navbar } from "@/components/layout/navbar"
import { PageShell } from "@/components/layout/page-shell"
import { SDGExplorer } from "@/components/ui/sdg-explorer"
import { getCountries, getAllMetricsWithHistory } from "@/lib/supabase-server"
import { MOCK_COUNTRIES } from "@/lib/mock-data"
import type { CountryMetric, CountrySummary } from "@/types"
import type { Metadata } from "next"

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: "SDG Explorer",
  description:
    "Track Africa's progress on all 17 UN Sustainable Development Goals with 10-year verified data from World Bank, WHO, and IMF sources.",
  openGraph: {
    title: "SDG Explorer | AfricaImpactLab",
    description:
      "Track Africa's progress on all 17 UN Sustainable Development Goals with 10-year verified data.",
  },
}

async function getSDGData(): Promise<{
  countries: CountrySummary[]
  metrics: Record<string, CountryMetric[]>
}> {
  try {
    const [countries, metrics] = await Promise.all([
      getCountries(),
      getAllMetricsWithHistory(),
    ])
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
        <SDGExplorer countries={countries} metrics={metrics} />
      </PageShell>
    </>
  )
}
