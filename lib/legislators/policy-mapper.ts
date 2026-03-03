import { PolicyArea } from '@/lib/types/representative.types'

const POLICY_KEYWORD_MAP: [string, PolicyArea][] = [
  ['health', 'healthcare'],
  ['medicaid', 'healthcare'],
  ['medicare', 'healthcare'],
  ['insurance', 'healthcare'],
  ['aca', 'healthcare'],
  ['affordable care', 'healthcare'],
  ['prescription', 'healthcare'],
  ['hospital', 'healthcare'],
  ['environ', 'environment'],
  ['climate', 'environment'],
  ['emission', 'environment'],
  ['clean energy', 'environment'],
  ['renewable', 'environment'],
  ['carbon', 'environment'],
  ['pollution', 'environment'],
  ['conservation', 'environment'],
  ['gun', 'guns'],
  ['firearm', 'guns'],
  ['second amendment', 'guns'],
  ['weapon', 'guns'],
  ['ammunition', 'guns'],
  ['background check', 'guns'],
  ['immigra', 'immigration'],
  ['border', 'immigration'],
  ['asylum', 'immigration'],
  ['refugee', 'immigration'],
  ['visa', 'immigration'],
  ['citizenship', 'immigration'],
  ['undocumented', 'immigration'],
  ['abortion', 'abortion'],
  ['reproductive', 'abortion'],
  ['planned parenthood', 'abortion'],
  ['roe', 'abortion'],
  ['fetal', 'abortion'],
  ['lgbtq', 'lgbtq_rights'],
  ['transgender', 'lgbtq_rights'],
  ['gay', 'lgbtq_rights'],
  ['same-sex', 'lgbtq_rights'],
  ['gender identity', 'lgbtq_rights'],
  ['education', 'education'],
  ['school', 'education'],
  ['student loan', 'education'],
  ['college', 'education'],
  ['teacher', 'education'],
  ['curriculum', 'education'],
  ['criminal', 'criminal_justice'],
  ['police', 'criminal_justice'],
  ['law enforcement', 'criminal_justice'],
  ['prison', 'criminal_justice'],
  ['sentencing', 'criminal_justice'],
  ['incarcera', 'criminal_justice'],
  ['probation', 'criminal_justice'],
  ['welfare', 'safety_net'],
  ['snap', 'safety_net'],
  ['food stamp', 'safety_net'],
  ['social security', 'safety_net'],
  ['unemployment', 'safety_net'],
  ['housing assistance', 'safety_net'],
  ['medicaid', 'safety_net'],
  ['poverty', 'safety_net'],
]

export function mapSubjectToPolicy(subjects: string[]): PolicyArea {
  const combined = subjects.join(' ').toLowerCase()
  for (const [keyword, area] of POLICY_KEYWORD_MAP) {
    if (combined.includes(keyword)) return area
  }
  return 'other'
}

export function mapTitleToPolicy(title: string): PolicyArea {
  return mapSubjectToPolicy([title])
}
