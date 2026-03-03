import {
  Representative,
  RepresentativeVote,
  RepresentativeBill,
  AlignmentScore,
  OutOfCharacterFlag,
  PolicyArea,
} from '@/lib/types/representative.types'

// Zip prefix → {state abbr, state name}
function getMockStateFromZip(zipcode: string): { state: string; stateName: string } {
  const prefix = parseInt(zipcode.substring(0, 3), 10)
  if (prefix >= 750 && prefix <= 799) return { state: 'TX', stateName: 'Texas' }
  if (prefix >= 900 && prefix <= 961) return { state: 'CA', stateName: 'California' }
  if (prefix >= 100 && prefix <= 149) return { state: 'NY', stateName: 'New York' }
  if (prefix >= 600 && prefix <= 629) return { state: 'IL', stateName: 'Illinois' }
  if (prefix >= 770 && prefix <= 772) return { state: 'TX', stateName: 'Texas' }
  if (prefix >= 300 && prefix <= 319) return { state: 'GA', stateName: 'Georgia' }
  if (prefix >= 320 && prefix <= 349) return { state: 'FL', stateName: 'Florida' }
  if (prefix >= 480 && prefix <= 499) return { state: 'MI', stateName: 'Michigan' }
  if (prefix >= 430 && prefix <= 458) return { state: 'OH', stateName: 'Ohio' }
  if (prefix >= 980 && prefix <= 994) return { state: 'WA', stateName: 'Washington' }
  return { state: 'TX', stateName: 'Texas' }  // default
}

// Mock reps reuse same names as lib/civic/mock.ts candidate pool for consistency
export function getMockRepresentativesForZip(zipcode: string): Representative[] {
  const { state } = getMockStateFromZip(zipcode)

  const base = `mock-${state.toLowerCase()}`
  return [
    {
      id: `${base}-fed-senate-1`,
      external_id: `${base}-fed-senate-1`,
      source: 'mock',
      level: 'federal',
      chamber: 'senate',
      name: 'Patricia Okonkwo',
      party: 'Democratic',
      office: 'U.S. Senator',
      district: null,
      state,
      photo_url: null,
      website: 'https://example.com',
      email: null,
      phone: '(202) 555-0101',
      address: '123 Senate Office Building, Washington, DC 20510',
      social_twitter: '@PatOkonkwo',
      term_start: '2021-01-03',
      term_end: '2027-01-03',
    },
    {
      id: `${base}-fed-house-1`,
      external_id: `${base}-fed-house-1`,
      source: 'mock',
      level: 'federal',
      chamber: 'house',
      name: 'Angela Reyes',
      party: 'Democratic',
      office: 'U.S. Representative',
      district: `${state}-21`,
      state,
      photo_url: null,
      website: 'https://example.com',
      email: null,
      phone: '(202) 555-0102',
      address: '456 Cannon House Office Building, Washington, DC 20515',
      social_twitter: '@AngelaReyes',
      term_start: '2023-01-03',
      term_end: '2025-01-03',
    },
    {
      id: `${base}-state-senate-1`,
      external_id: `${base}-state-senate-1`,
      source: 'mock',
      level: 'state',
      chamber: 'upper',
      name: 'Diane Nakamura',
      party: 'Democratic',
      office: 'State Senator',
      district: 'Senate District 14',
      state,
      photo_url: null,
      website: 'https://example.com',
      email: 'd.nakamura@state.example.com',
      phone: '(512) 555-0103',
      address: '100 State Capitol, Austin, TX 78701',
      social_twitter: null,
      term_start: '2023-01-10',
      term_end: '2027-01-10',
    },
    {
      id: `${base}-state-house-1`,
      external_id: `${base}-state-house-1`,
      source: 'mock',
      level: 'state',
      chamber: 'lower',
      name: 'Kevin Morales',
      party: 'Republican',
      office: 'State Representative',
      district: 'House District 47',
      state,
      photo_url: null,
      website: 'https://example.com',
      email: 'k.morales@state.example.com',
      phone: '(512) 555-0104',
      address: '100 State Capitol, Austin, TX 78701',
      social_twitter: null,
      term_start: '2023-01-10',
      term_end: '2025-01-10',
    },
  ]
}

// ─── Mock Votes ──────────────────────────────────────────────────────────────

type MockVoteSpec = {
  billId: number
  billNum: string
  title: string
  date: string
  choice: 'yea' | 'nay' | 'nv' | 'absent'
  policy: PolicyArea
}

