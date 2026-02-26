// Approximate state-level demographic profiles derived from U.S. Census Bureau
// American Community Survey 2022 5-Year Estimates.
// Used as the "typical resident" context for public map-panel recommendations.

interface StateDemographicProfile {
  medianHouseholdIncome: string
  pctWithBachelorOrHigher: number  // % of adults 25+
  pctHomeOwnership: number
  pctEmployed: number              // civilian labor force participation
  pctWithHealthInsurance: number
  medianAge: number
  typicalHouseholdSize: number
}

const STATE_PROFILES: Record<string, StateDemographicProfile> = {
  '01': { medianHouseholdIncome: '$54,000', pctWithBachelorOrHigher: 26, pctHomeOwnership: 69, pctEmployed: 58, pctWithHealthInsurance: 89, medianAge: 39, typicalHouseholdSize: 3 },   // Alabama
  '02': { medianHouseholdIncome: '$77,000', pctWithBachelorOrHigher: 30, pctHomeOwnership: 64, pctEmployed: 65, pctWithHealthInsurance: 89, medianAge: 35, typicalHouseholdSize: 3 },   // Alaska
  '04': { medianHouseholdIncome: '$62,000', pctWithBachelorOrHigher: 31, pctHomeOwnership: 65, pctEmployed: 60, pctWithHealthInsurance: 88, medianAge: 38, typicalHouseholdSize: 3 },   // Arizona
  '05': { medianHouseholdIncome: '$52,000', pctWithBachelorOrHigher: 24, pctHomeOwnership: 66, pctEmployed: 58, pctWithHealthInsurance: 89, medianAge: 38, typicalHouseholdSize: 3 },   // Arkansas
  '06': { medianHouseholdIncome: '$84,000', pctWithBachelorOrHigher: 35, pctHomeOwnership: 55, pctEmployed: 63, pctWithHealthInsurance: 93, medianAge: 37, typicalHouseholdSize: 3 },   // California
  '08': { medianHouseholdIncome: '$77,000', pctWithBachelorOrHigher: 42, pctHomeOwnership: 65, pctEmployed: 68, pctWithHealthInsurance: 93, medianAge: 37, typicalHouseholdSize: 3 },   // Colorado
  '09': { medianHouseholdIncome: '$83,000', pctWithBachelorOrHigher: 40, pctHomeOwnership: 67, pctEmployed: 65, pctWithHealthInsurance: 95, medianAge: 41, typicalHouseholdSize: 3 },   // Connecticut
  '10': { medianHouseholdIncome: '$72,000', pctWithBachelorOrHigher: 33, pctHomeOwnership: 72, pctEmployed: 62, pctWithHealthInsurance: 93, medianAge: 41, typicalHouseholdSize: 3 },   // Delaware
  '11': { medianHouseholdIncome: '$90,000', pctWithBachelorOrHigher: 59, pctHomeOwnership: 42, pctEmployed: 69, pctWithHealthInsurance: 96, medianAge: 34, typicalHouseholdSize: 2 },   // DC
  '12': { medianHouseholdIncome: '$59,000', pctWithBachelorOrHigher: 31, pctHomeOwnership: 66, pctEmployed: 59, pctWithHealthInsurance: 87, medianAge: 42, typicalHouseholdSize: 3 },   // Florida
  '13': { medianHouseholdIncome: '$61,000', pctWithBachelorOrHigher: 33, pctHomeOwnership: 64, pctEmployed: 62, pctWithHealthInsurance: 87, medianAge: 37, typicalHouseholdSize: 3 },   // Georgia
  '15': { medianHouseholdIncome: '$83,000', pctWithBachelorOrHigher: 35, pctHomeOwnership: 59, pctEmployed: 63, pctWithHealthInsurance: 96, medianAge: 40, typicalHouseholdSize: 3 },   // Hawaii
  '16': { medianHouseholdIncome: '$58,000', pctWithBachelorOrHigher: 28, pctHomeOwnership: 71, pctEmployed: 63, pctWithHealthInsurance: 89, medianAge: 37, typicalHouseholdSize: 3 },   // Idaho
  '17': { medianHouseholdIncome: '$72,000', pctWithBachelorOrHigher: 36, pctHomeOwnership: 67, pctEmployed: 63, pctWithHealthInsurance: 94, medianAge: 39, typicalHouseholdSize: 3 },   // Illinois
  '18': { medianHouseholdIncome: '$61,000', pctWithBachelorOrHigher: 27, pctHomeOwnership: 70, pctEmployed: 63, pctWithHealthInsurance: 91, medianAge: 38, typicalHouseholdSize: 3 },   // Indiana
  '19': { medianHouseholdIncome: '$65,000', pctWithBachelorOrHigher: 30, pctHomeOwnership: 71, pctEmployed: 66, pctWithHealthInsurance: 95, medianAge: 39, typicalHouseholdSize: 2 },   // Iowa
  '20': { medianHouseholdIncome: '$62,000', pctWithBachelorOrHigher: 33, pctHomeOwnership: 68, pctEmployed: 65, pctWithHealthInsurance: 91, medianAge: 38, typicalHouseholdSize: 3 },   // Kansas
  '21': { medianHouseholdIncome: '$55,000', pctWithBachelorOrHigher: 25, pctHomeOwnership: 68, pctEmployed: 59, pctWithHealthInsurance: 93, medianAge: 39, typicalHouseholdSize: 3 },   // Kentucky
  '22': { medianHouseholdIncome: '$51,000', pctWithBachelorOrHigher: 25, pctHomeOwnership: 65, pctEmployed: 57, pctWithHealthInsurance: 88, medianAge: 38, typicalHouseholdSize: 3 },   // Louisiana
  '23': { medianHouseholdIncome: '$62,000', pctWithBachelorOrHigher: 34, pctHomeOwnership: 73, pctEmployed: 61, pctWithHealthInsurance: 93, medianAge: 45, typicalHouseholdSize: 2 },   // Maine
  '24': { medianHouseholdIncome: '$90,000', pctWithBachelorOrHigher: 42, pctHomeOwnership: 68, pctEmployed: 67, pctWithHealthInsurance: 95, medianAge: 39, typicalHouseholdSize: 3 },   // Maryland
  '25': { medianHouseholdIncome: '$89,000', pctWithBachelorOrHigher: 45, pctHomeOwnership: 63, pctEmployed: 66, pctWithHealthInsurance: 97, medianAge: 40, typicalHouseholdSize: 3 },   // Massachusetts
  '26': { medianHouseholdIncome: '$63,000', pctWithBachelorOrHigher: 31, pctHomeOwnership: 73, pctEmployed: 62, pctWithHealthInsurance: 94, medianAge: 40, typicalHouseholdSize: 3 },   // Michigan
  '27': { medianHouseholdIncome: '$74,000', pctWithBachelorOrHigher: 37, pctHomeOwnership: 72, pctEmployed: 68, pctWithHealthInsurance: 95, medianAge: 38, typicalHouseholdSize: 3 },   // Minnesota
  '28': { medianHouseholdIncome: '$48,000', pctWithBachelorOrHigher: 22, pctHomeOwnership: 68, pctEmployed: 56, pctWithHealthInsurance: 87, medianAge: 38, typicalHouseholdSize: 3 },   // Mississippi
  '29': { medianHouseholdIncome: '$57,000', pctWithBachelorOrHigher: 30, pctHomeOwnership: 67, pctEmployed: 61, pctWithHealthInsurance: 90, medianAge: 39, typicalHouseholdSize: 3 },   // Missouri
  '30': { medianHouseholdIncome: '$57,000', pctWithBachelorOrHigher: 33, pctHomeOwnership: 69, pctEmployed: 62, pctWithHealthInsurance: 90, medianAge: 40, typicalHouseholdSize: 3 },   // Montana
  '31': { medianHouseholdIncome: '$65,000', pctWithBachelorOrHigher: 33, pctHomeOwnership: 68, pctEmployed: 68, pctWithHealthInsurance: 92, medianAge: 38, typicalHouseholdSize: 3 },   // Nebraska
  '32': { medianHouseholdIncome: '$62,000', pctWithBachelorOrHigher: 26, pctHomeOwnership: 57, pctEmployed: 61, pctWithHealthInsurance: 87, medianAge: 38, typicalHouseholdSize: 3 },   // Nevada
  '33': { medianHouseholdIncome: '$77,000', pctWithBachelorOrHigher: 38, pctHomeOwnership: 72, pctEmployed: 67, pctWithHealthInsurance: 95, medianAge: 43, typicalHouseholdSize: 3 },   // New Hampshire
  '34': { medianHouseholdIncome: '$85,000', pctWithBachelorOrHigher: 40, pctHomeOwnership: 65, pctEmployed: 64, pctWithHealthInsurance: 93, medianAge: 40, typicalHouseholdSize: 3 },   // New Jersey
  '35': { medianHouseholdIncome: '$51,000', pctWithBachelorOrHigher: 28, pctHomeOwnership: 68, pctEmployed: 58, pctWithHealthInsurance: 90, medianAge: 38, typicalHouseholdSize: 3 },   // New Mexico
  '36': { medianHouseholdIncome: '$72,000', pctWithBachelorOrHigher: 38, pctHomeOwnership: 54, pctEmployed: 62, pctWithHealthInsurance: 94, medianAge: 39, typicalHouseholdSize: 3 },   // New York
  '37': { medianHouseholdIncome: '$60,000', pctWithBachelorOrHigher: 33, pctHomeOwnership: 65, pctEmployed: 62, pctWithHealthInsurance: 88, medianAge: 39, typicalHouseholdSize: 3 },   // North Carolina
  '38': { medianHouseholdIncome: '$68,000', pctWithBachelorOrHigher: 32, pctHomeOwnership: 62, pctEmployed: 67, pctWithHealthInsurance: 93, medianAge: 37, typicalHouseholdSize: 2 },   // North Dakota
  '39': { medianHouseholdIncome: '$61,000', pctWithBachelorOrHigher: 30, pctHomeOwnership: 67, pctEmployed: 62, pctWithHealthInsurance: 93, medianAge: 40, typicalHouseholdSize: 3 },   // Ohio
  '40': { medianHouseholdIncome: '$55,000', pctWithBachelorOrHigher: 26, pctHomeOwnership: 66, pctEmployed: 60, pctWithHealthInsurance: 83, medianAge: 37, typicalHouseholdSize: 3 },   // Oklahoma
  '41': { medianHouseholdIncome: '$70,000', pctWithBachelorOrHigher: 36, pctHomeOwnership: 62, pctEmployed: 62, pctWithHealthInsurance: 94, medianAge: 40, typicalHouseholdSize: 3 },   // Oregon
  '42': { medianHouseholdIncome: '$67,000', pctWithBachelorOrHigher: 34, pctHomeOwnership: 70, pctEmployed: 62, pctWithHealthInsurance: 94, medianAge: 41, typicalHouseholdSize: 3 },   // Pennsylvania
  '44': { medianHouseholdIncome: '$71,000', pctWithBachelorOrHigher: 36, pctHomeOwnership: 61, pctEmployed: 65, pctWithHealthInsurance: 96, medianAge: 41, typicalHouseholdSize: 3 },   // Rhode Island
  '45': { medianHouseholdIncome: '$57,000', pctWithBachelorOrHigher: 30, pctHomeOwnership: 70, pctEmployed: 60, pctWithHealthInsurance: 88, medianAge: 40, typicalHouseholdSize: 3 },   // South Carolina
  '46': { medianHouseholdIncome: '$62,000', pctWithBachelorOrHigher: 30, pctHomeOwnership: 68, pctEmployed: 67, pctWithHealthInsurance: 92, medianAge: 37, typicalHouseholdSize: 2 },   // South Dakota
  '47': { medianHouseholdIncome: '$58,000', pctWithBachelorOrHigher: 29, pctHomeOwnership: 67, pctEmployed: 60, pctWithHealthInsurance: 90, medianAge: 39, typicalHouseholdSize: 3 },   // Tennessee
  '48': { medianHouseholdIncome: '$64,000', pctWithBachelorOrHigher: 32, pctHomeOwnership: 63, pctEmployed: 63, pctWithHealthInsurance: 82, medianAge: 35, typicalHouseholdSize: 3 },   // Texas
  '49': { medianHouseholdIncome: '$74,000', pctWithBachelorOrHigher: 35, pctHomeOwnership: 71, pctEmployed: 67, pctWithHealthInsurance: 91, medianAge: 32, typicalHouseholdSize: 3 },   // Utah
  '50': { medianHouseholdIncome: '$66,000', pctWithBachelorOrHigher: 40, pctHomeOwnership: 72, pctEmployed: 65, pctWithHealthInsurance: 95, medianAge: 43, typicalHouseholdSize: 2 },   // Vermont
  '51': { medianHouseholdIncome: '$76,000', pctWithBachelorOrHigher: 40, pctHomeOwnership: 67, pctEmployed: 66, pctWithHealthInsurance: 93, medianAge: 39, typicalHouseholdSize: 3 },   // Virginia
  '53': { medianHouseholdIncome: '$82,000', pctWithBachelorOrHigher: 40, pctHomeOwnership: 63, pctEmployed: 65, pctWithHealthInsurance: 94, medianAge: 38, typicalHouseholdSize: 3 },   // Washington
  '54': { medianHouseholdIncome: '$48,000', pctWithBachelorOrHigher: 22, pctHomeOwnership: 74, pctEmployed: 53, pctWithHealthInsurance: 94, medianAge: 43, typicalHouseholdSize: 3 },   // West Virginia
  '55': { medianHouseholdIncome: '$65,000', pctWithBachelorOrHigher: 33, pctHomeOwnership: 68, pctEmployed: 67, pctWithHealthInsurance: 95, medianAge: 40, typicalHouseholdSize: 3 },   // Wisconsin
  '56': { medianHouseholdIncome: '$64,000', pctWithBachelorOrHigher: 29, pctHomeOwnership: 72, pctEmployed: 65, pctWithHealthInsurance: 89, medianAge: 38, typicalHouseholdSize: 3 },   // Wyoming
}

const NATIONAL_AVERAGE: StateDemographicProfile = {
  medianHouseholdIncome: '$74,000',
  pctWithBachelorOrHigher: 35,
  pctHomeOwnership: 65,
  pctEmployed: 63,
  pctWithHealthInsurance: 92,
  medianAge: 39,
  typicalHouseholdSize: 3,
}

export function getStateDemographicContext(stateFips: string): string {
  const p = STATE_PROFILES[stateFips] ?? NATIONAL_AVERAGE
  return [
    `Median household income: ${p.medianHouseholdIncome}`,
    `Adults with bachelor's degree or higher: ${p.pctWithBachelorOrHigher}%`,
    `Home ownership rate: ${p.pctHomeOwnership}%`,
    `Labor force participation: ${p.pctEmployed}%`,
    `Population with health insurance: ${p.pctWithHealthInsurance}%`,
    `Median age: ${p.medianAge}`,
    `Average household size: ${p.typicalHouseholdSize}`,
  ].join('\n')
}
