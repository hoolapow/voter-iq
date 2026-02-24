import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getElectionsForZipcode } from '@/lib/civic/client'
import { Json, Database } from '@/lib/types/database.types'

type ElectionRow = Database['public']['Tables']['elections']['Row']

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user's zipcode from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('zipcode')
    .eq('id', user.id)
    .single()

  const zipcode = profile?.zipcode || '90210'

  // Fetch from Civic API (or mock)
  const elections = await getElectionsForZipcode(zipcode)

  // Upsert elections + contests to DB (using service role)
  const service = createServiceClient()

  for (const election of elections) {
    const { data: upsertedRaw, error: electionError } = await service
      .from('elections')
      .upsert(
        {
          external_id: election.external_id,
          name: election.name,
          election_date: election.election_date,
          state: election.state,
          zipcodes: election.zipcodes,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'external_id' }
      )
      .select()
      .single()

    if (electionError) {
      console.error('Election upsert error:', electionError)
      continue
    }

    const upsertedElection = upsertedRaw as unknown as ElectionRow | null

    if (upsertedElection && election.contests) {
      for (const contest of election.contests) {
        await service.from('ballot_contests').insert({
          election_id: upsertedElection.id,
          office: contest.office,
          contest_type: contest.contest_type,
          district: contest.district,
          candidates: (contest.candidates ?? null) as Json | null,
          referendum_question: contest.referendum_question,
          referendum_yes_meaning: contest.referendum_yes_meaning,
          referendum_no_meaning: contest.referendum_no_meaning,
        })
      }
    }
  }

  // Fetch stored elections with contests
  const { data: storedElections } = await supabase
    .from('elections')
    .select('*, contests:ballot_contests(*)')
    .order('election_date', { ascending: true })

  // If DB is empty (first run), return mock data directly
  if (!storedElections || storedElections.length === 0) {
    return NextResponse.json({ elections })
  }

  return NextResponse.json({ elections: storedElections })
}
