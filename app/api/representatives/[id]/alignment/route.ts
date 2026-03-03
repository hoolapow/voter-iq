import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/database.types'
import { AlignmentScore, OutOfCharacterFlag, Representative, RepresentativeVote, RepresentativeBill } from '@/lib/types/representative.types'
import { generateAlignmentScore } from '@/lib/legislators/alignment'
import { getMockAlignment } from '@/lib/legislators/mock'

const USE_MOCK = process.env.USE_MOCK_LEGISLATOR_DATA !== 'false'

function getServiceClient() {
  return createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check DB cache
    const { data: cachedRaw } = await supabase
      .from('representative_alignments')
      .select('*')
      .eq('user_id', user.id)
      .eq('representative_id', id)
      .single()

    const cached = cachedRaw as unknown as Database['public']['Tables']['representative_alignments']['Row'] | null

    if (cached) {
      return NextResponse.json({
        alignment: {
          ...cached,
          key_alignments: (cached.key_alignments as string[]) ?? [],
          key_divergences: (cached.key_divergences as string[]) ?? [],
          out_of_character: (cached.out_of_character as unknown as OutOfCharacterFlag[]) ?? [],
        } as AlignmentScore,
      })
    }

    // Fetch representative
    const { data: repRaw, error: repError } = await supabase
      .from('representatives')
      .select('*')
      .eq('id', id)
      .single()

    if (repError || !repRaw) {
      return NextResponse.json({ error: 'Representative not found' }, { status: 404 })
    }

    const rep = repRaw as unknown as Representative

    let alignmentData: Omit<AlignmentScore, 'id' | 'user_id' | 'representative_id' | 'created_at'>

    if (USE_MOCK) {
      alignmentData = getMockAlignment(rep.external_id)
    } else {
      // Fetch user surveys
      type DemographicRow = Database['public']['Tables']['survey_demographic']['Row']
      type ValuesRow = Database['public']['Tables']['survey_values']['Row']

      const { data: demographicsRaw } = await supabase.from('survey_demographic').select('*').eq('user_id', user.id).single()
      const { data: valuesRaw } = await supabase.from('survey_values').select('*').eq('user_id', user.id).single()
      const demographics = demographicsRaw as unknown as DemographicRow | null
      const values = valuesRaw as unknown as ValuesRow | null

      if (!demographics || !values) {
        return NextResponse.json(
          { error: 'Please complete both the background and values surveys before generating an analysis.' },
          { status: 422 }
        )
      }

      // Fetch votes + bills
      const { data: votesRaw } = await supabase
        .from('representative_votes')
        .select('*')
        .eq('representative_id', id)
        .order('vote_date', { ascending: false })
        .limit(30)
      const { data: billsRaw } = await supabase
        .from('representative_bills')
        .select('*')
        .eq('representative_id', id)
        .order('status_date', { ascending: false })
        .limit(12)

      alignmentData = await generateAlignmentScore(
        rep,
        (votesRaw as unknown as RepresentativeVote[]) ?? [],
        (billsRaw as unknown as RepresentativeBill[]) ?? [],
        demographics,
        values
      )
    }

    // Save to DB
    const service = getServiceClient()
    const { data: saved, error: saveError } = await service
      .from('representative_alignments')
      .upsert(
        {
          user_id: user.id,
          representative_id: id,
          score: alignmentData.score,
          summary: alignmentData.summary,
          key_alignments: alignmentData.key_alignments as unknown as Database['public']['Tables']['representative_alignments']['Insert']['key_alignments'],
          key_divergences: alignmentData.key_divergences as unknown as Database['public']['Tables']['representative_alignments']['Insert']['key_divergences'],
          out_of_character: alignmentData.out_of_character as unknown as Database['public']['Tables']['representative_alignments']['Insert']['out_of_character'],
        },
        { onConflict: 'user_id,representative_id' }
      )
      .select()
      .single()

    if (saveError) throw saveError

    return NextResponse.json({
      alignment: {
        ...saved,
        key_alignments: alignmentData.key_alignments,
        key_divergences: alignmentData.key_divergences,
        out_of_character: alignmentData.out_of_character,
      } as AlignmentScore,
    })
  } catch (error) {
    console.error('POST /api/representatives/[id]/alignment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
