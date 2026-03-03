'use client'

import Link from 'next/link'
import { Representative, AlignmentScore } from '@/lib/types/representative.types'
import { AlignmentBadge } from './AlignmentBadge'

interface RepresentativeCardProps {
  representative: Representative
  alignment: AlignmentScore | null
}

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
    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-lg flex-shrink-0">
      {initials.toUpperCase()}
    </div>
  )
}

export function RepresentativeCard({ representative: rep, alignment }: RepresentativeCardProps) {
  return (
    <Link
      href={`/representatives/${rep.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition-all"
    >
      <div className="flex items-start gap-4">
        {rep.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={rep.photo_url}
            alt={rep.name}
            className="w-14 h-14 rounded-full object-cover flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : null}
        {!rep.photo_url && <Initials name={rep.name} />}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900 truncate">{rep.name}</h3>
              <p className="text-sm text-gray-600 truncate">{rep.office}</p>
              {rep.district && (
                <p className="text-xs text-gray-500 truncate">{rep.district}</p>
              )}
            </div>
            {alignment ? (
              <AlignmentBadge score={alignment.score} size="sm" />
            ) : (
              <span className="text-xs text-gray-400 whitespace-nowrap pt-1">View analysis →</span>
            )}
          </div>

          {rep.party && (
            <span
              className={`mt-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${partyChip(rep.party)}`}
            >
              {rep.party}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
