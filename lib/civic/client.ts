import { Election, Contest } from '@/lib/types/election.types'
import { MOCK_ELECTIONS } from './mock'

const CIVIC_BASE = 'https://www.googleapis.com/civicinfo/v2'

export async function getElectionsForZipcode(
  zipcode: string
): Promise<(Election & { contests: Contest[] })[]> {
  if (process.env.USE_MOCK_CIVIC_DATA === 'true') {
    return MOCK_ELECTIONS
  }

  const apiKey = process.env.GOOGLE_CIVIC_API_KEY
  if (!apiKey) throw new Error('GOOGLE_CIVIC_API_KEY is not set')

  // Step 1: get all available elections
  const electionsRes = await fetch(`${CIVIC_BASE}/elections?key=${apiKey}`, {
    next: { revalidate: 3600 },
  })
  if (!electionsRes.ok) {
    console.error('Civic elections list error:', await electionsRes.text())
    return []
  }
  const electionsData = await electionsRes.json()
  const availableElections: { id: string; name: string; electionDay: string }[] =
    electionsData.elections || []

  // Step 2: for each election, fetch voter info for this address
  const results: (Election & { contests: Contest[] })[] = []

  for (const el of availableElections) {
    const address = encodeURIComponent(`${zipcode}, CA`)
    const voterRes = await fetch(
      `${CIVIC_BASE}/voterinfo?key=${apiKey}&address=${address}&electionId=${el.id}`,
      { next: { revalidate: 3600 } }
    )
    if (!voterRes.ok) continue

    const data = await voterRes.json()
    if (!data.contests || data.contests.length === 0) continue

    const contests: Contest[] = (data.contests as Record<string, unknown>[]).map((c, i) => ({
      id: `${el.id}-${i}`,
      election_id: el.id,
      office: (c.office as string) || null,
      contest_type: c.referendumTitle ? 'referendum' : 'candidate',
      district: (c.district as Record<string, string>)?.name || null,
      candidates: (c.candidates as Contest['candidates']) || null,
      referendum_question: (c.referendumTitle as string) || null,
      referendum_yes_meaning: (c.referendumProStatement as string) || null,
      referendum_no_meaning: (c.referendumConStatement as string) || null,
    }))

    results.push({
      id: el.id,
      external_id: el.id,
      name: el.name,
      election_date: el.electionDay,
      state: null,
      zipcodes: [zipcode],
      contests,
    })
  }

  return results
}
