'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RepresentativeDetail } from '@/lib/types/representative.types'
import { AlignmentPanel } from './AlignmentPanel'
import { VoteHistoryTable } from './VoteHistoryTable'
import { BillsList } from './BillsList'

interface RepresentativeDetailClientProps {
  detail: RepresentativeDetail
}

type Tab = 'overview' | 'votes' | 'bills'

function partyChip(party: string | null) {
  const p = party?.toLowerCase() ?? ''
  if (p.includes('democrat')) return 'bg-blue-100 text-blue-800'
  if (p.includes('republican')) return 'bg-red-100 text-red-800'
  if (p.includes('independent') || p.includes('libertarian') || p.includes('green'))
    return 'bg-amber-100 text-amber-800'
  return 'bg-gray-100 text-gray-700'
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(' ')
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : parts[0].substring(0, 2)
  return (
    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-2xl flex-shrink-0">
      {initials.toUpperCase()}
    </div>
  )
}

export function RepresentativeDetailClient({ detail }: RepresentativeDetailClientProps) {
  const [tab, setTab] = useState<Tab>('overview')
  const { votes, bills, alignment, ...rep } = detail

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Alignment Overview' },
    { key: 'votes', label: 'Voting History', count: votes.length },
    { key: 'bills', label: 'Bills', count: bills.length },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6 inline-flex items-center gap-1"
      >
        ← Back to Dashboard
      </Link>

      {/* Representative header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex items-start gap-5">
          {rep.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={rep.photo_url}
              alt={rep.name}
              className="w-20 h-20 rounded-full object-cover flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <Initials name={rep.name} />
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{rep.name}</h1>
            <p className="text-gray-600 mt-0.5">{rep.office}</p>
            {rep.district && <p className="text-sm text-gray-500">{rep.district}</p>}

            <div className="mt-3 flex flex-wrap gap-2">
              {rep.party && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${partyChip(rep.party)}`}>
                  {rep.party}
                </span>
              )}
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 capitalize">
                {rep.level === 'federal' ? 'Federal' : 'State'} •{' '}
                {rep.chamber === 'senate' || rep.chamber === 'upper' ? 'Senate' : 'House'}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                {rep.state}
              </span>
            </div>

            {/* Contact info */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
              {rep.phone && <span>{rep.phone}</span>}
              {rep.website && (
                <a
                  href={rep.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Official Website →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex gap-0 -mb-px">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === key
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
              {count != null && count > 0 && (
                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <AlignmentPanel representativeId={rep.id} initialAlignment={alignment} />
      )}
      {tab === 'votes' && <VoteHistoryTable votes={votes} />}
      {tab === 'bills' && <BillsList bills={bills} />}
    </div>
  )
}
