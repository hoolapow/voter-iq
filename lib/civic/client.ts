import { Election, Contest } from '@/lib/types/election.types'
import { MOCK_ELECTIONS } from './mock'

export async function getElectionsForZipcode(
  zipcode: string
): Promise<(Election & { contests: Contest[] })[]> {
  if (process.env.USE_MOCK_CIVIC_DATA === 'true') {
    return MOCK_ELECTIONS
  }

  const apiKey = process.env.GOOGLE_CIVIC_API_KEY
  if (!apiKey) throw new Error('GOOGLE_CIVIC_API_KEY is not set')

  const address = encodeURIComponent(zipcode)
  const res = await fetch(
    `https://www.googleapis.com/civicinfo/v2/voterinfo?key=${apiKey}&address=${address}&electionId=2000`,
    { next: { revalidate: 3600 } }
  )

  if (!res.ok) {
    console.error('Civic API error:', await res.text())
    return []
  }

  const data = await res.json()

  // Transform Civic API response into our Election type
  // This is a simplified mapping; production code would be more thorough
  const elections: (Election & { contests: Contest[] })[] = []

  if (data.election) {
    const election: Election & { contests: Contest[] } = {
      id: data.election.id,
      external_id: data.election.id,
      name: data.election.name,
      election_date: data.election.electionDay,
      state: null,
      zipcodes: [zipcode],
      contests: (data.contests || []).map((c: Record<string, unknown>, i: number) => ({
        id: `${data.election.id}-${i}`,
        election_id: data.election.id,
        office: c.office || null,
        contest_type: c.referendumTitle ? 'referendum' : 'candidate',
        district: (c.district as Record<string, unknown>)?.name || null,
        candidates: c.candidates || null,
        referendum_question: c.referendumTitle || null,
        referendum_yes_meaning: c.referendumProStatement || null,
        referendum_no_meaning: c.referendumConStatement || null,
      })),
    }
    elections.push(election)
  }

  return elections
}
