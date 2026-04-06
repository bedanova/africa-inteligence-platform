import { Navbar } from "@/components/layout/navbar"
import { PageShell, PageHeader } from "@/components/layout/page-shell"
import { CountriesGrid } from "@/components/ui/countries-grid"
import { getCountries } from "@/lib/supabase-server"
import { MOCK_COUNTRIES } from "@/lib/mock-data"

export const dynamic = 'force-dynamic'
export const metadata = { title: "Countries" }

async function getAllCountries() {
  try {
    return await getCountries()
  } catch {
    return MOCK_COUNTRIES
  }
}

export default async function CountriesPage() {
  const countries = await getAllCountries()

  return (
    <>
      <Navbar />
      <PageShell>
        <PageHeader
          title="Countries"
          description="Need, Opportunity, and Stability scores for African countries — updated daily from verified data sources."
        />
        <CountriesGrid countries={countries} />
      </PageShell>
    </>
  )
}
