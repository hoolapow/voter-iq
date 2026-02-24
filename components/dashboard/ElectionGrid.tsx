'use client'

import { useEffect, useState } from 'react'
import { Election } from '@/lib/types/election.types'
import { ElectionCard } from './ElectionCard'
import { Spinner } from '@/components/ui/Spinner'

export function ElectionGrid() {
  const [elections, setElections] = useState<(Election & { contests?: unknown[] })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/elections')
      .then((r) => r.json())
      .then(({ elections }) => {
        setElections(elections || [])
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load elections. Please refresh.')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500">Loading elections for your area…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-6 py-4 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (elections.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-gray-600">No upcoming elections found for your ZIP code.</p>
        <p className="text-sm text-gray-400 mt-1">Check back closer to election season.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {elections.map((election) => (
        <ElectionCard key={election.id} election={election} />
      ))}
    </div>
  )
}