const FEDERAL_VOTES: MockVoteSpec[] = [
  { billId: 1001, billNum: 'HR 1234', title: 'Affordable Care Act Expansion Act', date: '2025-11-14', choice: 'yea', policy: 'healthcare' },
  { billId: 1002, billNum: 'SB 210',  title: 'Medicare Drug Price Negotiation Act', date: '2025-10-28', choice: 'yea', policy: 'healthcare' },
  { billId: 1003, billNum: 'HR 4521', title: 'Clean Energy Investment Act', date: '2025-09-15', choice: 'yea', policy: 'environment' },
  { billId: 1004, billNum: 'SB 88',   title: 'Border Security Enhancement Act', date: '2025-08-22', choice: 'nay', policy: 'immigration' },
  { billId: 1005, billNum: 'HR 3312', title: 'Universal Background Checks for Firearm Purchases', date: '2025-07-10', choice: 'yea', policy: 'guns' },
  { billId: 1006, billNum: 'SB 445',  title: 'Student Loan Forgiveness Act', date: '2025-06-05', choice: 'yea', policy: 'education' },
  { billId: 1007, billNum: 'HR 2201', title: 'Protect Women\'s Health Act', date: '2025-05-20', choice: 'yea', policy: 'abortion' },
  { billId: 1008, billNum: 'SB 670',  title: 'Equality Act — LGBTQ Non-Discrimination Protections', date: '2025-04-14', choice: 'yea', policy: 'lgbtq_rights' },
  { billId: 1009, billNum: 'HR 5540', title: 'SNAP Benefit Expansion Act', date: '2025-03-08', choice: 'yea', policy: 'safety_net' },
  { billId: 1010, billNum: 'SB 120',  title: 'Carbon Tax and Dividend Act', date: '2025-02-18', choice: 'yea', policy: 'environment' },
  { billId: 1011, billNum: 'HR 6001', title: 'Police Reform and Community Trust Act', date: '2025-01-29', choice: 'yea', policy: 'criminal_justice' },
  { billId: 1012, billNum: 'SB 399',  title: 'Patriot Act Reauthorization', date: '2024-12-10', choice: 'yea', policy: 'criminal_justice' },
  { billId: 1013, billNum: 'HR 7822', title: 'Assault Weapons Ban Act', date: '2024-11-05', choice: 'yea', policy: 'guns' },
  { billId: 1014, billNum: 'SB 551',  title: 'Deferred Action for Childhood Arrivals (DREAM) Act', date: '2024-10-17', choice: 'yea', policy: 'immigration' },
  { billId: 1015, billNum: 'HR 4411', title: 'Title I Education Funding Increase Act', date: '2024-09-23', choice: 'yea', policy: 'education' },
  { billId: 1016, billNum: 'SB 312',  title: 'Offshore Drilling Expansion Act', date: '2024-08-08', choice: 'yea', policy: 'environment' }, // out-of-character
  { billId: 1017, billNum: 'HR 1899', title: 'Pre-Born Child Protection Act', date: '2024-07-14', choice: 'nay', policy: 'abortion' },
  { billId: 1018, billNum: 'SB 777',  title: 'Medicaid Work Requirements Act', date: '2024-06-30', choice: 'nay', policy: 'healthcare' },
  { billId: 1019, billNum: 'HR 3366', title: 'Second Chance Act Reauthorization', date: '2024-05-22', choice: 'yea', policy: 'criminal_justice' },
  { billId: 1020, billNum: 'SB 102',  title: 'Universal Pre-K and Childcare Act', date: '2024-04-11', choice: 'yea', policy: 'safety_net' },
  { billId: 1021, billNum: 'HR 5510', title: 'Concealed Carry Reciprocity Act', date: '2024-03-05', choice: 'nay', policy: 'guns' },
  { billId: 1022, billNum: 'SB 440',  title: 'Climate Change Adaptation Fund', date: '2024-02-19', choice: 'yea', policy: 'environment' },
  { billId: 1023, billNum: 'HR 2109', title: 'Enhanced Immigration Enforcement Act', date: '2024-01-30', choice: 'nay', policy: 'immigration' },
  { billId: 1024, billNum: 'SB 990',  title: 'School Voucher Expansion Act', date: '2023-12-12', choice: 'nay', policy: 'education' },
  { billId: 1025, billNum: 'HR 6644', title: 'Veterans Healthcare Expansion Act', date: '2023-11-07', choice: 'yea', policy: 'healthcare' },
]

