import { NextResponse } from 'next/server'
import { MOCK_COUNTRIES, MOCK_BRIEFS } from '@/lib/mock-data'
import type { HomeOverview, LeaderboardEntry } from '@/types'

function buildLeaderboard(
  scoreKey: 'need' | 'opportunity' | 'stability',
  descending = true,
  limit = 4,
): LeaderboardEntry[] {
  return [...MOCK_COUNTRIES]
    .sort((a, b) =>
      descending
        ? b.scores[scoreKey] - a.scores[scoreKey]
        : a.scores[scoreKey] - b.scores[scoreKey],
    )
    .slice(0, limit)
    .map((c) => ({ iso3: c.iso3, name: c.name, flag_emoji: c.flag_emoji, score: c.scores[scoreKey] }))
}

export async function GET() {
  const overview: HomeOverview = {
    snapshot_date: new Date().toISOString(),
    ingest_status: 'ok',
    leaderboards: {
      highest_need: buildLeaderboard('need', true),
      fastest_opportunity: buildLeaderboard('opportunity', true),
      most_improved_stability: buildLeaderboard('stability', true),
      attention_gap: buildLeaderboard('need', true, 4).filter((e) => {
        const country = MOCK_COUNTRIES.find((c) => c.iso3 === e.iso3)
        return country ? country.scores.opportunity < 60 : false
      }),
    },
    top_briefs: MOCK_BRIEFS,
    countries: MOCK_COUNTRIES,
  }

  return NextResponse.json({
    data: overview,
    meta: {
      generated_at: new Date().toISOString(),
      freshness: 'fresh',
      sources: 4,
      cache_status: 'MISS',
    },
  })
}
