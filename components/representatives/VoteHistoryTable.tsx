'use client'

import { useState } from 'react'
import { RepresentativeVote, PolicyArea } from '@/lib/types/representative.types'

interface VoteHistoryTableProps {
  votes: RepresentativeVote[]
}

const POLICY_LABELS: Record<PolicyArea, string> = {
  environment: 'Environment',
  safety_net: 'Safety Net',
  guns: 'Guns',
  immigration: 'Immigration',
  healthcare: 'Healthcare',
  abortion: 'Abortion',
  education: 'Education',
  criminal_justice: 'Criminal Justice',
  lgbtq_rights: 'LGBTQ+ Rights',
  other: 'Other',
}

const POLICY_COLORS: Record<PolicyArea, string> = {
  environment: 'bg-green-100 text-green-800',
  safety_net: 'bg-purple-100 text-purple-800',
  guns: 'bg-orange-100 text-orange-800',
  immigration: 'bg-yellow-100 text-yellow-800',
  healthcare: 'bg-blue-100 text-blue-800',
  abortion: 'bg-pink-100 text-pink-800',
  education: 'bg-indigo-100 text-indigo-800',
  criminal_justice: 'bg-red-100 text-red-800',
  lgbtq_rights: 'bg-fuchsia-100 text-fuchsia-800',
  other: 'bg-gray-100 text-gray-700',
}

function VoteChip({ choice }: { choice: RepresentativeVote['vote_choice'] }) {
  const styles: Record<string, string> = {
    yea: 'bg-green-100 text-green-800',
    nay: 'bg-red-100 text-red-800',
    nv: 'bg-gray-100 text-gray-600',
    absent: 'bg-gray-100 text-gray-500',
  }
  const labels: Record<string, string> = { yea: 'YEA', nay: 'NAY', nv: 'N/V', absent: 'ABS' }
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[choice]}`}>
      {labels[choice]}
    </span>
  )
}

type SortKey = 'date' | 'policy'

export function VoteHistoryTable({ votes }: VoteHistoryTableProps) {
  const [sortBy, setSortBy] = useState<SortKey>('date')
  const [filterPolicy, setFilterPolicy] = useState<PolicyArea | 'all'>('all')

  const policies = Array.from(new Set(votes.map((v) => v.policy_area).filter(Boolean))) as PolicyArea[]

  const filtered = votes
    .filter((v) => filterPolicy === 'all' || v.policy_area === filterPolicy)
    .slice(0, 50)
    .sort((a, b) => {
      if (sortBy === 'date') return b.vote_date.localeCompare(a.vote_date)
      return (a.policy_area ?? 'other').localeCompare(b.policy_area ?? 'other')
    })

  if (votes.length === 0) {
    return <p className="text-sm text-gray-500 italic">No voting record available.</p>
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="flex gap-2">
          <span className="text-xs text-gray-500 self-center">Sort:</span>
          {(['date', 'policy'] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                sortBy === key
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {key === 'date' ? 'Date' : 'Policy Area'}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-gray-500 self-center">Filter:</span>
          <button
            onClick={() => setFilterPolicy('all')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              filterPolicy === 'all'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          {policies.map((p) => (
            <button
              key={p}
              onClick={() => setFilterPolicy(p)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                filterPolicy === p
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {POLICY_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wide">
              <th className="pb-2 pr-4 font-medium">Bill</th>
              <th className="pb-2 pr-4 font-medium">Policy Area</th>
              <th className="pb-2 pr-4 font-medium">Date</th>
              <th className="pb-2 font-medium">Vote</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((vote) => (
              <tr key={vote.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-4">
                  <div>
                    <span className="font-mono text-xs text-gray-500 mr-2">{vote.bill_number}</span>
                    <span className="text-gray-800">{vote.bill_title}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  {vote.policy_area ? (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        POLICY_COLORS[vote.policy_area as PolicyArea]
                      }`}
                    >
                      {POLICY_LABELS[vote.policy_area as PolicyArea]}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="py-3 pr-4 text-gray-500 text-xs whitespace-nowrap">
                  {new Date(vote.vote_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="py-3">
                  <VoteChip choice={vote.vote_choice as RepresentativeVote['vote_choice']} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 50 && (
        <p className="mt-3 text-xs text-gray-400 text-center">Showing most recent 50 votes</p>
      )}
    </div>
  )
}