const STATE_VOTES: MockVoteSpec[] = [
  { billId: 2001, billNum: 'SB 14',   title: 'State Medicaid Expansion Act', date: '2025-11-10', choice: 'yea', policy: 'healthcare' },
  { billId: 2002, billNum: 'HB 127',  title: 'Renewable Portfolio Standard Expansion', date: '2025-10-20', choice: 'nay', policy: 'environment' },
  { billId: 2003, billNum: 'SB 55',   title: 'School Voucher Program Act', date: '2025-09-08', choice: 'yea', policy: 'education' },
  { billId: 2004, billNum: 'HB 302',  title: 'Constitutional Carry Act', date: '2025-08-14', choice: 'yea', policy: 'guns' },
  { billId: 2005, billNum: 'SB 211',  title: 'Fetal Heartbeat Protection Act', date: '2025-07-22', choice: 'yea', policy: 'abortion' },
  { billId: 2006, billNum: 'HB 480',  title: 'Enhanced Voter ID Requirements', date: '2025-06-17', choice: 'yea', policy: 'other' },
  { billId: 2007, billNum: 'SB 100',  title: 'Parental Rights in Education Act', date: '2025-05-09', choice: 'yea', policy: 'lgbtq_rights' },
  { billId: 2008, billNum: 'HB 555',  title: 'Property Tax Relief Act', date: '2025-04-03', choice: 'yea', policy: 'safety_net' },
  { billId: 2009, billNum: 'SB 330',  title: 'Police Funding Increase Act', date: '2025-03-18', choice: 'yea', policy: 'criminal_justice' },
  { billId: 2010, billNum: 'HB 211',  title: 'Stricter Illegal Immigration Enforcement', date: '2025-02-05', choice: 'yea', policy: 'immigration' },
  { billId: 2011, billNum: 'SB 422',  title: 'Environmental Clean-Up Fund', date: '2025-01-14', choice: 'yea', policy: 'environment' }, // out-of-character
  { billId: 2012, billNum: 'HB 640',  title: 'Expand Medicaid Dental Benefits', date: '2024-12-09', choice: 'nay', policy: 'healthcare' },
  { billId: 2013, billNum: 'SB 71',   title: 'Stand Your Ground Law Expansion', date: '2024-11-19', choice: 'yea', policy: 'guns' },
  { billId: 2014, billNum: 'HB 310',  title: 'Teacher Pay Increase Act', date: '2024-10-28', choice: 'yea', policy: 'education' },
  { billId: 2015, billNum: 'SB 188',  title: 'Anti-DEI in Public Universities Act', date: '2024-09-16', choice: 'yea', policy: 'education' },
  { billId: 2016, billNum: 'HB 777',  title: 'Drug Sentencing Reform Act', date: '2024-08-27', choice: 'nay', policy: 'criminal_justice' },
  { billId: 2017, billNum: 'SB 600',  title: 'Homeless Encampment Removal Act', date: '2024-07-09', choice: 'yea', policy: 'criminal_justice' },
  { billId: 2018, billNum: 'HB 420',  title: 'Infrastructure Bond Authorization', date: '2024-06-11', choice: 'yea', policy: 'safety_net' },
  { billId: 2019, billNum: 'SB 290',  title: 'Gender-Affirming Care Restrictions for Minors', date: '2024-05-20', choice: 'yea', policy: 'lgbtq_rights' },
  { billId: 2020, billNum: 'HB 150',  title: 'Oil and Gas Industry Tax Incentives', date: '2024-04-15', choice: 'yea', policy: 'environment' },
  { billId: 2021, billNum: 'SB 44',   title: 'Abortion Trigger Law', date: '2024-03-07', choice: 'yea', policy: 'abortion' },
  { billId: 2022, billNum: 'HB 380',  title: 'Limit Protest Near Critical Infrastructure', date: '2024-02-22', choice: 'yea', policy: 'criminal_justice' },
  { billId: 2023, billNum: 'SB 120',  title: 'Sanctuary City Prohibition Act', date: '2024-01-17', choice: 'yea', policy: 'immigration' },
  { billId: 2024, billNum: 'HB 600',  title: 'Workers\' Compensation Benefit Increase', date: '2023-12-05', choice: 'nay', policy: 'safety_net' },
  { billId: 2025, billNum: 'SB 502',  title: 'Rural Hospital Preservation Fund', date: '2023-11-08', choice: 'yea', policy: 'healthcare' },
]

function buildVotes(
  representativeId: string,
  specs: MockVoteSpec[],
  state: string
): RepresentativeVote[] {
  return specs.map((s, i) => ({
    id: `${representativeId}-vote-${i + 1}`,
    representative_id: representativeId,
    legiscan_bill_id: s.billId,
    bill_number: s.billNum,
    bill_title: s.title,
    bill_url: null,
    vote_date: s.date,
    vote_choice: s.choice,
    policy_area: s.policy,
    session: '2023-2026 Regular Session',
    state,
  }))
}

