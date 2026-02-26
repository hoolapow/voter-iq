import { NextRequest, NextResponse } from 'next/server'
import { getElectionsForAddress } from '@/lib/civic/client'
import { ELECTION_SCHEDULE } from '@/lib/data/election-schedule'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fips = searchParams.get('fips')
  const county = searchParams.get('county') // e.g. "Los Angeles"

  if (!fips || fips.length < 2) {
    return NextResponse.json({ error: 'Missing or invalid fips parameter' }, { status: 400 })
  }

  const countyFips = fips.padStart(5, '0')
  const stateFips = countyFips.slice(0, 2)
  const stateInfo = ELECTION_SCHEDULE[stateFips]

  if (!stateInfo) {
    return NextResponse.json({ error: 'Unknown state FIPS: ' + stateFips }, { status: 404 })
  }

  // Build a county-specific address so the Civic API returns contests for this county
  const address = county
    ? `${county} County, ${stateInfo.stateName}`
    : stateInfo.stateName

  const elections = await getElectionsForAddress(address)

  // Return fresh API results directly — avoids stale/mixed contests from other counties in DB
  return NextResponse.json({ elections, stateFips, address })
}
