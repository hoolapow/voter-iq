'use client'

import { useState, useEffect } from 'react'
import { AlignmentScore } from '@/lib/types/representative.types'
import { AlignmentBadge } from './AlignmentBadge'
import { OutOfCharacterList } from './OutOfCharacterList'

interface AlignmentPanelProps {
  representativeId: string
  initialAlignment: AlignmentScore | null
}

export function AlignmentPanel({ representativeId, initialAlignment }: AlignmentPanelProps) {
  const [alignment, setAlignment] = useState<AlignmentScore | null>(initialAlignment)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialAlignment) generate()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/representatives/${representativeId}/alignment`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to generate analysis')
      setAlignment(data.alignment)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate analysis')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-gray-600 text-sm">Analyzing voting record against your profile…</p>
        </div>
      </div>
    )
  }

  if (!alignment) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-red-600 text-sm">{error ?? 'Unable to load analysis.'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Score header */}
      <div className="flex items-start gap-6 bg-white rounded-xl border border-gray-200 p-6">
        <AlignmentBadge score={alignment.score} size="lg" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Alignment with Your Profile</h3>
          <p className="text-gray-700 leading-relaxed">{alignment.summary}</p>
        </div>
      </div>

      {/* Agreements & Divergences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {alignment.key_alignments.length > 0 && (
          <div className="bg-green-50 rounded-xl border border-green-200 p-5">
            <h4 className="text-sm font-semibold text-green-800 uppercase tracking-wide mb-3">
              Areas of Agreement
            </h4>
            <ul className="space-y-2">
              {alignment.key_alignments.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-green-900">
                  <span className="flex-shrink-0 mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {alignment.key_divergences.length > 0 && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-5">
            <h4 className="text-sm font-semibold text-red-800 uppercase tracking-wide mb-3">
              Areas of Divergence
            </h4>
            <ul className="space-y-2">
              {alignment.key_divergences.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-red-900">
                  <span className="flex-shrink-0 mt-0.5">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Out of character */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Out-of-Character Votes & Bills
        </h4>
        <OutOfCharacterList flags={alignment.out_of_character} />
      </div>
    </div>
  )
}
