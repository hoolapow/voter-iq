export interface Candidate {
  name: string
  party?: string
  bio_url?: string
  website?: string
}

export type ContestType = 'candidate' | 'referendum' | 'retention'

export interface Contest {
  id: string
  election_id: string
  office: string | null
  contest_type: ContestType
  district: string | null
  candidates: Candidate[] | null
  referendum_question: string | null
  referendum_yes_meaning: string | null
  referendum_no_meaning: string | null
}

export interface Election {
  id: string
  external_id: string
  name: string
  election_date: string
  state: string | null
  zipcodes: string[] | null
  contests?: Contest[]
}

export interface Reference {
  title: string
  url: string
  citation: string  // e.g. "Autor, D. et al. (2013). Science, 341(6145), 1174-1179."
  summary: string
}

export interface Recommendation {
  id: string
  user_id: string
  contest_id: string
  recommendation: string
  reasoning: string
  sources: Reference[] | null
  key_factors: string[] | null
  created_at: string
}
