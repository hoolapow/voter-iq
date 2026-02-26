'use client'

import { useState, useCallback } from 'react'
import { ComposableMap, Geographies, Geography, type Geography as GeoType } from 'react-simple-maps'
import { useSupabase } from '@/components/providers/SupabaseProvider'
import { getCountyColorInfo, ELECTION_SCHEDULE } from '@/lib/data/election-schedule'
import { CountyPanel } from './CountyPanel'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json'

interface TooltipState {
  x: number
  y: number
  content: string
}

function getGeoName(geo: GeoType): string {
  return String(geo.properties.name ?? '')
}

function MapLegend() {
  const legendItems = [
    { fill: '#B91C1C', label: 'Voting now' },
    { fill: '#EA580C', label: 'Ballots available soon' },
    { fill: '#CA8A04', label: 'Coming soon' },
    { fill: '#16A34A', label: 'On the horizon' },
    { fill: '#D1D5DB', label: 'No upcoming data' },
  ]

  return (
    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-md p-3">
      <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Legend</p>
      <div className="space-y-1.5">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-3.5 h-3.5 rounded-sm shrink-0"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-xs text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function VotingMap() {
  const { user } = useSupabase()
  const isAuthenticated = !!user

  const [selectedFips, setSelectedFips] = useState<string | null>(null)
  const [selectedCountyName, setSelectedCountyName] = useState<string>('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const handleCountyClick = useCallback((geo: GeoType) => {
    const fips = String(geo.id).padStart(5, '0')
    const name = getGeoName(geo)
    const stateFips = fips.slice(0, 2)
    const stateInfo = ELECTION_SCHEDULE[stateFips]
    const countyLabel = stateInfo ? `${name}, ${stateInfo.stateName}` : name

    setSelectedFips(fips)
    setSelectedCountyName(countyLabel)
    setPanelOpen(true)
  }, [])

  const handleMouseMove = useCallback((geo: GeoType, e: React.MouseEvent<SVGPathElement>) => {
    const fips = String(geo.id).padStart(5, '0')
    const stateFips = fips.slice(0, 2)
    const stateInfo = ELECTION_SCHEDULE[stateFips]
    const colorInfo = getCountyColorInfo(fips)
    const name = getGeoName(geo)

    let content = name
    if (stateInfo) {
      const dateStr = new Date(stateInfo.nextElection + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      content = `${name}, ${stateInfo.stateName}\n${stateInfo.electionType}: ${dateStr}\n${colorInfo.label}`
    }

    setTooltip({ x: e.clientX, y: e.clientY, content })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  return (
    <div className="relative w-full h-full">
      <ComposableMap
        projection="geoAlbersUsa"
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const fips = String(geo.id).padStart(5, '0')
              const colorInfo = getCountyColorInfo(fips)
              const isSelected = selectedFips === fips

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => handleCountyClick(geo)}
                  onMouseMove={(e) => handleMouseMove(geo, e)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    default: {
                      fill: isSelected ? colorInfo.hoverFill : colorInfo.fill,
                      stroke: '#FFFFFF',
                      strokeWidth: 0.3,
                      outline: 'none',
                      cursor: 'pointer',
                    },
                    hover: {
                      fill: colorInfo.hoverFill,
                      stroke: '#FFFFFF',
                      strokeWidth: 0.5,
                      outline: 'none',
                      cursor: 'pointer',
                    },
                    pressed: {
                      fill: colorInfo.hoverFill,
                      stroke: '#FFFFFF',
                      strokeWidth: 0.5,
                      outline: 'none',
                      cursor: 'pointer',
                    },
                  }}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>

      <MapLegend />

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-[200px] whitespace-pre-line"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          {tooltip.content}
        </div>
      )}

      <CountyPanel
        fips={selectedFips}
        countyName={selectedCountyName}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        isAuthenticated={isAuthenticated}
      />
    </div>
  )
}
