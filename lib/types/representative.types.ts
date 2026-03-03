export type PolicyArea =
  | 'environment'
  | 'safety_net'
  | 'guns'
  | 'immigration'
  | 'healthcare'
  | 'abortion'
  | 'education'
  | 'criminal_justice'
  | 'lgbtq_rights'
  | 'other'

export interface Representative {
  id: string
  external_id: string
  source: 'openstates' | 'congress' | 'mock'
  level: 'federal' | 'state'
  chamber: 'senate' | 'house' | 'upper' | 'lower' | null
  name: string
  party: string | null
  office: string
  district: string | null
  state: string
  photo_url: string | null
  website: string | null
  email: string | null
  phone: string | null
  address: string | null
  social_twitter: string | null
  term_start: string | null
  term_end: string | null
}

export interface RepresentativeVote {
  id: string
  representative_id: string
  legiscan_bill_id: number
  bill_number: string
  bill_title: string
  bill_url: string | null
  vote_date: string
  vote_choice: 'yea' | 'nay' | 'nv' | 'absent'
  policy_area: PolicyArea | null
  session: string | null
  state: string
}

export interface RepresentativeBill {
  id: string
  representative_id: string
  legiscan_bill_id: number
  bill_number: string
  bill_title: string
  bill_url: string | null
  status: string | null
  status_date: string | null
  sponsorship_type: 'primary' | 'cosponsor'
  policy_area: PolicyArea | null
  session: string | null
  state: string
}

export interface OutOfCharacterFlag {
  type: 'vote' | 'bill'
  item_id: string
  description: string
  severity: 'mild' | 'notable' | 'strong'
  context?: string
}

export interface AlignmentScore {
  id: string
  user_id: string
  representative_id: string
  score: number
  summary: string
  key_alignments: string[]
  key_divergences: string[]
  out_of_character: OutOfCharacterFlag[]
  created_at: string
}

export interface RepresentativeDetail extends Representative {
  votes: RepresentativeVote[]
  bills: RepresentativeBill[]
  alignment: AlignmentScore | null
}
