// Static state-level election schedule for 2026 primaries
// State FIPS → election info

export interface StateElectionInfo {
  nextElection: string // ISO date YYYY-MM-DD
  electionType: string
  stateName: string
}

export const ELECTION_SCHEDULE: Record<string, StateElectionInfo> = {
  '01': { nextElection: '2026-06-02', electionType: 'Primary', stateName: 'Alabama' },
  '02': { nextElection: '2026-08-18', electionType: 'Primary', stateName: 'Alaska' },
  '04': { nextElection: '2026-08-04', electionType: 'Primary', stateName: 'Arizona' },
  '05': { nextElection: '2026-05-19', electionType: 'Primary', stateName: 'Arkansas' },
  '06': { nextElection: '2026-06-02', electionType: 'Primary', stateName: 'California' },
  '08': { nextElection: '2026-06-30', electionType: 'Primary', stateName: 'Colorado' },
  '09': { nextElection: '2026-08-11', electionType: 'Primary', stateName: 'Connecticut' },
  '10': { nextElection: '2026-09-08', electionType: 'Primary', stateName: 'Delaware' },
  '11': { nextElection: '2026-06-02', electionType: 'Primary', stateName: 'District of Columbia' },
  '12': { nextElection: '2026-08-18', electionType: 'Primary', stateName: 'Florida' },
  '13': { nextElection: '2026-05-19', electionType: 'Primary', stateName: 'Georgia' },
  '15': { nextElection: '2026-08-08', electionType: 'Primary', stateName: 'Hawaii' },
  '16': { nextElection: '2026-05-19', electionType: 'Primary', stateName: 'Idaho' },
  '17': { nextElection: '2026-03-17', electionType: 'Primary', stateName: 'Illinois' },
  '18': { nextElection: '2026-05-05', electionType: 'Primary', stateName: 'Indiana' },
  '19': { nextElection: '2026-06-02', electionType: 'Primary', stateName: 'Iowa' },
  '20': { nextElection: '2026-08-04', electionType: 'Primary', stateName: 'Kansas' },
  '21': { nextElection: '2026-05-19', electionType: 'Primary', stateName: 'Kentucky' },
  '22': { nextElection: '2026-11-03', electionType: 'Jungle Primary', stateName: 'Louisiana' },
  '23': { nextElection: '2026-06-09', electionType: 'Primary', stateName: 'Maine' },
  '24': { nextElection: '2026-07-21', electionType: 'Primary', stateName: 'Maryland' },
  '25': { nextElection: '2026-09-08', electionType: 'Primary', stateName: 'Massachusetts' },
  '26': { nextElection: '2026-08-04', electionType: 'Primary', stateName: 'Michigan' },
  '27': { nextElection: '2026-08-11', electionType: 'Primary', stateName: 'Minnesota' },
  '28': { nextElection: '2026-06-02', electionType: 'Primary', stateName: 'Mississippi' },
  '29': { nextElection: '2026-08-04', electionType: 'Primary', stateName: 'Missouri' },
  '30': { nextElection: '2026-06-02', electionType: 'Primary', stateName: 'Montana' },
  '31': { nextElection: '2026-05-12', electionType: 'Primary', stateName: 'Nebraska' },
  '32': { nextElection: '2026-06-02', electionType: 'Primary', stateName: 'Nevada' },
  '33': { nextElection: '2026-09-08', electionType: 'Primary', stateName: 'New Hampshire' },
  '34': { nextElection: '2026-06-02', electionType: 'Primary', stateName: 'New Jersey' },
  '35': { nextElection: '2026-06-02', electionType: 'Primary', stateName: 'New Mexico' },
  '36': { nextElection: '2026-06-23', electionType: 'Primary', stateName: 'New York' },
  '37': { nextElection: '2026-05-19', electionType: 'Primary', stateName: 'North Carolina' },
  '38': { nextElection: '2026-06-09', electionType: 'Primary', stateName: 'North Dakota' },
  '39': { nextElection: '2026-05-05', electionType: 'Primary', stateName: 'Ohio' },
  '40': { nextElection: '2026-06-16', electionType: 'Primary', stateName: 'Oklahoma' },
  '41': { nextElection: '2026-05-19', electionType: 'Primary', stateName: 'Oregon' },
  '42': { nextElection: '2026-05-19', electionType: 'Primary', stateName: 'Pennsylvania' },
  '44': { nextElection: '2026-09-08', electionType: 'Primary', stateName: 'Rhode Island' },
  '45': { nextElection: '2026-06-09', electionType: 'Primary', stateName: 'South Carolina' },
  '46': { nextElection: '2026-06-02', electionType: 'Primary', stateName: 'South Dakota' },
  '47': { nextElection: '2026-08-06', electionType: 'Primary', stateName: 'Tennessee' },
  '48': { nextElection: '2026-03-03', electionType: 'Primary', stateName: 'Texas' },
  '49': { nextElection: '2026-06-23', electionType: 'Primary', stateName: 'Utah' },
  '50': { nextElection: '2026-08-11', electionType: 'Primary', stateName: 'Vermont' },
  '51': { nextElection: '2026-06-09', electionType: 'Primary', stateName: 'Virginia' },
  '53': { nextElection: '2026-08-04', electionType: 'Primary', stateName: 'Washington' },
  '54': { nextElection: '2026-05-12', electionType: 'Primary', stateName: 'West Virginia' },
  '55': { nextElection: '2026-08-11', electionType: 'Primary', stateName: 'Wisconsin' },
  '56': { nextElection: '2026-08-18', electionType: 'Primary', stateName: 'Wyoming' },
}

export interface CountyColorInfo {
  fill: string
  hoverFill: string
  label: string
  daysUntil: number | null
}

export function getCountyColorInfo(countyFips: string): CountyColorInfo {
  const stateFips = countyFips.slice(0, 2)
  const info = ELECTION_SCHEDULE[stateFips]

  if (!info) {
    return { fill: '#D1D5DB', hoverFill: '#9CA3AF', label: 'No upcoming data', daysUntil: null }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const electionDate = new Date(info.nextElection + 'T00:00:00')
  const diffMs = electionDate.getTime() - today.getTime()
  const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (daysUntil >= -3 && daysUntil <= 3) {
    return { fill: '#B91C1C', hoverFill: '#991B1B', label: 'Voting now', daysUntil }
  }
  if (daysUntil > 3 && daysUntil <= 30) {
    return { fill: '#EA580C', hoverFill: '#C2410C', label: 'Ballots available soon', daysUntil }
  }
  if (daysUntil > 30 && daysUntil <= 90) {
    return { fill: '#CA8A04', hoverFill: '#A16207', label: 'Coming soon', daysUntil }
  }
  if (daysUntil > 90 && daysUntil <= 365) {
    return { fill: '#16A34A', hoverFill: '#15803D', label: 'On the horizon', daysUntil }
  }

  // Past or > 1 year out
  return { fill: '#D1D5DB', hoverFill: '#9CA3AF', label: 'No upcoming data', daysUntil }
}
