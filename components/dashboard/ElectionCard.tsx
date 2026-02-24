import Link from 'next/link'
import { format, parseISO, isPast } from 'date-fns'
import { Election } from '@/lib/types/election.types'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ElectionCardProps {
  election: Election & { contests?: unknown[] }
}

export function ElectionCard({ election }: ElectionCardProps) {
  const date = parseISO(election.election_date)
  const past = isPast(date)
  const contestCount = election.contests?.length ?? 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 truncate">{election.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {format(date, 'MMMM d, yyyy')}
              {election.state && ` · ${election.state}`}
            </p>
          </div>
          <span
            className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
              past
                ? 'bg-gray-100 text-gray-500'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {past ? 'Past' : 'Upcoming'}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <span>🗳️</span>
            {contestCount} {contestCount === 1 ? 'contest' : 'contests'}
          </span>
          {!past && (
            <span className="flex items-center gap-1.5">
              <span>🤖</span>
              AI recommendations available
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/election/${election.id}`} className="w-full">
          <Button variant={past ? 'secondary' : 'primary'} className="w-full">
            {past ? 'View Results & Recommendations' : 'Get My Recommendations'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
