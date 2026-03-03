import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/database.types'
import { Representative, RepresentativeVote, RepresentativeBill } from '@/lib/types/representative.types'
import { getRepresentativeVotesAndBills } from '@/lib/legislators/client'

const STALE_AFTER_MS = 6 * 60 * 60 * 1000  // 6 hours

function getServiceClient() {
  return createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Fetch representative
    const { data: repRaw, error: repError } = await supabase
      .from('representatives')
      .select('*')
      .eq('id', id)
      .single()

    if (repError || !repRaw) {
      return NextResponse.json({ error: 'Representative not found' }, { status: 404 })
    }

    const rep = repRaw as unknown as Representative & { raw_data: Record<string, unknown> | null }

    // Check if votes/bills are fresh (use most recent vote date as proxy)
    const { data: latestVote } = await supabase
      .from('representative_votes')
      .select('created_at')
      .eq('representative_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const votesStale =
      !latestVote ||
      Date.now() - new Date((latestVote as unknown as { created_at: string }).created_at).getTime() > STALE_AFTER_MS

    if (votesStale) {
      // Fetch fresh votes and bills
      const rawData = rep.raw_data
      const { votes, bills } = await getRepresentativeVotesAndBills(
        id,
        rep.external_id,
        rep.name,
        rep.state,
        rawData,
        rep.source
      )

      if (votes.length > 0 || bills.length > 0) {
        const service = getServiceClient()

        // Upsert votes
        for (const vote of votes) {
          await service.from('representative_votes').upsert(
            { ...vote, representative_id: id },
            { onConflict: 'representative_id,legiscan_bill_id' }
          )
        }

        // Upsert bills
        for (const bill of bills) {
          await service.from('representative_bills').upsert(
            { ...bill, representative_id: id },
            { onConflict: 'representative_id,legiscan_bill_id,sponsorship_type' }
          )
        }
      }
    }

    // Fetch from DB
    const [{ data: votes }, { data: bills }] = await Promise.all([
      supabase
        .from('representative_votes')
        .select('*')
        .eq('representative_id', id)
        .order('vote_date', { ascending: false })
        .limit(50),
      supabase
        .from('representative_bills')
        .select('*')
        .eq('representative_id', id)
        .order('status_date', { ascending: false })
        .limit(30),
    ])

    return NextResponse.json({
      representative: rep as Representative,
      votes: (votes ?? []) as RepresentativeVote[],
      bills: (bills ?? []) as RepresentativeBill[],
    })
  } catch (error) {
    console.error('GET /api/representatives/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
