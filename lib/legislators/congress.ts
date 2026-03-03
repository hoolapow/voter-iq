import { Representative, RepresentativeVote, RepresentativeBill } from '@/lib/types/representative.types'
import { mapTitleToPolicy } from './policy-mapper'

const CONGRESS_BASE = 'https://api.congress.gov/v3'
const PROPUBLICA_BASE = 'https://api.propublica.org/congress/v1'

function stableId(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function mapProPublicaPosition(position: string): RepresentativeVote['vote_choice'] {
  const p = position.toLowerCase()
  if (p === 'yes') return 'yea'
  if (p === 'no') return 'nay'
  if (p === 'not voting' || p === 'present') return 'nv'
  return 'absent'
}

interface CongressMember {
  bioguideId: string
  name: string
  partyName: string
  state: string
  district?: number
  terms: {
    item: {
      chamber: string
      startYear: number
      endYear?: number
    }[]
  }
  depiction?: {
    imageUrl: string
  }
  officialWebsiteUrl?: string
  addressInformation?: {
    officeAddress?: string
    phoneNumber?: string
  }
  updateDate?: string
}

interface CongressResponse {
  members: CongressMember[]
  pagination: { count: number; next?: string }
}

function mapChamber(chamber: string): 'senate' | 'house' {
  return chamber.toLowerCase().includes('senate') ? 'senate' : 'house'
}

function mapOffice(chamber: 'senate' | 'house'): string {
  return chamber === 'senate' ? 'U.S. Senator' : 'U.S. Representative'
}

async function fetchMembers(url: string, apiKey: string): Promise<CongressMember[]> {
  const res = await fetch(url, {
    headers: { 'X-Api-Key': apiKey },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`Congress.gov API HTTP ${res.status}`)
  const data: CongressResponse = await res.json()
  return data.members ?? []
}

function memberToRep(member: CongressMember): Representative {
  const latestTerm = member.terms?.item?.[member.terms.item.length - 1]
  const chamber = mapChamber(latestTerm?.chamber ?? 'senate')
  return {
    id: '',
    external_id: `bioguide/${member.bioguideId}`,
    source: 'congress',
    level: 'federal',
    chamber,
    name: member.name,
    party: member.partyName || null,
    office: mapOffice(chamber),
    district: member.district != null ? `${member.state}-${member.district}` : null,
    state: member.state,
    photo_url: member.depiction?.imageUrl ?? null,
    website: member.officialWebsiteUrl ?? null,
    email: null,
    phone: member.addressInformation?.phoneNumber ?? null,
    address: member.addressInformation?.officeAddress ?? null,
    social_twitter: null,
    term_start: latestTerm?.startYear ? `${latestTerm.startYear}-01-01` : null,
    term_end: latestTerm?.endYear ? `${latestTerm.endYear}-01-01` : null,
  }
}

export async function fetchFederalRepresentatives(
  state: string,
  district: number | null
): Promise<Representative[]> {
  const apiKey = process.env.CONGRESS_API_KEY
  if (!apiKey) throw new Error('CONGRESS_API_KEY is not set')

  const results: Representative[] = []

  // Fetch both senators
  const senatorUrl =
    `${CONGRESS_BASE}/member?stateCode=${state}&chamber=Senate&currentMember=true` +
    `&limit=10&api_key=${apiKey}`
  const senators = await fetchMembers(senatorUrl, apiKey)
  results.push(...senators.map(memberToRep))

  // Fetch House rep for specific district (if known)
  if (district != null) {
    const houseUrl =
      `${CONGRESS_BASE}/member?stateCode=${state}&district=${district}` +
      `&chamber=House&currentMember=true&limit=5&api_key=${apiKey}`
    const reps = await fetchMembers(houseUrl, apiKey)
    results.push(...reps.map(memberToRep))
  }

  return results
}

// ── ProPublica helpers ────────────────────────────────────────────────────────

interface ProPublicaVoteItem {
  congress: string
  session: string
  roll_call: number
  bill: { number: string; title: string; bill_id?: string } | null
  date: string
  position: string
}

interface ProPublicaBillItem {
  number: string
  bill_id: string
  title: string
  introduced_date: string
  primary_subject: string | null
  latest_major_action_date: string | null
  latest_major_action: string | null
}

async function propublicaGet<T>(path: string): Promise<T | null> {
  const apiKey = process.env.PROPUBLICA_API_KEY
  if (!apiKey) throw new Error('PROPUBLICA_API_KEY is not set')

  const res = await fetch(`${PROPUBLICA_BASE}${path}`, {
    headers: { 'X-API-Key': apiKey },
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) {
    console.warn(`ProPublica HTTP ${res.status} for ${path}`)
    return null
  }

  const data = await res.json()
  if (data.status !== 'OK') return null
  return (data.results?.[0] ?? null) as T
}

export async function fetchFederalVotes(
  representativeId: string,
  bioguideId: string,
  state: string
): Promise<Omit<RepresentativeVote, 'id'>[]> {
  const result = await propublicaGet<{ votes: ProPublicaVoteItem[] }>(
    `/members/${bioguideId}/votes.json`
  )
  if (!result) return []

  return (result.votes ?? [])
    .filter((v) => v.bill != null)
    .map((v) => ({
      representative_id: representativeId,
      legiscan_bill_id: stableId(`congress${v.congress}-rc${v.roll_call}`),
      bill_number: v.bill!.number,
      bill_title: v.bill!.title,
      bill_url: null,
      vote_date: v.date,
      vote_choice: mapProPublicaPosition(v.position),
      policy_area: mapTitleToPolicy(v.bill!.title),
      session: `${v.congress}th Congress, Session ${v.session}`,
      state,
    }))
}

export async function fetchFederalBills(
  representativeId: string,
  bioguideId: string,
  state: string
): Promise<Omit<RepresentativeBill, 'id'>[]> {
  const [introduced, cosponsored] = await Promise.allSettled([
    propublicaGet<{ bills: ProPublicaBillItem[] }>(`/members/${bioguideId}/bills/introduced.json`),
    propublicaGet<{ bills: ProPublicaBillItem[] }>(`/members/${bioguideId}/bills/cosponsored.json`),
  ])

  const bills: Omit<RepresentativeBill, 'id'>[] = []

  if (introduced.status === 'fulfilled' && introduced.value) {
    for (const b of (introduced.value.bills ?? []).slice(0, 15)) {
      bills.push({
        representative_id: representativeId,
        legiscan_bill_id: stableId(`federal-${b.bill_id}`),
        bill_number: b.number,
        bill_title: b.title,
        bill_url: null,
        status: b.latest_major_action ?? null,
        status_date: b.latest_major_action_date ?? null,
        sponsorship_type: 'primary',
        policy_area: mapTitleToPolicy(b.primary_subject ?? b.title),
        session: null,
        state,
      })
    }
  }

  if (cosponsored.status === 'fulfilled' && cosponsored.value) {
    for (const b of (cosponsored.value.bills ?? []).slice(0, 15)) {
      bills.push({
        representative_id: representativeId,
        legiscan_bill_id: stableId(`federal-cosponsor-${b.bill_id}`),
        bill_number: b.number,
        bill_title: b.title,
        bill_url: null,
        status: b.latest_major_action ?? null,
        status_date: b.latest_major_action_date ?? null,
        sponsorship_type: 'cosponsor',
        policy_area: mapTitleToPolicy(b.primary_subject ?? b.title),
        session: null,
        state,
      })
    }
  }

  return bills
}
