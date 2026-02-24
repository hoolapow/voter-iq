'use client'

import { useState } from 'react'
import { Recommendation, Reference } from '@/lib/types/election.types'

interface ReasoningPanelProps {
  recommendation: Recommendation
}

export function ReasoningPanel({ recommendation }: ReasoningPanelProps) {
  const [open, setOpen] = useState(false)

  const references = recommendation.sources as Reference[] | null
  const keyFactors = recommendation.key_factors as string[] | null

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {open ? 'Hide' : 'See'} reasoning &amp; references
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {/* Reasoning */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Why this recommendation
            </h4>
            <div className="text-sm text-gray-700 space-y-2 leading-relaxed">
              {recommendation.reasoning.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>

          {/* Key Factors */}
          {keyFactors && keyFactors.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Key Factors
              </h4>
              <ul className="space-y-1">
                {keyFactors.map((factor, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-500 mt-0.5">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* References */}
          {references && references.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Sources &amp; References
              </h4>
              <ul className="space-y-2">
                {references.map((ref, i) => (
                  <li key={i} className="text-sm">
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {ref.title}
                    </a>
                    {ref.summary && (
                      <span className="text-gray-500"> — {ref.summary}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
            AI-generated recommendation based on your stated values. Always research candidates and
            measures independently before voting.
          </p>
        </div>
      )}
    </div>
  )
}
