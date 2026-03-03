import { Representative } from '@/lib/types/representative.types'

const CONGRESS_BASE = 'https://api.congress.gov/v3'

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
