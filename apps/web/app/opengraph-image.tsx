import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'AfricaImpactLab — Africa Data & Impact Intelligence'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const SOURCES = ['UN', 'World Bank', 'WHO', 'ACLED', 'IMF', 'UNHCR']

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #0f2a4a 60%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '64px',
        }}
      >
        {/* Logo mark */}
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 22,
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 36,
            boxShadow: '0 8px 32px rgba(59,130,246,0.35)',
          }}
        >
          <span style={{ color: 'white', fontSize: 48, fontWeight: 900, lineHeight: 1 }}>A</span>
        </div>

        {/* Brand name */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0px', marginBottom: 20 }}>
          <span style={{ color: '#f1f5f9', fontSize: 60, fontWeight: 700, letterSpacing: '-1px' }}>Africa</span>
          <span style={{ color: '#3b82f6', fontSize: 60, fontWeight: 700, letterSpacing: '-1px' }}>Impact</span>
          <span style={{ color: '#64748b', fontSize: 44, fontWeight: 400, marginLeft: 2 }}>Lab</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            color: '#94a3b8',
            fontSize: 24,
            textAlign: 'center',
            maxWidth: 680,
            lineHeight: 1.5,
            marginBottom: 48,
          }}
        >
          Daily AI briefs, verified partners, and actionable data insights on Africa
        </div>

        {/* Data source pills */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {SOURCES.map((source) => (
            <div
              key={source}
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                padding: '8px 18px',
                color: '#94a3b8',
                fontSize: 16,
              }}
            >
              {source}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
