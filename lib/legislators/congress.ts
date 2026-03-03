import { Representative, RepresentativeVote, RepresentativeBill } from '@/lib/types/representative.types'
import { mapTitleToPolicy } from './policy-mapper'

const CONGRESS_BASE = 'https://api.congress.gov/v3'

function stableId(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
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

// ── GovTrack (votes, no key required) ────────────────────────────────────────

const GOVTRACK_BASE = 'https://www.govtrack.us/api/v2'

function mapGovTrackOption(key: string): RepresentativeVote['vote_choice'] {
  if (key === '+' || key.toLowerCase() === 'yea' || key.toLowerCase() === 'aye') return 'yea'
  if (key === '-' || key.toLowerCase() === 'nay' || key.toLowerCase() === 'no') return 'nay'
  if (key === 'P' || key.toLowerCase() === 'present') return 'nv'
  if (key === '0' || key.toLowerCase() === 'not voting') return 'nv'
  return 'absent'
}

async function lookupGovTrackPersonId(bioguideId: string): Promise<number | null> {
  const res = await fetch(
    `${GOVTRACK_BASE}/person?bioguideid=${bioguideId}&format=json`,
    { signal: AbortSignal.timeout(8000) }
  )
  if (!res.ok) return null
  const data = await res.json()
  return (data.objects?.[0]?.id as number) ?? null
}

interface GovTrackVoteVoter {
  option: { key: string; value: string }
  vote: {
    id: number
    congress: number
    session: string
    number: number
    chamber: string
    created: string
    related_bill: {
      bill_type: string
      number: number
      title: string
      display_number?: string
    } | null
  }
}

export async function fetchFederalVotes(
  representativeId: string,
  bioguideId: string,
  state: string
): Promise<Omit<RepresentativeVote, 'id'>[]> {
  const govtrackId = await lookupGovTrackPersonId(bioguideId)
  if (!govtrackId) {
    console.warn(`GovTrack: no person found for bioguideId ${bioguideId}`)
    return []
  }

  const res = await fetch(
    `${GOVTRACK_BASE}/vote_voter?person=${govtrackId}&limit=50&order_by=-created&format=json`,
    { signal: AbortSignal.timeout(10000) }
  )
  if (!res.ok) {
    console.warn(`GovTrack vote_voter HTTP ${res.status}`)
    return []
  }

  const data = await res.json()
  const items: GovTrackVoteVoter[] = data.objects ?? []

  return items
    .filter((item) => item.vote.related_bill != null)
    .map((item) => {
      const { vote } = item
      const bill = vote.related_bill!
      const billNumber = bill.display_number ?? `${bill.bill_type.toUpperCase()} ${bill.number}`
      return {
        representative_id: representativeId,
        legiscan_bill_id: stableId(`govtrack-vote-${vote.id}`),
        bill_number: billNumber,
        bill_title: bill.title,
        bill_url: `https://www.govtrack.us/congress/votes/${vote.congress}-${vote.session}/${vote.chamber[0]}${vote.number}`,
        vote_date: vote.created.substring(0, 10),
        vote_choice: mapGovTrackOption(item.option.key),
        policy_area: mapTitleToPolicy(bill.title),
        session: `${vote.congress}th Congress`,
        state,
      }
    })
}

// ── Congress.gov (bills, uses existing CONGRESS_API_KEY) ─────────────────────

interface CongressBillItem {
  congress: number
  number: string
  type: string
  title: string
  introducedDate: string
  policyArea?: { name: string }
  latestAction?: { text: string; actionDate: string }
}

async function fetchCongressBills(
  bioguideId: string,
  type: 'sponsored' | 'cosponsored',
  apiKey: string
): Promise<CongressBillItem[]> {
  const key = type === 'sponsored' ? 'sponsoredLegislation' : 'cosponsoredLegislation'
  const endpoint = type === 'sponsored' ? 'sponsored-legislation' : 'cosponsored-legislation'
  const url =
    `${CONGRESS_BASE}/member/${bioguideId}/${endpoint}` +
    `?format=json&limit=20&api_key=${apiKey}`

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) {
    console.warn(`Congress.gov ${endpoint} HTTP ${res.status}`)
    return []
  }

  const data = await res.json()
  return (data[key] ?? []) as CongressBillItem[]
}

export async function fetchFederalBills(
  representativeId: string,
  bioguideId: string,
  state: string
): Promise<Omit<RepresentativeBill, 'id'>[]> {
  const apiKey = process.env.CONGRESS_API_KEY
  if (!apiKey) throw new Error('CONGRESS_API_KEY is not set')

  const [sponsored, cosponsored] = await Promise.allSettled([
    fetchCongressBills(bioguideId, 'sponsored', apiKey),
    fetchCongressBills(bioguideId, 'cosponsored', apiKey),
  ])

  const bills: Omit<RepresentativeBill, 'id'>[] = []

  for (const [result, sponsorshipType] of [
    [sponsored, 'primary'],
    [cosponsored, 'cosponsor'],
  ] as const) {
    if (result.status !== 'fulfilled') continue
    for (const b of result.value.slice(0, 15)) {
      const billNum = `${b.type} ${b.number}`
      bills.push({
        representative_id: representativeId,
        legiscan_bill_id: stableId(`congress${b.congress}-${sponsorshipType}-${billNum}`),
        bill_number: billNum,
        bill_title: b.title,
        bill_url: null,
        status: b.latestAction?.text ?? null,
        status_date: b.latestAction?.actionDate ?? null,
        sponsorship_type: sponsorshipType,
        policy_area: mapTitleToPolicy(b.policyArea?.name ?? b.title),
        session: `${b.congress}th Congress`,
        state,
      })
    }
  }

  return bills
}
