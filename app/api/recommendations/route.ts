import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generateRecommendation } from '@/lib/claude/prompts'
import { Contest } from '@/lib/types/election.types'
import { Json, Database } from '@/lib/types/database.types'

type DemographicRow = Database['public']['Tables']['survey_demographic']['Row']
type ValuesRow = Database['public']['Tables']['survey_values']['Row']

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { contest_id } = await request.json()

  if (!contest_id) {
    return NextResponse.json({ error: 'contest_id is required' }, { status: 400 })
  }

  // Check cache first
  const { data: cached } = await supabase
    .from('recommendations')
    .select('*')
    .eq('user_id', user.id)
    .eq('contest_id', contest_id)
    .single()

  if (cached) {
    return NextResponse.json({ recommendation: cached })
  }

  // Fetch contest
  const { data: contest, error: contestError } = await supabase
    .from('ballot_contests')
    .select('*')
    .eq('id', contest_id)
    .single()

  if (contestError || !contest) {
    return NextResponse.json({ error: 'Contest not found' }, { status: 404 })
  }

  // Fetch user's surveys
  const [{ data: demographics }, { data: values }] = await Promise.all([
    supabase.from('survey_demographic').select('*').eq('user_id', user.id).single(),
    supabase.from('survey_values').select('*').eq('user_id', user.id).single(),
  ])

  if (!demographics || !values) {
    return NextResponse.json(
      { error: 'Survey data not found. Please complete both surveys.' },
      { status: 422 }
    )
  }

  // Generate with Claude
  let generated: Awaited<ReturnType<typeof generateRecommendation>>
  try {
    generated = await generateRecommendation(
      contest as unknown as Contest,
      demographics as DemographicRow,
      values as ValuesRow
    )
  } catch (err) {
    console.error('Claude generation error:', err)
    return NextResponse.json(
      { error: 'Failed to generate recommendation. Please try again.' },
      { status: 500 }
    )
  }

  // Save via service role (bypasses RLS insert restriction for users)
  const service = createServiceClient()
  const { data: saved, error: saveError } = await service
    .from('recommendations')
    .insert({
      user_id: user.id,
      contest_id,
      recommendation: generated.recommendation,
      reasoning: generated.reasoning,
      references: (generated.references ?? null) as Json | null,
      key_factors: (generated.key_factors ?? null) as Json | null,
    })
    .select()
    .single()

  if (saveError) {
    console.error('Recommendation save error:', saveError)
    // Still return the generated data even if save fails
    return NextResponse.json({
      recommendation: {
        id: 'temp',
        user_id: user.id,
        contest_id,
        ...generated,
        created_at: new Date().toISOString(),
      },
    })
  }

  return NextResponse.json({ recommendation: saved })
}
