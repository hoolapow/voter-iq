import { Candidate } from '@/lib/types/election.types'

interface CandidateCardProps {
  candidate: Candidate
  isRecommended?: boolean
}

const PARTY_COLORS: Record<string, string> = {
  democratic: 'bg-blue-100 text-blue-700',
  democrat: 'bg-blue-100 text-blue-700',
  republican: 'bg-red-100 text-red-700',
  independent: 'bg-purple-100 text-purple-700',
  nonpartisan: 'bg-gray-100 text-gray-600',
  green: 'bg-green-100 text-green-700',
  libertarian: 'bg-yellow-100 text-yellow-700',
}

function partyColor(party?: string): string {
  if (!party) return 'bg-gray-100 text-gray-600'
  return PARTY_COLORS[party.toLowerCase()] || 'bg-gray-100 text-gray-600'
}

export function CandidateCard({ candidate, isRecommended }: CandidateCardProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${
        isRecommended
          ? 'border-blue-300 bg-blue-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
          {candidate.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 text-sm">{candidate.name}</span>
            {isRecommended && (
              <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium">
                Recommended
              </span>
            )}
          </div>
          {candidate.party && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${partyColor(candidate.party)}`}>
              {candidate.party}
            </span>
          )}
        </div>
      </div>
      {candidate.website && (
        <a
          href={candidate.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline"
        >
          Website ↗
        </a>
      )}
    </div>
  )
}
