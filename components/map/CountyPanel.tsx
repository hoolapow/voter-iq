'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ContestCard } from '@/components/ballot/ContestCard'
import { Election } from '@/lib/types/election.types'

interface CountyPanelProps {
  fips: string | null
  countyName: string
  isOpen: boolean
  onClose: () => void
  isAuthenticated: boolean
}

export function CountyPanel({ fips, countyName, isOpen, onClose, isAuthenticated }: CountyPanelProps) {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!fips || !isOpen) return

    setLoading(true)
    setError(null)
    setElections([])

    // countyName is e.g. "Los Angeles, California" — extract just the county part
    const rawCounty = countyName.split(', ')[0]
    const params = new URLSearchParams({ fips })
    if (rawCounty) params.set('county', rawCounty)

    fetch(`/api/map/county?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setElections(data.elections || [])
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load contests')
      })
      .finally(() => setLoading(false))
  }, [fips, isOpen])

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 z-40 bg-white shadow-2xl border-l border-gray-200 overflow-y-auto
          w-full sm:w-[480px]
          transition-transform duration-300
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ marginTop: 64, height: 'calc(100vh - 64px)' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">{countyName || 'County'}</h2>
            <p className="text-sm text-gray-500">Upcoming elections &amp; contests</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sign-in banner */}
        {!isAuthenticated && (
          <div className="mx-4 mt-4 rounded-lg bg-indigo-50 border border-indigo-200 px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-sm text-indigo-800">
              Sign in to get personalized AI recommendations for each contest.
            </p>
            <Link
              href="/auth/login"
              className="shrink-0 text-sm font-medium text-indigo-700 hover:text-indigo-900 underline"
            >
              Sign in
            </Link>
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading contests…
            </div>
          )}

          {error && !loading && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && elections.length === 0 && (
            <div className="py-12 text-center text-gray-500 text-sm">
              No upcoming elections found for this area.
            </div>
          )}

          {!loading && elections.map((election) => (
            <div key={election.id}>
              <h3 className="font-semibold text-gray-800 mb-1">{election.name}</h3>
              <p className="text-xs text-gray-500 mb-3">
                {new Date(election.election_date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <div className="space-y-3">
                {election.contests && election.contests.length > 0 ? (
                  election.contests.map((contest) => (
                    <ContestCard
                      key={contest.id}
                      contest={contest}
                      cachedRecommendation={null}
                      isAuthenticated={isAuthenticated}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic">No contests listed for this election.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
