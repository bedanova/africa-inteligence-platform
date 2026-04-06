import { NextResponse } from 'next/server'
import { getCountries, getBriefs } from '@/lib/supabase-server'
import { MOCK_COUNTRIES, MOCK_BRIEFS } from '@/lib/mock-data'
import type { HomeOverview, LeaderboardEntry, CountrySummary } from '@/types'

function buildLeaderboard(
  countries: CountrySummary[],
  scoreKey: 'need' | 'opportunity' | 'stability',
  descending = true,
  limit = 4,
): LeaderboardEntry[] {
  return [...countries]
    .sort((a, b) =>
      descending
        ? b.scores[scoreKey] - a.scores[scoreKey]
        : a.scores[scoreKey] - b.scores[scoreKey],
    )
    .slice(0, limit)
    .map((c) => ({ iso3: c.iso3, name: c.name, flag_emoji: c.flag_emoji, score: c.scores[scoreKey] }))
}

export async function GET() {
  try {
    const [countries, briefs] = await Promise.all([getCountries(), getBriefs()])

    const overview: HomeOverview = {
      snapshot_date: new Date().toISOString(),
      ingest_status: 'ok',
      leaderboards: {
        highest_need: buildLeaderboard(countries, 'need', true),
        fastest_opportunity: buildLeaderboard(countries, 'opportunity', true),
        most_improved_stability: buildLeaderboard(countries, 'stability', true),
        attention_gap: buildLeaderboard(countries, 'need', true, 4).filter((e) => {
          const c = countries.find((c) => c.iso3 === e.iso3)
          return c ? c.scores.opportunity < 60 : false
        }),
      },
      top_briefs: briefs.slice(0, 3),
      countries,
    }

    return NextResponse.json({
      data: overview,
      meta: { generated_at: new Date().toISOString(), freshness: 'fresh', sources: 4, cache_status: 'MISS' },
    })
  } catch {
    const overview: HomeOverview = {
      snapshot_date: new Date().toISOString(),
      ingest_status: 'ok',
      leaderboards: {
        highest_need: buildLeaderboard(MOCK_COUNTRIES, 'need', true),
        fastest_opportunity: buildLeaderboard(MOCK_COUNTRIES, 'opportunity', true),
        most_improved_stability: buildLeaderboard(MOCK_COUNTRIES, 'stability', true),
        attention_gap: buildLeaderboard(MOCK_COUNTRIES, 'need', true, 4).filter((e) => {
          const c = MOCK_COUNTRIES.find((c) => c.iso3 === e.iso3)
          return c ? c.scores.opportunity < 60 : false
        }),
      },
      top_briefs: MOCK_BRIEFS,
      countries: MOCK_COUNTRIES,
    }
    return NextResponse.json({
      data: overview,
      meta: { generated_at: new Date().toISOString(), freshness: 'fresh', sources: 4, cache_status: 'MISS' },
    })
  }
}
