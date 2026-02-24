import { notFound } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Contest, Election, Recommendation } from '@/lib/types/election.types'
import { ContestCard } from '@/components/ballot/ContestCard'
import { Button } from '@/components/ui/Button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ElectionDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch election
  const { data: electionRaw } = await supabase
    .from('elections')
    .select('*')
    .eq('id', id)
    .single()

  if (!electionRaw) {
    notFound()
  }

  // Fetch contests separately to avoid embedded select type issues
  const { data: contestsRaw } = await supabase
    .from('ballot_contests')
    .select('*')
    .eq('election_id', id)

  const contests = (contestsRaw || []) as unknown as Contest[]
  const election = electionRaw as unknown as Election

  // Fetch cached recommendations for this user + all contests
  const contestIds = contests.map((c) => c.id)
  const { data: cachedRecs } = contestIds.length
    ? await supabase
        .from('recommendations')
        .select('*')
        .eq('user_id', user!.id)
        .in('contest_id', contestIds)
    : { data: [] }

  const recMap: Record<string, Recommendation> = {}
  for (const rec of cachedRecs || []) {
    recMap[(rec as { contest_id: string }).contest_id] = rec as unknown as Recommendation
  }

  const electionDate = parseISO(election.election_date)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            ← Back to Dashboard
          </Button>
        </Link>

        <h1 className="text-2xl font-bold text-gray-900">{election.name}</h1>
        <p className="text-gray-500 mt-1">
          {format(electionDate, 'EEEE, MMMM d, yyyy')}
          {election.state && ` · ${election.state}`}
        </p>

        <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
          <strong>🤖 Personalized AI Recommendations</strong> — Each recommendation below is
          generated based on your stated values and socioeconomic background. Expand any contest to
          read the full reasoning and sources.
        </div>
      </div>

      {contests.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No contests found for this election.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {contests.map((contest) => (
            <ContestCard
              key={contest.id}
              contest={contest}
              cachedRecommendation={recMap[contest.id] ?? null}
            />
          ))}
        </div>
      )}
    </div>
  )
}