export function getMockVotesForRepresentative(
  representativeId: string,
  state: string
): RepresentativeVote[] {
  const isFederal = representativeId.includes('-fed-')
  const specs = isFederal ? FEDERAL_VOTES : STATE_VOTES
  return buildVotes(representativeId, specs, state)
}

// ─── Mock Bills ──────────────────────────────────────────────────────────────

type MockBillSpec = {
  billId: number
  billNum: string
  title: string
  status: string
  statusDate: string
  type: 'primary' | 'cosponsor'
  policy: PolicyArea
}

const FEDERAL_BILLS: MockBillSpec[] = [
  { billId: 3001, billNum: 'SB 210',  title: 'Medicare Drug Price Negotiation Act', status: 'Passed Senate', statusDate: '2025-10-28', type: 'primary', policy: 'healthcare' },
  { billId: 3002, billNum: 'HR 4521', title: 'Clean Energy Investment Act', status: 'In Committee', statusDate: '2025-09-15', type: 'primary', policy: 'environment' },
  { billId: 3003, billNum: 'SB 445',  title: 'Student Loan Forgiveness Act', status: 'Introduced', statusDate: '2025-06-05', type: 'primary', policy: 'education' },
  { billId: 3004, billNum: 'HR 2201', title: 'Protect Women\'s Health Act', status: 'Introduced', statusDate: '2025-05-20', type: 'primary', policy: 'abortion' },
  { billId: 3005, billNum: 'SB 670',  title: 'Equality Act — LGBTQ Non-Discrimination Protections', status: 'Failed', statusDate: '2025-04-14', type: 'primary', policy: 'lgbtq_rights' },
  { billId: 3006, billNum: 'HR 5540', title: 'SNAP Benefit Expansion Act', status: 'In Committee', statusDate: '2025-03-08', type: 'cosponsor', policy: 'safety_net' },
  { billId: 3007, billNum: 'HR 1234', title: 'Affordable Care Act Expansion Act', status: 'Signed', statusDate: '2025-11-14', type: 'cosponsor', policy: 'healthcare' },
  { billId: 3008, billNum: 'SB 120',  title: 'Carbon Tax and Dividend Act', status: 'In Committee', statusDate: '2025-02-18', type: 'cosponsor', policy: 'environment' },
  { billId: 3009, billNum: 'HR 6001', title: 'Police Reform and Community Trust Act', status: 'Introduced', statusDate: '2025-01-29', type: 'cosponsor', policy: 'criminal_justice' },
  { billId: 3010, billNum: 'SB 551',  title: 'DREAM Act', status: 'Failed', statusDate: '2024-10-17', type: 'cosponsor', policy: 'immigration' },
  { billId: 3011, billNum: 'SB 399',  title: 'Patriot Act Reauthorization', status: 'Signed', statusDate: '2024-12-10', type: 'cosponsor', policy: 'criminal_justice' },
  { billId: 3012, billNum: 'SB 990',  title: 'Veterans Homelessness Prevention Act', status: 'Introduced', statusDate: '2024-11-02', type: 'cosponsor', policy: 'safety_net' },
]

const STATE_BILLS: MockBillSpec[] = [
  { billId: 4001, billNum: 'HB 304',  title: 'Constitutional Carry Act', status: 'Signed', statusDate: '2025-08-14', type: 'primary', policy: 'guns' },
  { billId: 4002, billNum: 'SB 211',  title: 'Fetal Heartbeat Protection Act', status: 'Signed', statusDate: '2025-07-22', type: 'primary', policy: 'abortion' },
  { billId: 4003, billNum: 'HB 480',  title: 'Voter ID Enhancement Act', status: 'Signed', statusDate: '2025-06-17', type: 'primary', policy: 'other' },
  { billId: 4004, billNum: 'SB 55',   title: 'School Voucher Expansion Act', status: 'Signed', statusDate: '2025-09-08', type: 'primary', policy: 'education' },
  { billId: 4005, billNum: 'HB 150',  title: 'Oil and Gas Industry Tax Incentives', status: 'Signed', statusDate: '2024-04-15', type: 'primary', policy: 'environment' },
  { billId: 4006, billNum: 'SB 290',  title: 'Gender-Affirming Care Restrictions for Minors', status: 'Signed', statusDate: '2024-05-20', type: 'cosponsor', policy: 'lgbtq_rights' },
  { billId: 4007, billNum: 'HB 555',  title: 'Property Tax Relief Act', status: 'Signed', statusDate: '2025-04-03', type: 'cosponsor', policy: 'safety_net' },
  { billId: 4008, billNum: 'SB 330',  title: 'Police Funding Increase Act', status: 'Passed Chamber', statusDate: '2025-03-18', type: 'cosponsor', policy: 'criminal_justice' },
  { billId: 4009, billNum: 'HB 640',  title: 'Rural Hospital Preservation Fund', status: 'In Committee', statusDate: '2025-01-14', type: 'cosponsor', policy: 'healthcare' },
  { billId: 4010, billNum: 'SB 120',  title: 'Limit Protest Near Critical Infrastructure', status: 'Signed', statusDate: '2024-02-22', type: 'cosponsor', policy: 'criminal_justice' },
  { billId: 4011, billNum: 'HB 380',  title: 'Stand Your Ground Law Expansion', status: 'Signed', statusDate: '2024-11-19', type: 'cosponsor', policy: 'guns' },
  { billId: 4012, billNum: 'SB 600',  title: 'Anti-DEI in Public Universities Act', status: 'Signed', statusDate: '2024-09-16', type: 'cosponsor', policy: 'education' },
]

