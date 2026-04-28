import type { MetadataRoute } from "next"
import { getCountries } from "@/lib/supabase-server"
import { getStartups } from "@/lib/supabase-startups"

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.africaimpactlab.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/countries`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/briefs`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/sdg`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/action`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/startups`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/partners`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/impact`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/methodology`, changeFrequency: "monthly", priority: 0.4 },
  ]

  // Dynamic country pages
  let countryPages: MetadataRoute.Sitemap = []
  try {
    const countries = await getCountries()
    countryPages = countries.map((c) => ({
      url: `${SITE_URL}/countries/${c.iso3.toLowerCase()}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }))
  } catch {}

  // Dynamic startup pages
  let startupPages: MetadataRoute.Sitemap = []
  try {
    const startups = await getStartups()
    startupPages = startups.map((s) => ({
      url: `${SITE_URL}/startups/${s.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }))
  } catch {}

  return [...staticPages, ...countryPages, ...startupPages]
}
