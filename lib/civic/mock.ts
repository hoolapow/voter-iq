import { Election, Contest } from '@/lib/types/election.types'

export const MOCK_ELECTIONS: (Election & { contests: Contest[] })[] = [
  {
    id: 'mock-election-1',
    external_id: 'mock-general-2024',
    name: 'November General Election 2024',
    election_date: '2024-11-05',
    state: 'CA',
    zipcodes: null,
    contests: [
      {
        id: 'mock-contest-1',
        election_id: 'mock-election-1',
        office: 'U.S. Senator',
        contest_type: 'candidate',
        district: 'California',
        candidates: [
          { name: 'Adam Schiff', party: 'Democratic', website: 'https://example.com' },
          { name: 'Steve Garvey', party: 'Republican', website: 'https://example.com' },
        ],
        referendum_question: null,
        referendum_yes_meaning: null,
        referendum_no_meaning: null,
      },
      {
        id: 'mock-contest-2',
        election_id: 'mock-election-1',
        office: 'U.S. Representative',
        contest_type: 'candidate',
        district: '33rd Congressional District',
        candidates: [
          { name: 'Ted Lieu', party: 'Democratic', website: 'https://example.com' },
          { name: 'Mark Reed', party: 'Republican', website: 'https://example.com' },
        ],
        referendum_question: null,
        referendum_yes_meaning: null,
        referendum_no_meaning: null,
      },
      {
        id: 'mock-contest-3',
        election_id: 'mock-election-1',
        office: null,
        contest_type: 'referendum',
        district: 'California Statewide',
        candidates: null,
        referendum_question: 'Proposition 32: Raise Minimum Wage',
        referendum_yes_meaning:
          'Increases the minimum wage to $18 per hour for most workers, phased in by 2025.',
        referendum_no_meaning:
          'Current minimum wage schedule remains; no additional increase beyond $16/hour.',
      },
      {
        id: 'mock-contest-4',
        election_id: 'mock-election-1',
        office: null,
        contest_type: 'referendum',
        district: 'Los Angeles Unified School District',
        candidates: null,
        referendum_question: 'Measure B: School Facilities Bond',
        referendum_yes_meaning:
          'Authorizes $9 billion in bonds for school repairs, safety upgrades, and classroom technology.',
        referendum_no_meaning:
          'No bond issued; school facilities rely on existing funding streams.',
      },
    ],
  },
  {
    id: 'mock-election-2',
    external_id: 'mock-primary-2024',
    name: 'State Primary Election 2024',
    election_date: '2024-03-05',
    state: 'CA',
    zipcodes: null,
    contests: [
      {
        id: 'mock-contest-5',
        election_id: 'mock-election-2',
        office: 'Governor',
        contest_type: 'candidate',
        district: 'California',
        candidates: [
          { name: 'Gavin Newsom', party: 'Democratic', website: 'https://example.com' },
          { name: 'Brian Dahle', party: 'Republican', website: 'https://example.com' },
          { name: 'Michael Shellenberger', party: 'Independent', website: 'https://example.com' },
          { name: 'Rhonda Furin', party: 'Republican', website: 'https://example.com' },
        ],
        referendum_question: null,
        referendum_yes_meaning: null,
        referendum_no_meaning: null,
      },
      {
        id: 'mock-contest-6',
        election_id: 'mock-election-2',
        office: 'Attorney General',
        contest_type: 'candidate',
        district: 'California',
        candidates: [
          { name: 'Rob Bonta', party: 'Democratic', website: 'https://example.com' },
          { name: 'Nathan Hochman', party: 'Republican', website: 'https://example.com' },
        ],
        referendum_question: null,
        referendum_yes_meaning: null,
        referendum_no_meaning: null,
      },
      {
        id: 'mock-contest-7',
        election_id: 'mock-election-2',
        office: null,
        contest_type: 'referendum',
        district: 'California Statewide',
        candidates: null,
        referendum_question: 'Proposition 1: Mental Health Services Overhaul',
        referendum_yes_meaning:
          'Restructures mental health funding to prioritize housing and treatment for those with severe mental illness.',
        referendum_no_meaning:
          'Current Mental Health Services Act distribution formula is maintained.',
      },
    ],
  },
  {
    id: 'mock-election-3',
    external_id: 'mock-special-2024',
    name: 'Special Municipal Election 2024',
    election_date: '2024-06-04',
    state: 'CA',
    zipcodes: null,
    contests: [
      {
        id: 'mock-contest-8',
        election_id: 'mock-election-3',
        office: 'Mayor',
        contest_type: 'candidate',
        district: 'City of Los Angeles',
        candidates: [
          { name: 'Karen Bass', party: 'Nonpartisan', website: 'https://example.com' },
          { name: 'Rick Caruso', party: 'Nonpartisan', website: 'https://example.com' },
        ],
        referendum_question: null,
        referendum_yes_meaning: null,
        referendum_no_meaning: null,
      },
      {
        id: 'mock-contest-9',
        election_id: 'mock-election-3',
        office: null,
        contest_type: 'referendum',
        district: 'City of Los Angeles',
        candidates: null,
        referendum_question: 'Measure T: Vacant Property Tax',
        referendum_yes_meaning:
          'Imposes an annual tax on vacant commercial and residential properties to incentivize development and reduce blight.',
        referendum_no_meaning:
          'No new tax on vacant properties; existing property tax rates remain unchanged.',
      },
    ],
  },
]
