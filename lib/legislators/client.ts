import { Representative, RepresentativeVote, RepresentativeBill } from '@/lib/types/representative.types'
import {
  getMockRepresentativesForZip,
  getMockVotesForRepresentative,
  getMockBillsForRepresentative,
} from './mock'
import { geocodeZip, zipToStateFallback } from './geocoder'
import { fetchStateRepresentatives } from './openstates'
import { fetchFederalRepresentatives } from './congress'
import { fetchVotesForPerson, fetchBillsForPerson, findLegiscanPersonId } from './legiscan'

const USE_MOCK = process.env.USE_MOCK_LEGISLATOR_DATA !== 'false'

export async function getRepresentativesForZip(zipcode: string): Promise<Representative[]> {
  if (USE_MOCK) {
    return getMockRepresentativesForZip(zipcode)
  }

  const results: Representative[] = []

  // Geocode zip → lat/lon + state + congressional district
  const geo = await geocodeZip(zipcode)
  const state = geo?.state ?? zipToStateFallback(zipcode) ?? null

  if (!state) {
    console.warn(`Could not determine state for zip ${zipcode}`)
    return []
  }

  // Fetch in parallel: state reps (OpenStates) + federal reps (Congress.gov)
  const [stateReps, federalReps] = await Promise.allSettled([
    geo?.lat && geo?.lon
      ? fetchStateRepresentatives(geo.lat, geo.lon)
      : Promise.resolve([] as Representative[]),
    fetchFederalRepresentatives(state, geo?.district ?? null),
  ])

  if (federalReps.status === 'fulfilled') results.push(...federalReps.value)
  if (stateReps.status === 'fulfilled') results.push(...stateReps.value)

  // Sort: federal senate → federal house → state upper → state lower
  const order: Record<string, number> = {
    'federal-senate': 0,
    'federal-house': 1,
    'state-upper': 2,
    'state-lower': 3,
  }
  results.sort((a, b) => {
    const ka = `${a.level}-${a.chamber ?? ''}`
    const kb = `${b.level}-${b.chamber ?? ''}`
    return (order[ka] ?? 9) - (order[kb] ?? 9)
  })

  return results
}

export async function getRepresentativeVotesAndBills(
  representativeId: string,
  representativeExternalId: string,
  representativeName: string,
  state: string,
  rawData: Record<string, unknown> | null
): Promise<{ votes: Omit<RepresentativeVote, 'id'>[]; bills: Omit<RepresentativeBill, 'id'>[] }> {
  if (USE_MOCK) {
    return {
      votes: getMockVotesForRepresentative(representativeId, state).map(({ id: _id, ...rest }) => rest),
      bills: getMockBillsForRepresentative(representativeId, state).map(({ id: _id, ...rest }) => rest),
    }
  }

  // Get or find LegiScan person ID
  let legiscanPersonId: number | null = (rawData?.legiscan_person_id as number) ?? null

  if (!legiscanPersonId) {
    legiscanPersonId = await findLegiscanPersonId(representativeName, state)
  }

  if (!legiscanPersonId) {
    return { votes: [], bills: [] }
  }

  const [votes, bills] = await Promise.allSettled([
    fetchVotesForPerson(representativeId, legiscanPersonId, state),
    fetchBillsForPerson(representativeId, legiscanPersonId, state),
  ])

  return {
    votes: votes.status === 'fulfilled' ? votes.value : [],
    bills: bills.status === 'fulfilled' ? bills.value : [],
  }
}
