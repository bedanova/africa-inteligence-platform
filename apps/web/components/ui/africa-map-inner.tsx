'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { CountrySummary } from '@/types'

interface Props {
  countries: CountrySummary[]
}

type ScoreType = 'need' | 'opportunity' | 'stability'

// Country capital/centroid coordinates (approximate)
const CENTROIDS: Record<string, [number, number]> = {
  KEN: [37.91, -0.02], ETH: [40.49, 9.15],  TZA: [34.89, -6.37], RWA: [29.87, -1.94],
  UGA: [32.29,  1.37], MOZ: [35.53, -18.67], MDG: [46.87, -18.77],
  NGA: [ 8.68,  9.08], GHA: [-1.02,  7.95],  SEN: [-14.45, 14.50],
  CIV: [-5.55,  7.54], CMR: [12.35,  5.67],
  ZAF: [22.94, -30.56], ZMB: [27.85, -13.13], AGO: [17.87, -11.20],
  EGY: [30.80,  26.82], MAR: [-7.09,  31.79], DZA: [1.66,  28.03],
  TUN: [ 9.54,  33.89], COD: [23.66,  -2.88],
}

function scoreColor(score: number, type: ScoreType): string {
  if (type === 'need') {
    if (score >= 70) return '#ef4444'
    if (score >= 50) return '#f97316'
    return '#fbbf24'
  }
  if (type === 'opportunity') {
    if (score >= 65) return '#22c55e'
    if (score >= 50) return '#84cc16'
    return '#a3e635'
  }
  // stability
  if (score >= 65) return '#3b82f6'
  if (score >= 45) return '#60a5fa'
  return '#93c5fd'
}

const SCORE_LABELS: Record<ScoreType, string> = {
  need: 'Need',
  opportunity: 'Opportunity',
  stability: 'Stability',
}

export function AfricaMapInner({ countries }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const [scoreType, setScoreType] = useState<ScoreType>('need')

  // Build/update markers whenever map or scoreType changes
  function addMarkers(m: maplibregl.Map, type: ScoreType) {
    // Remove existing markers
    markersRef.current.forEach((mk) => mk.remove())
    markersRef.current = []

    countries.forEach((country) => {
      const coords = CENTROIDS[country.iso3]
      if (!coords) return

      const score = country.scores[type]
      const color = scoreColor(score, type)

      // Create DOM element for marker
      const el = document.createElement('div')
      el.style.cssText = `
        width: 36px; height: 36px;
        border-radius: 50%;
        background: ${color};
        border: 2.5px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        font-size: 11px; font-weight: 700; color: white;
        font-family: system-ui, sans-serif;
        transition: transform 0.15s;
      `
      el.textContent = String(score)
      el.title = `${country.name}: ${SCORE_LABELS[type]} ${score}`

      el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.2)' })
      el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })

      // Popup shown on hover (desktop) and briefly on click/tap before navigating (mobile)
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 22,
      }).setHTML(`
        <div style="font-family:system-ui,sans-serif;padding:6px 10px;min-width:140px">
          <div style="font-size:13px;font-weight:600;margin-bottom:4px">${country.name} →</div>
          <div style="font-size:11px;color:#64748b;line-height:1.6">
            Need <b style="color:#e11d48">${country.scores.need}</b>&nbsp;·&nbsp;Opp <b style="color:#059669">${country.scores.opportunity}</b>&nbsp;·&nbsp;Stab <b style="color:#2563eb">${country.scores.stability}</b>
          </div>
        </div>
      `)

      el.addEventListener('mouseenter', () => popup.addTo(m))
      el.addEventListener('mouseleave', () => { if (!el.dataset.clicked) popup.remove() })

      el.addEventListener('click', () => {
        // Show popup briefly so the user sees what they tapped, then navigate
        el.dataset.clicked = '1'
        el.style.transform = 'scale(1.15)'
        popup.addTo(m)
        setTimeout(() => {
          window.location.href = `/countries/${country.iso3.toLowerCase()}`
        }, 700)
      })

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(m)

      markersRef.current.push(marker)
    })
  }

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: [20, 5],
      zoom: 2.8,
      minZoom: 1.5,
      maxZoom: 8,
      attributionControl: false,
      // Require two fingers to pan on touch devices so page scroll works normally
      cooperativeGestures: true,
    })

    map.current.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
    map.current.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    map.current.on('load', () => {
      if (map.current) addMarkers(map.current, scoreType)
    })

    return () => {
      markersRef.current.forEach((mk) => mk.remove())
      map.current?.remove()
      map.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-add markers when scoreType changes (after map is loaded)
  useEffect(() => {
    if (!map.current) return
    if (map.current.loaded()) {
      addMarkers(map.current, scoreType)
    } else {
      map.current.once('load', () => { if (map.current) addMarkers(map.current, scoreType) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoreType, countries])

  return (
    <div>
      {/* Score type toggle */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {(['need', 'opportunity', 'stability'] as ScoreType[]).map((t) => (
          <button
            key={t}
            onClick={() => setScoreType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              scoreType === t
                ? t === 'need' ? 'bg-rose-500 text-white'
                  : t === 'opportunity' ? 'bg-emerald-600 text-white'
                  : 'bg-blue-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {SCORE_LABELS[t]}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-400 mb-3">
        Tap or click a country marker to open its profile · Two fingers to pan on mobile
      </p>

      {/* Map — height responsive: 300px mobile, up to 440px desktop */}
      <div
        ref={mapContainer}
        style={{ height: 'clamp(300px, 65vw, 440px)', borderRadius: 12, overflow: 'hidden' }}
      />
    </div>
  )
}
