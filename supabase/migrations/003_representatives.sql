-- ============================================================
-- Representatives Schema
-- Run in Supabase SQL editor after 001_schema.sql
-- ============================================================

-- ============================================================
-- representatives — canonical legislator records
-- Populated from OpenStates (state) and Congress.gov (federal)
-- ============================================================
create table if not exists public.representatives (
  id            uuid default uuid_generate_v4() primary key,
  external_id   text unique not null,
  source        text not null,         -- 'openstates' | 'congress' | 'mock'
  level         text not null,         -- 'federal' | 'state'
  chamber       text,                  -- 'senate' | 'house' | 'upper' | 'lower'
  name          text not null,
  party         text,
  office        text not null,
  district      text,
  state         text not null,
  photo_url     text,
  website       text,
  email         text,
  phone         text,
  address       text,
  social_twitter text,
  term_start    date,
  term_end      date,
  raw_data      jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- representative_votes — voting history from LegiScan
-- ============================================================
create table if not exists public.representative_votes (
  id                uuid default uuid_generate_v4() primary key,
  representative_id uuid references public.representatives(id) on delete cascade not null,
  legiscan_bill_id  integer not null,
  bill_number       text not null,
  bill_title        text not null,
  bill_url          text,
  vote_date         date not null,
  vote_choice       text not null check (vote_choice in ('yea','nay','nv','absent')),
  policy_area       text,
  session           text,
  state             text not null,
  created_at        timestamptz not null default now(),
  unique(representative_id, legiscan_bill_id)
);

-- ============================================================
-- representative_bills — sponsored/co-sponsored bills
-- ============================================================
create table if not exists public.representative_bills (
  id                uuid default uuid_generate_v4() primary key,
  representative_id uuid references public.representatives(id) on delete cascade not null,
  legiscan_bill_id  integer not null,
  bill_number       text not null,
  bill_title        text not null,
  bill_url          text,
  status            text,
  status_date       date,
  sponsorship_type  text not null check (sponsorship_type in ('primary','cosponsor')),
  policy_area       text,
  session           text,
  state             text not null,
  created_at        timestamptz not null default now(),
  unique(representative_id, legiscan_bill_id, sponsorship_type)
);

-- ============================================================
-- representative_alignments — Claude-generated score per user
-- ============================================================
create table if not exists public.representative_alignments (
  id                uuid default uuid_generate_v4() primary key,
  user_id           uuid references auth.users(id) on delete cascade not null,
  representative_id uuid references public.representatives(id) on delete cascade not null,
  score             integer not null check (score between 0 and 100),
  summary           text not null,
  key_alignments    jsonb,   -- string[]
  key_divergences   jsonb,   -- string[]
  out_of_character  jsonb,   -- OutOfCharacterFlag[]
  created_at        timestamptz not null default now(),
  unique(user_id, representative_id)
);

-- Indexes
create index if not exists representatives_state_idx on public.representatives (state);
create index if not exists representatives_updated_at_idx on public.representatives (updated_at);
create index if not exists rep_votes_rep_date_idx on public.representative_votes (representative_id, vote_date desc);
create index if not exists rep_bills_rep_date_idx on public.representative_bills (representative_id, status_date desc);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.representatives enable row level security;
alter table public.representative_votes enable row level security;
alter table public.representative_bills enable row level security;
alter table public.representative_alignments enable row level security;

-- representatives: public read
create policy "Representatives are publicly readable" on public.representatives
  for select using (true);

-- votes + bills: public read
create policy "Representative votes are publicly readable" on public.representative_votes
  for select using (true);
create policy "Representative bills are publicly readable" on public.representative_bills
  for select using (true);

-- alignments: own rows only; insert/upsert via service role
create policy "Users can view own alignments" on public.representative_alignments
  for select using (auth.uid() = user_id);
