import { Representative, RepresentativeVote, RepresentativeBill } from '@/lib/types/representative.types'
import { mapSubjectToPolicy } from './policy-mapper'

const OPENSTATES_GRAPHQL = 'https://v3.openstates.org/graphql'
const OPENSTATES_REST = 'https://v3.openstates.org'

// Stable surrogate integer ID from a string (replaces LegiScan bill ID)
function stableId(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

function mapVoteOption(option: string): RepresentativeVote['vote_choice'] {
  const o = option.toLowerCase()
  if (o === 'yes' || o === 'yea') return 'yea'
  if (o === 'no' || o === 'nay') return 'nay'
  if (o === 'not voting' || o === 'excused') return 'nv'
  return 'absent'
}

const PEOPLE_BY_LOCATION_QUERY = `
query RepsByLocation($lat: Float!, $lon: Float!) {
  people(latitude: $lat, longitude: $lon, first: 10) {
    edges {
      node {
        id
        name
        party
        currentRole {
          title
          district
          chamber
          state
        }
        image
        contactDetails {
          type
          value
          label
        }
        links {
          url
        }
        openstatesUrl
      }
    }
  }
}
`

interface OpenStatesNode {
  id: string
  name: string
  party: string
  currentRole: {
    title: string
    district: string
    chamber: string
    state: string
  } | null
  image: string | null
  contactDetails: { type: string; value: string; label: string }[]
  links: { url: string }[]
  openstatesUrl: string
}

function mapChamber(chamber: string): 'upper' | 'lower' {
  return chamber.toLowerCase() === 'upper' ? 'upper' : 'lower'
}

function mapOffice(title: string, chamber: string): string {
  if (title) return title
  return chamber.toLowerCase() === 'upper' ? 'State Senator' : 'State Representative'
}

export async function fetchStateRepresentatives(
  lat: number,
  lon: number
): Promise<Representative[]> {
  const apiKey = process.env.OPENSTATES_API_KEY
  if (!apiKey) throw new Error('OPENSTATES_API_KEY is not set')

  const res = await fetch(OPENSTATES_GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({
      query: PEOPLE_BY_LOCATION_QUERY,
      variables: { lat, lon },
    }),
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) throw new Error(`OpenStates API HTTP ${res.status}`)

  const data = await res.json()
  if (data.errors?.length) {
    throw new Error(`OpenStates GraphQL error: ${data.errors[0].message}`)
  }

  const edges: { node: OpenStatesNode }[] = data?.data?.people?.edges ?? []

  return edges
    .map(({ node }) => {
      if (!node.currentRole) return null
      const role = node.currentRole
      const email = node.contactDetails.find((c) => c.type === 'email')?.value ?? null
      const phone = node.contactDetails.find((c) => c.type === 'voice')?.value ?? null
      const address = node.contactDetails.find((c) => c.type === 'address')?.value ?? null
      const website = node.links[0]?.url ?? null

      const rep: Representative = {
        id: '',  // assigned after DB upsert
        external_id: node.id,
        source: 'openstates',
        level: 'state',
        chamber: mapChamber(role.chamber),
        name: node.name,
        party: node.party || null,
        office: mapOffice(role.title, role.chamber),
        district: role.district || null,
        state: role.state.toUpperCase(),
        photo_url: node.image || null,
        website,
        email,
        phone,
        address,
        social_twitter: null,
        term_start: null,
        term_end: null,
      }
      return rep
    })
    .filter((r): r is Representative => r !== null)
}

// ── Voting history (GraphQL) ──────────────────────────────────────────────────

const PERSON_VOTES_QUERY = `
query PersonVotes($id: String!) {
  person(id: $id) {
    votes(first: 50) {
      edges {
        node {
          option
          voteEvent {
            startDate
            bill {
              identifier
              title
              subject
              sources { url }
            }
          }
        }
      }
    }
  }
}
`

interface PersonVoteEdge {
  node: {
    option: string
    voteEvent: {
      startDate: string
      bill: {
        identifier: string
        title: string
        subject: string[]
        sources: { url: string }[]
      } | null
    }
  }
}

export async function fetchVotesForStateRep(
  representativeId: string,
  openstatesPersonId: string,
  state: string
): Promise<Omit<RepresentativeVote, 'id'>[]> {
  const apiKey = process.env.OPENSTATES_API_KEY
  if (!apiKey) throw new Error('OPENSTATES_API_KEY is not set')

  const res = await fetch(OPENSTATES_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
    body: JSON.stringify({ query: PERSON_VOTES_QUERY, variables: { id: openstatesPersonId } }),
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) throw new Error(`OpenStates votes HTTP ${res.status}`)
  const data = await res.json()

  if (data.errors?.length) {
    console.warn('OpenStates person votes GraphQL error:', data.errors[0].message)
    return []
  }

  const edges: PersonVoteEdge[] = data?.data?.person?.votes?.edges ?? []

  return edges
    .filter(({ node }) => node.voteEvent.bill != null)
    .map(({ node }) => {
      const bill = node.voteEvent.bill!
      return {
        representative_id: representativeId,
        legiscan_bill_id: stableId(`${state}-${bill.identifier}`),
        bill_number: bill.identifier,
        bill_title: bill.title,
        bill_url: bill.sources[0]?.url ?? null,
        vote_date: node.voteEvent.startDate,
        vote_choice: mapVoteOption(node.option),
        policy_area: mapSubjectToPolicy(bill.subject.length ? bill.subject : [bill.title]),
        session: null,
        state,
      }
    })
}

// ── Sponsored bills (REST) ────────────────────────────────────────────────────

interface OpenStatesBillResult {
  identifier: string
  title: string
  subject: string[]
  openstates_url: string
  sponsorships: { primary: boolean; person_id: string }[]
  latest_action_date: string | null
  latest_action_description: string | null
}

export async function fetchBillsForStateRep(
  representativeId: string,
  openstatesPersonId: string,
  state: string
): Promise<Omit<RepresentativeBill, 'id'>[]> {
  const apiKey = process.env.OPENSTATES_API_KEY
  if (!apiKey) throw new Error('OPENSTATES_API_KEY is not set')

  const jurisdiction = `ocd-division/country:us/state:${state.toLowerCase()}`
  const url =
    `${OPENSTATES_REST}/bills` +
    `?jurisdiction=${encodeURIComponent(jurisdiction)}` +
    `&sponsor_id=${encodeURIComponent(openstatesPersonId)}` +
    `&per_page=20&sort=updated_desc`

  const res = await fetch(url, {
    headers: { 'X-API-Key': apiKey },
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) throw new Error(`OpenStates bills HTTP ${res.status}`)
  const data = await res.json()
  const bills: OpenStatesBillResult[] = data.results ?? []

  return bills.map((bill) => {
    const isPrimary = bill.sponsorships.some(
      (s) => s.primary && s.person_id === openstatesPersonId
    )
    return {
      representative_id: representativeId,
      legiscan_bill_id: stableId(`${state}-${bill.identifier}`),
      bill_number: bill.identifier,
      bill_title: bill.title,
      bill_url: bill.openstates_url ?? null,
      status: bill.latest_action_description ?? null,
      status_date: bill.latest_action_date ?? null,
      sponsorship_type: isPrimary ? 'primary' : 'cosponsor',
      policy_area: mapSubjectToPolicy(bill.subject.length ? bill.subject : [bill.title]),
      session: null,
      state,
    }
  })
}
