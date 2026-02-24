-- ============================================================
-- Voter IQ Database Schema
-- Run in Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- profiles
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  first_name text,
  last_name text,
  birthday date,
  zipcode text,
  survey_demographic_complete boolean not null default false,
  survey_values_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- survey_demographic
-- ============================================================
create table if not exists public.survey_demographic (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  income_range text,          -- e.g. '<25k','25-50k','50-75k','75-100k','100-150k','>150k'
  employment_status text,     -- 'employed_full','employed_part','self_employed','unemployed','retired','student','homemaker'
  education_level text,       -- 'no_hs','hs_diploma','some_college','associate','bachelor','master','doctoral'
  children_count integer,
  household_size integer,
  home_ownership text,        -- 'own','rent','other'
  marital_status text,        -- 'single','married','domestic_partner','divorced','widowed'
  health_insurance text,      -- 'employer','marketplace','medicaid','medicare','military','uninsured','other'
  military_service boolean default false,
  union_member boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- survey_values
-- ============================================================
create table if not exists public.survey_values (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  religion text,              -- 'christian','catholic','jewish','muslim','hindu','buddhist','atheist','agnostic','other'
  religion_importance integer check (religion_importance between 1 and 5),
  environment integer check (environment between 1 and 5),
  safety_net integer check (safety_net between 1 and 5),
  guns integer check (guns between 1 and 5),
  immigration integer check (immigration between 1 and 5),
  healthcare integer check (healthcare between 1 and 5),
  abortion integer check (abortion between 1 and 5),
  education integer check (education between 1 and 5),
  criminal_justice integer check (criminal_justice between 1 and 5),
  lgbtq_rights integer check (lgbtq_rights between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- elections
-- ============================================================
create table if not exists public.elections (
  id uuid default uuid_generate_v4() primary key,
  external_id text unique not null,
  name text not null,
  election_date date not null,
  state text,
  zipcodes text[],
  raw_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ballot_contests
-- ============================================================
create table if not exists public.ballot_contests (
  id uuid default uuid_generate_v4() primary key,
  election_id uuid references public.elections(id) on delete cascade not null,
  office text,
  contest_type text not null check (contest_type in ('candidate','referendum','retention')),
  district text,
  candidates jsonb,           -- [{name, party, bio_url, website}]
  referendum_question text,
  referendum_yes_meaning text,
  referendum_no_meaning text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- recommendations
-- ============================================================
create table if not exists public.recommendations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  contest_id uuid references public.ballot_contests(id) on delete cascade not null,
  recommendation text not null,
  reasoning text not null,
  references jsonb,           -- [{title, url, summary}]
  key_factors jsonb,          -- string[]
  created_at timestamptz not null default now(),
  unique(user_id, contest_id)
);

-- ============================================================
-- Trigger: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, first_name, last_name, birthday, zipcode)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    (new.raw_user_meta_data ->> 'birthday')::date,
    new.raw_user_meta_data ->> 'zipcode'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.survey_demographic enable row level security;
alter table public.survey_values enable row level security;
alter table public.elections enable row level security;
alter table public.ballot_contests enable row level security;
alter table public.recommendations enable row level security;

-- profiles: own row only
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Service role can insert profiles" on public.profiles
  for insert with check (true);

-- survey_demographic: own row only
create policy "Users can view own demographic" on public.survey_demographic
  for select using (auth.uid() = user_id);
create policy "Users can insert own demographic" on public.survey_demographic
  for insert with check (auth.uid() = user_id);
create policy "Users can update own demographic" on public.survey_demographic
  for update using (auth.uid() = user_id);

-- survey_values: own row only
create policy "Users can view own values" on public.survey_values
  for select using (auth.uid() = user_id);
create policy "Users can insert own values" on public.survey_values
  for insert with check (auth.uid() = user_id);
create policy "Users can update own values" on public.survey_values
  for update using (auth.uid() = user_id);

-- elections: public read
create policy "Elections are publicly readable" on public.elections
  for select using (true);

-- ballot_contests: public read
create policy "Contests are publicly readable" on public.ballot_contests
  for select using (true);

-- recommendations: own rows only; insert via service role
create policy "Users can view own recommendations" on public.recommendations
  for select using (auth.uid() = user_id);
