import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RepresentativeDetailClient } from '@/components/representatives/RepresentativeDetailClient'
import {
  Representative,
  RepresentativeVote,
  RepresentativeBill,
  AlignmentScore,
  OutOfCharacterFlag,
  RepresentativeDetail,
} from '@/lib/types/representative.types'
import { Database } from '@/lib/types/database.types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: rep } = await supabase
    .from('representatives')
    .select('name, office')
    .eq('id', id)
    .single()

  return {
    title: rep ? `${rep.name} — Voter IQ` : 'Representative — Voter IQ',
  }
}

export default async function RepresentativeDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch representative
  const { data: rep, error: repError } = await supabase
    .from('representatives')
    .select('*')
    .eq('id', id)
    .single()

  if (repError || !rep) notFound()

  // Fetch votes and bills in parallel
  const [{ data: votes }, { data: bills }, { data: cachedAlignment }] = await Promise.all([
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
    user
      ? supabase
          .from('representative_alignments')
          .select('*')
          .eq('representative_id', id)
          .eq('user_id', user.id)
          .single()
      : Promise.resolve({ data: null }),
  ])

  type AlignmentRow = Database['public']['Tables']['representative_alignments']['Row']
  const cachedRow = cachedAlignment as unknown as AlignmentRow | null
  const alignment: AlignmentScore | null = cachedRow
    ? {
        ...cachedRow,
        key_alignments: (cachedRow.key_alignments as string[]) ?? [],
        key_divergences: (cachedRow.key_divergences as string[]) ?? [],
        out_of_character: (cachedRow.out_of_character as unknown as OutOfCharacterFlag[]) ?? [],
      }
    : null

  const detail: RepresentativeDetail = {
    ...(rep as Representative),
    votes: (votes ?? []) as RepresentativeVote[],
    bills: (bills ?? []) as RepresentativeBill[],
    alignment,
  }

  return <RepresentativeDetailClient detail={detail} />
}
