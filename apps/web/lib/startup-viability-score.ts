/**
 * Startup Viability Score (SVS) — 0–100
 *
 * Components:
 *   25 pts — Market Need Fit     (country need score × sector relevance)
 *   20 pts — Opportunity Context (country opportunity score)
 *   20 pts — Traction Evidence   (press coverage, metrics available)
 *   20 pts — Funding Signals     (has raise, source quality)
 *   15 pts — Founder Visibility  (public founder info)
 */

interface ScoringInput {
  country_need: number        // 0–100
  country_opportunity: number // 0–100
  has_source_url: boolean
  has_funding: boolean
  funding_source: string | null
  has_founder_name: boolean
  verification_tier: 'A' | 'B' | 'C' | 'unverified'
}

export function calculateViabilityScore(input: ScoringInput): number {
  // 1. Market Need Fit (25 pts) — country need × 0.25
  const needFit = (input.country_need / 100) * 25

  // 2. Opportunity Context (20 pts) — country opportunity × 0.20
  const oppContext = (input.country_opportunity / 100) * 20

  // 3. Traction Evidence (20 pts)
  let traction = 0
  if (input.has_source_url) traction += 12  // has verifiable press coverage
  if (input.verification_tier === 'A') traction += 8
  else if (input.verification_tier === 'B') traction += 4

  // 4. Funding Signals (20 pts)
  let funding = 0
  if (input.has_funding) {
    funding += 12
    if (input.funding_source) funding += 8
  }

  // 5. Founder Visibility (15 pts)
  const founder = input.has_founder_name ? 15 : 0

  const total = needFit + oppContext + traction + funding + founder
  return Math.min(100, Math.round(total))
}
