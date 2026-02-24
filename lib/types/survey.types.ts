export interface DemographicSurvey {
  income_range: string
  employment_status: string
  education_level: string
  children_count: number
  household_size: number
  home_ownership: string
  marital_status: string
  health_insurance: string
  military_service: boolean
  union_member: boolean
}

export interface ValuesSurvey {
  religion: string
  religion_importance: number
  environment: number
  safety_net: number
  guns: number
  immigration: number
  healthcare: number
  abortion: number
  education: number
  criminal_justice: number
  lgbtq_rights: number
}

export const INCOME_RANGES = [
  { value: '<25k', label: 'Under $25,000' },
  { value: '25-50k', label: '$25,000 – $50,000' },
  { value: '50-75k', label: '$50,000 – $75,000' },
  { value: '75-100k', label: '$75,000 – $100,000' },
  { value: '100-150k', label: '$100,000 – $150,000' },
  { value: '>150k', label: 'Over $150,000' },
]

export const EMPLOYMENT_STATUSES = [
  { value: 'employed_full', label: 'Employed Full-Time' },
  { value: 'employed_part', label: 'Employed Part-Time' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'unemployed', label: 'Unemployed / Looking' },
  { value: 'retired', label: 'Retired' },
  { value: 'student', label: 'Student' },
  { value: 'homemaker', label: 'Homemaker' },
]

export const EDUCATION_LEVELS = [
  { value: 'no_hs', label: 'No High School Diploma' },
  { value: 'hs_diploma', label: 'High School Diploma / GED' },
  { value: 'some_college', label: 'Some College' },
  { value: 'associate', label: 'Associate\'s Degree' },
  { value: 'bachelor', label: 'Bachelor\'s Degree' },
  { value: 'master', label: 'Master\'s Degree' },
  { value: 'doctoral', label: 'Doctoral / Professional Degree' },
]

export const HOME_OWNERSHIPS = [
  { value: 'own', label: 'Own' },
  { value: 'rent', label: 'Rent' },
  { value: 'other', label: 'Other' },
]

export const MARITAL_STATUSES = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'domestic_partner', label: 'Domestic Partner' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
]

export const HEALTH_INSURANCES = [
  { value: 'employer', label: 'Through Employer' },
  { value: 'marketplace', label: 'Marketplace / ACA' },
  { value: 'medicaid', label: 'Medicaid' },
  { value: 'medicare', label: 'Medicare' },
  { value: 'military', label: 'Military / VA' },
  { value: 'uninsured', label: 'Uninsured' },
  { value: 'other', label: 'Other' },
]

export const RELIGIONS = [
  { value: 'christian', label: 'Christian (Protestant)' },
  { value: 'catholic', label: 'Catholic' },
  { value: 'jewish', label: 'Jewish' },
  { value: 'muslim', label: 'Muslim' },
  { value: 'hindu', label: 'Hindu' },
  { value: 'buddhist', label: 'Buddhist' },
  { value: 'atheist', label: 'Atheist' },
  { value: 'agnostic', label: 'Agnostic' },
  { value: 'none', label: 'No Religion / Secular' },
  { value: 'other', label: 'Other' },
]

export const VALUES_SLIDERS = [
  {
    key: 'environment' as const,
    label: 'Environmental Protection',
    leftLabel: 'Prioritize economic growth',
    rightLabel: 'Prioritize environment',
  },
  {
    key: 'safety_net' as const,
    label: 'Social Safety Net',
    leftLabel: 'Reduce government programs',
    rightLabel: 'Expand social programs',
  },
  {
    key: 'guns' as const,
    label: 'Gun Rights',
    leftLabel: 'More gun restrictions',
    rightLabel: 'Protect gun rights',
  },
  {
    key: 'immigration' as const,
    label: 'Immigration',
    leftLabel: 'Stricter enforcement',
    rightLabel: 'More welcoming policy',
  },
  {
    key: 'healthcare' as const,
    label: 'Healthcare',
    leftLabel: 'Market-based system',
    rightLabel: 'Universal coverage',
  },
  {
    key: 'abortion' as const,
    label: 'Abortion Access',
    leftLabel: 'More restrictions',
    rightLabel: 'Fewer restrictions',
  },
  {
    key: 'education' as const,
    label: 'Education',
    leftLabel: 'School choice / private',
    rightLabel: 'Public school funding',
  },
  {
    key: 'criminal_justice' as const,
    label: 'Criminal Justice',
    leftLabel: 'Tough on crime',
    rightLabel: 'Focus on reform',
  },
  {
    key: 'lgbtq_rights' as const,
    label: 'LGBTQ+ Rights',
    leftLabel: 'Traditional values',
    rightLabel: 'Full equality',
  },
]
