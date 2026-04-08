import { ImageResponse } from 'next/og'
import { getCountry } from '@/lib/supabase-server'
import { MOCK_COUNTRIES } from '@/lib/mock-data'

export const alt = 'Country profile'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const SCORES = [
  { label: 'Need',        key: 'need'        as const, color: '#e11d48' },
  { label: 'Opportunity', key: 'opportunity'  as const, color: '#059669' },
  { label: 'Stability',   key: 'stability'    as const, color: '#2563eb' },
]

export default async function Image({
  params,
}: {
  params: Promise<{ iso3: string }>
}) {
  const { iso3 } = await params
  const country =
    (await getCountry(iso3.toUpperCase()).catch(() => null)) ??
    MOCK_COUNTRIES.find((c) => c.iso3 === iso3.toUpperCase()) ??
    null

  if (!country) {
    return new ImageResponse(
      <div style={{ background: '#0f172a', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 32, fontFamily: 'system-ui' }}>
        Country not found
      </div>,
      { ...size }
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #0f2a4a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px 72px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header: flag emoji + country name + region */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 48 }}>
          <span style={{ fontSize: 80, lineHeight: 1 }}>{country.flag_emoji}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ color: '#f1f5f9', fontSize: 56, fontWeight: 700, lineHeight: 1, letterSpacing: '-1px' }}>
              {country.name}
            </span>
            <span style={{ color: '#64748b', fontSize: 22 }}>{country.region}</span>
          </div>
        </div>

        {/* Score cards */}
        <div style={{ display: 'flex', gap: 20, flex: 1 }}>
          {SCORES.map(({ label, key, color }) => (
            <div
              key={key}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 20,
                padding: '28px 32px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <span style={{ color, fontSize: 64, fontWeight: 800, lineHeight: 1 }}>
                {Math.round(country.scores[key])}
              </span>
              <span style={{ color: '#94a3b8', fontSize: 20, marginTop: 10 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: 'white', fontSize: 20, fontWeight: 900 }}>A</span>
            </div>
            <span style={{ color: '#475569', fontSize: 18, fontWeight: 600 }}>AfricaImpactLab</span>
          </div>
          <span style={{ color: '#334155', fontSize: 15 }}>africaimpactlab.com</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
