'use client'

import { useState, useEffect, useCallback } from 'react'
import { Contest, Recommendation } from '@/lib/types/election.types'
import { Candidate } from '@/lib/types/election.types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { CandidateCard } from './CandidateCard'
import { RecommendationBadge } from './RecommendationBadge'
import { ReasoningPanel } from './ReasoningPanel'

interface ContestCardProps {
  contest: Contest
  cachedRecommendation: Recommendation | null
}

export function ContestCard({ contest, cachedRecommendation }: ContestCardProps) {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(cachedRecommendation)
  const [loading, setLoading] = useState(!cachedRecommendation)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendation = useCallback(async () => {
    if (recommendation) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contest_id: contest.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate recommendation')
      setRecommendation(data.recommendation)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [contest.id, recommendation])

  useEffect(() => {
    fetchRecommendation()
  }, [fetchRecommendation])

  const contestLabel =
    contest.contest_type === 'referendum'
      ? 'Ballot Measure'
      : contest.contest_type === 'retention'
      ? 'Retention Vote'
      : 'Candidate Race'

  // Find recommended candidate
  const recommendedCandidateName = recommendation
    ? (contest.candidates as Candidate[] | null)?.find((c) =>
        recommendation.recommendation.toLowerCase().includes(c.name.toLowerCase())
      )?.name
    : null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {contestLabel}
            </span>
            <h3 className="font-semibold text-gray-900 mt-0.5">
              {contest.contest_type === 'referendum'
                ? contest.referendum_question
                : contest.office}
            </h3>
            {contest.district && (
              <p className="text-sm text-gray-500 mt-0.5">{contest.district}</p>
            )}
          </div>

          {loading && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Spinner size="sm" />
              <span>Analyzing…</span>
            </div>
          )}

          {!loading && recommendation && (
            <RecommendationBadge
              recommendation={recommendation.recommendation}
              contestType={contest.contest_type}
            />
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Candidate race */}
        {contest.contest_type !== 'referendum' && contest.candidates && (
          <div className="flex flex-col gap-2">
            {(contest.candidates as Candidate[]).map((c) => (
              <CandidateCard
                key={c.name}
                candidate={c}
                isRecommended={c.name === recommendedCandidateName}
              />
            ))}
          </div>
        )}

        {/* Referendum */}
        {contest.contest_type === 'referendum' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-xs font-bold text-green-700 mb-1">If YES</p>
              <p className="text-sm text-green-800">{contest.referendum_yes_meaning}</p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-xs font-bold text-red-700 mb-1">If NO</p>
              <p className="text-sm text-red-800">{contest.referendum_no_meaning}</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="mt-3 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-sm text-yellow-800">
            <span className="font-medium">Recommendation unavailable: </span>
            {error}
            <button
              onClick={() => { setError(null); fetchRecommendation() }}
              className="ml-2 text-yellow-700 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Reasoning panel */}
        {recommendation && <ReasoningPanel recommendation={recommendation} />}
      </CardContent>
    </Card>
  )
}