function buildBills(
  representativeId: string,
  specs: MockBillSpec[],
  state: string
): RepresentativeBill[] {
  return specs.map((s, i) => ({
    id: `${representativeId}-bill-${i + 1}`,
    representative_id: representativeId,
    legiscan_bill_id: s.billId,
    bill_number: s.billNum,
    bill_title: s.title,
    bill_url: null,
    status: s.status,
    status_date: s.statusDate,
    sponsorship_type: s.type,
    policy_area: s.policy,
    session: '2023-2026 Regular Session',
    state,
  }))
}

export function getMockBillsForRepresentative(
  representativeId: string,
  state: string
): RepresentativeBill[] {
  const isFederal = representativeId.includes('-fed-')
  const specs = isFederal ? FEDERAL_BILLS : STATE_BILLS
  return buildBills(representativeId, specs, state)
}

// ─── Mock Alignment ──────────────────────────────────────────────────────────

export function getMockAlignment(
  representativeId: string
): Omit<AlignmentScore, 'id' | 'user_id' | 'representative_id' | 'created_at'> {
  const isFederal = representativeId.includes('-fed-')

  const outOfCharacter: OutOfCharacterFlag[] = isFederal
    ? [
        {
          type: 'vote',
          item_id: `${representativeId}-vote-16`,
          description:
            'Voted YEA on SB 312 (Offshore Drilling Expansion Act) — inconsistent with 4 prior votes supporting clean energy legislation and 2 co-sponsored clean energy bills.',
          severity: 'notable',
        },
      ]
    : [
        {
          type: 'vote',
          item_id: `${representativeId}-vote-11`,
          description:
            'Voted YEA on SB 422 (Environmental Clean-Up Fund) — diverges from voting record of opposing 4 of 5 environmental regulation bills in this session.',
          severity: 'mild',
        },
      ]

  return {
    score: isFederal ? 68 : 34,
    summary: isFederal
      ? 'This legislator\'s voting record shows moderate alignment with your stated preferences, particularly on healthcare access and education funding. There are clear divergences on immigration enforcement and some energy policy votes.'
      : 'This legislator\'s voting record shows limited alignment with your stated preferences. Strong disagreements exist on abortion access, LGBTQ rights, and environmental policy. There is partial agreement on property tax relief and infrastructure investment.',
    key_alignments: isFederal
      ? [
          'Voted YEA on Medicare Drug Price Negotiation Act — consistent with your preference for government-negotiated healthcare pricing',
          'Sponsored Student Loan Forgiveness Act — aligns with your stated preference for expanded public education funding',
          'Consistently voted to protect access to reproductive healthcare — consistent with your stated values',
        ]
      : [
          'Voted YEA on Property Tax Relief Act — consistent with your stated concern about household cost of living',
          'Supported Rural Hospital Preservation Fund — aligns with healthcare access concerns in your area',
        ],
    key_divergences: isFederal
      ? [
          'Voted NAY on Border Security Enhancement Act despite your stated preference for stricter immigration enforcement',
          'Voted YEA on Offshore Drilling Expansion — inconsistent with your stated preference for environmental protection',
        ]
      : [
          'Voted YEA on Fetal Heartbeat Protection Act — conflicts with your stated preference for fewer restrictions on abortion access',
          'Voted YEA on Gender-Affirming Care Restrictions for Minors — conflicts with your stated preference for full legal equality for LGBTQ individuals',
          'Voted NAY on Environmental Clean-Up Fund in most sessions — diverges from your preference for environmental protection',
        ],
    out_of_character: outOfCharacter,
  }
}
