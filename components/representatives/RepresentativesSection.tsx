'use client'

import { useEffect, useState } from 'react'
import { Representative, AlignmentScore } from '@/lib/types/representative.types'
import { RepresentativeCard } from './RepresentativeCard'

interface RepData {
  representative: Representative
  alignment: AlignmentScore | null
}

export function RepresentativesSection() {
  const [reps, setReps] = useState<Representative[]>([])
  const [alignments, setAlignments] = useState<Record<string, AlignmentScore>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/representatives')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error)
        setReps(data.representatives ?? [])
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <p className="text-sm text-gray-500">
        Unable to load representatives right now.
      </p>
    )
  }

  if (reps.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No representatives found. Make sure your ZIP code is set in your profile.
      </p>
    )
  }

  const cardData: RepData[] = reps.map((rep) => ({
    representative: rep,
    alignment: alignments[rep.id] ?? null,
  }))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {cardData.map(({ representative, alignment }) => (
        <RepresentativeCard
          key={representative.id}
          representative={representative}
          alignment={alignment}
        />
      ))}
    </div>
  )
}
