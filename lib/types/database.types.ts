export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          birthday: string | null
          zipcode: string | null
          survey_demographic_complete: boolean
          survey_values_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          birthday?: string | null
          zipcode?: string | null
          survey_demographic_complete?: boolean
          survey_values_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          first_name?: string | null
          last_name?: string | null
          birthday?: string | null
          zipcode?: string | null
          survey_demographic_complete?: boolean
          survey_values_complete?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      survey_demographic: {
        Row: {
          id: string
          user_id: string
          income_range: string | null
          employment_status: string | null
          education_level: string | null
          children_count: number | null
          household_size: number | null
          home_ownership: string | null
          marital_status: string | null
          health_insurance: string | null
          military_service: boolean
          union_member: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          income_range?: string | null
          employment_status?: string | null
          education_level?: string | null
          children_count?: number | null
          household_size?: number | null
          home_ownership?: string | null
          marital_status?: string | null
          health_insurance?: string | null
          military_service?: boolean
          union_member?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          income_range?: string | null
          employment_status?: string | null
          education_level?: string | null
          children_count?: number | null
          household_size?: number | null
          home_ownership?: string | null
          marital_status?: string | null
          health_insurance?: string | null
          military_service?: boolean
          union_member?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      survey_values: {
        Row: {
          id: string
          user_id: string
          religion: string | null
          religion_importance: number | null
          environment: number | null
          safety_net: number | null
          guns: number | null
          immigration: number | null
          healthcare: number | null
          abortion: number | null
          education: number | null
          criminal_justice: number | null
          lgbtq_rights: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          religion?: string | null
          religion_importance?: number | null
          environment?: number | null
          safety_net?: number | null
          guns?: number | null
          immigration?: number | null
          healthcare?: number | null
          abortion?: number | null
          education?: number | null
          criminal_justice?: number | null
          lgbtq_rights?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          religion?: string | null
          religion_importance?: number | null
          environment?: number | null
          safety_net?: number | null
          guns?: number | null
          immigration?: number | null
          healthcare?: number | null
          abortion?: number | null
          education?: number | null
          criminal_justice?: number | null
          lgbtq_rights?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      elections: {
        Row: {
          id: string
          external_id: string
          name: string
          election_date: string
          state: string | null
          zipcodes: string[] | null
          raw_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          external_id: string
          name: string
          election_date: string
          state?: string | null
          zipcodes?: string[] | null
          raw_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          external_id?: string
          name?: string
          election_date?: string
          state?: string | null
          zipcodes?: string[] | null
          raw_data?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      ballot_contests: {
        Row: {
          id: string
          election_id: string
          office: string | null
          contest_type: 'candidate' | 'referendum' | 'retention'
          district: string | null
          candidates: Json | null
          referendum_question: string | null
          referendum_yes_meaning: string | null
          referendum_no_meaning: string | null
          created_at: string
        }
        Insert: {
          id?: string
          election_id: string
          office?: string | null
          contest_type: 'candidate' | 'referendum' | 'retention'
          district?: string | null
          candidates?: Json | null
          referendum_question?: string | null
          referendum_yes_meaning?: string | null
          referendum_no_meaning?: string | null
          created_at?: string
        }
        Update: {
          office?: string | null
          contest_type?: 'candidate' | 'referendum' | 'retention'
          district?: string | null
          candidates?: Json | null
          referendum_question?: string | null
          referendum_yes_meaning?: string | null
          referendum_no_meaning?: string | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          id: string
          user_id: string
          contest_id: string
          recommendation: string
          reasoning: string
          sources: Json | null
          key_factors: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          contest_id: string
          recommendation: string
          reasoning: string
          sources?: Json | null
          key_factors?: Json | null
          created_at?: string
        }
        Update: {
          recommendation?: string
          reasoning?: string
          sources?: Json | null
          key_factors?: Json | null
        }
        Relationships: []
      }
      survey_demographic_history: {
        Row: {
          id: string
          user_id: string
          income_range: string | null
          employment_status: string | null
          education_level: string | null
          children_count: number | null
          household_size: number | null
          home_ownership: string | null
          marital_status: string | null
          health_insurance: string | null
          military_service: boolean
          union_member: boolean
          submitted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          income_range?: string | null
          employment_status?: string | null
          education_level?: string | null
          children_count?: number | null
          household_size?: number | null
          home_ownership?: string | null
          marital_status?: string | null
          health_insurance?: string | null
          military_service?: boolean
          union_member?: boolean
          submitted_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      survey_values_history: {
        Row: {
          id: string
          user_id: string
          religion: string | null
          religion_importance: number | null
          environment: number | null
          safety_net: number | null
          guns: number | null
          immigration: number | null
          healthcare: number | null
          abortion: number | null
          education: number | null
          criminal_justice: number | null
          lgbtq_rights: number | null
          submitted_at: string
        }
        Insert: {
          id?: string
          user_id: string
          religion?: string | null
          religion_importance?: number | null
          environment?: number | null
          safety_net?: number | null
          guns?: number | null
          immigration?: number | null
          healthcare?: number | null
          abortion?: number | null
          education?: number | null
          criminal_justice?: number | null
          lgbtq_rights?: number | null
          submitted_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
