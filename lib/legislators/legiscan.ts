import { RepresentativeVote, RepresentativeBill } from '@/lib/types/representative.types'
import { mapSubjectToPolicy, mapTitleToPolicy } from './policy-mapper'

const LEGISCAN_BASE = 'https://api.legiscan.com/'

async function legiGet<T>(op: string, params: Record<string, string | number>): Promise<T> {
  const apiKey = process.env.LEGISCAN_API_KEY
  if (!apiKey) throw new Error('LEGISCAN_API_KEY is not set')

  const qs = new URLSearchParams({ key: apiKey, op, ...Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  )})
  const res = await fetch(`${LEGISCAN_BASE}?${qs}`, {
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`LegiScan API HTTP ${res.status}`)
  const data = await res.json()
  if (data.status === 'ERROR') throw new Error(`LegiScan error: ${data.alert?.message ?? 'unknown'}`)
  return data as T
}

// Search for a LegiScan person ID by name + state
export async function findLegiscanPersonId(
  name: string,
  state: string
): Promise<number | null> {
  try {
    const data = await legiGet<{
      status: string
      searchresult: Record<string, {
        bill_id: number
        bill_number: string
        title: string
        state: string
        sponsor: { people_id: number; name: string }[]
      }>
    }>('getSearch', { state, query: name })

    // Find a bill sponsored by this person
    for (const key of Object.keys(data.searchresult)) {
      if (key === 'summary') continue
      const bill = data.searchresult[key]
      const sponsor = bill.sponsor?.find(
        (s) => s.name.toLowerCase().includes(name.split(' ').at(-1)?.toLowerCase() ?? '')
      )
      if (sponsor) return sponsor.people_id
    }
    return null
  } catch {
    return null
  }
}

interface LegiScanVoteRecord {
  roll_call_id: number
  bill_id: number
  bill_number: string
  bill_title?: string
  date: string
  vote_text: 'Yea' | 'Nay' | 'NV' | 'Absent' | string
  state_link?: string
}

interface LegiScanSponsoredBill {
  bill_id: number
  bill_number: string
  title: string
  last_action_date?: string
  status_desc?: string
  url?: string
  sponsor_type?: number  // 1 = primary, 2 = cosponsor
  subjects?: string[]
}

function mapVoteChoice(text: string): 'yea' | 'nay' | 'nv' | 'absent' {
  const t = text.toLowerCase()
  if (t.includes('yea') || t === 'yes') return 'yea'
  if (t.includes('nay') || t === 'no') return 'nay'
  if (t.includes('absent')) return 'absent'
  return 'nv'
}

export async function fetchVotesForPerson(
  representativeId: string,
  legiscanPersonId: number,
  state: string
): Promise<Omit<RepresentativeVote, 'id'>[]> {
  const data = await legiGet<{
    status: string
    votes: LegiScanVoteRecord[]
  }>('getPersonVotes', { people_id: legiscanPersonId })

  return (data.votes ?? []).slice(0, 50).map((v, i) => ({
    representative_id: representativeId,
    legiscan_bill_id: v.bill_id,
    bill_number: v.bill_number,
    bill_title: v.bill_title ?? `Bill ${v.bill_number}`,
    bill_url: v.state_link ?? null,
    vote_date: v.date,
    vote_choice: mapVoteChoice(v.vote_text),
    policy_area: mapTitleToPolicy(v.bill_title ?? v.bill_number),
    session: null,
    state,
    // Dummy for non-DB use; real id comes from DB insert
    ...(i < 0 ? {} : {}),
  }))
}

export async function fetchBillsForPerson(
  representativeId: string,
  legiscanPersonId: number,
  state: string
): Promise<Omit<RepresentativeBill, 'id'>[]> {
  const data = await legiGet<{
    status: string
    sponsored: LegiScanSponsoredBill[]
  }>('getPersonSponsored', { people_id: legiscanPersonId })

  return (data.sponsored ?? []).slice(0, 30).map((b) => ({
    representative_id: representativeId,
    legiscan_bill_id: b.bill_id,
    bill_number: b.bill_number,
    bill_title: b.title,
    bill_url: b.url ?? null,
    status: b.status_desc ?? null,
    status_date: b.last_action_date ?? null,
    sponsorship_type: (b.sponsor_type === 2 ? 'cosponsor' : 'primary') as 'primary' | 'cosponsor',
    policy_area: mapSubjectToPolicy(b.subjects ?? [b.title]),
    session: null,
    state,
  }))
}
