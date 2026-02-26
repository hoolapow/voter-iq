import { NextRequest, NextResponse } from 'next/server'
import { generateMapRecommendation } from '@/lib/claude/prompts'
import { ELECTION_SCHEDULE } from '@/lib/data/election-schedule'
import { Contest } from '@/lib/types/election.types'

export async function POST(request: NextRequest) {
  const { contest, stateFips } = await request.json()

  if (!contest) {
    return NextResponse.json({ error: 'contest is required' }, { status: 400 })
  }

  const stateName = ELECTION_SCHEDULE[stateFips as string]?.stateName ?? 'the United States'

  try {
    const generated = await generateMapRecommendation(
      contest as Contest,
      stateName,
      stateFips as string ?? '',
    )

    return NextResponse.json({
      recommendation: {
        id: `map-${contest.id}`,
        user_id: 'public',
        contest_id: contest.id,
        ...generated,
        created_at: new Date().toISOString(),
      },
    })
  } catch (err) {
    console.error('Map recommendation error:', err)
    return NextResponse.json(
      { error: 'Failed to generate recommendation' },
      { status: 500 }
    )
  }
}
