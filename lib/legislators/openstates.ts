import { Representative } from '@/lib/types/representative.types'

const OPENSTATES_GRAPHQL = 'https://v3.openstates.org/graphql'

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
