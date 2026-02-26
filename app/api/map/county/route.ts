import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getElectionsForZipcode } from '@/lib/civic/client'
import { STATE_ZIPCODES } from '@/lib/data/state-zipcodes'
import { Json, Database } from '@/lib/types/database.types'

type ElectionRow = Database['public']['Tables']['elections']['Row']

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fips = searchParams.get('fips')

  if (!fips || fips.length < 2) {
    return NextResponse.json({ error: 'Missing or invalid fips parameter' }, { status: 400 })
  }

  const countyFips = fips.padStart(5, '0')
  const stateFips = countyFips.slice(0, 2)
  const zipcode = STATE_ZIPCODES[stateFips]

  if (!zipcode) {
    return NextResponse.json({ error: 'No zipcode mapping for state FIPS: ' + stateFips }, { status: 404 })
  }

  // Fetch from Civic API (or mock)
  const elections = await getElectionsForZipcode(zipcode)

  // Upsert elections + contests to DB (service role only — no user auth needed)
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
      // Only insert contests if none exist yet — prevents duplicates on repeated API calls
      const { count } = await service
        .from('ballot_contests')
        .select('id', { count: 'exact', head: true })
        .eq('election_id', upsertedElection.id)

      if (!count || count === 0) {
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
  }

  // Read back from DB using service client
  const { data: storedElections } = await service
    .from('elections')
    .select('*, contests:ballot_contests(*)')
    .order('election_date', { ascending: true })

  return NextResponse.json({
    elections: storedElections && storedElections.length > 0 ? storedElections : elections,
    stateFips,
    zipcode,
  })
}
