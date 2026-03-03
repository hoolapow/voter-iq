import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { Representative } from '@/lib/types/representative.types'
import { getRepresentativesForZip } from '@/lib/legislators/client'
import { zipToStateFallback } from '@/lib/legislators/geocoder'

const STALE_AFTER_MS = 24 * 60 * 60 * 1000  // 24 hours

const CHAMBER_ORDER: Record<string, number> = {
  'federal-senate': 0,
  'federal-house': 1,
  'state-upper': 2,
  'state-lower': 3,
}

function sortReps(reps: Representative[]): Representative[] {
  return [...reps].sort((a, b) => {
    const ka = `${a.level}-${a.chamber ?? ''}`
    const kb = `${b.level}-${b.chamber ?? ''}`
    return (CHAMBER_ORDER[ka] ?? 9) - (CHAMBER_ORDER[kb] ?? 9)
  })
}

export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('zipcode')
      .eq('id', user.id)
      .single()

    if (!profile?.zipcode) {
      return NextResponse.json({ error: 'No zipcode on profile' }, { status: 422 })
    }

    const zipcode = profile.zipcode
    const state = zipToStateFallback(zipcode)

    // Check DB cache
    if (state) {
      const { data: cached } = await supabase
        .from('representatives')
        .select('*')
        .eq('state', state)
        .order('updated_at', { ascending: false })

      const typedCached = cached as (Representative & { updated_at: string })[] | null
      if (typedCached?.length) {
        const mostRecent = new Date(typedCached[0].updated_at).getTime()
        if (Date.now() - mostRecent < STALE_AFTER_MS) {
          return NextResponse.json({ representatives: sortReps(typedCached) })
        }
      }
    }

    // Fetch fresh data
    const reps = await getRepresentativesForZip(zipcode)

    if (reps.length > 0) {
      const service = createServiceClient()
      for (const rep of reps) {
        await service.from('representatives').upsert(
          {
            external_id: rep.external_id,
            source: rep.source,
            level: rep.level,
            chamber: rep.chamber,
            name: rep.name,
            party: rep.party,
            office: rep.office,
            district: rep.district,
            state: rep.state,
            photo_url: rep.photo_url,
            website: rep.website,
            email: rep.email,
            phone: rep.phone,
            address: rep.address,
            social_twitter: rep.social_twitter,
            term_start: rep.term_start,
            term_end: rep.term_end,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'external_id' }
        )
      }

      // Re-fetch from DB to get stable UUIDs
      const { data: fresh } = await supabase
        .from('representatives')
        .select('*')
        .eq('state', state ?? reps[0].state)

      return NextResponse.json({ representatives: sortReps((fresh as Representative[]) ?? []) })
    }

    return NextResponse.json({ representatives: [] })
  } catch (error) {
    console.error('GET /api/representatives error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
