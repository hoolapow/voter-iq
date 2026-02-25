-- ============================================================
-- Survey History Tables
-- Run in Supabase SQL editor after 001_schema.sql
-- ============================================================

-- survey_demographic_history: every submission preserved
create table if not exists public.survey_demographic_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  income_range text,
  employment_status text,
  education_level text,
  children_count integer,
  household_size integer,
  home_ownership text,
  marital_status text,
  health_insurance text,
  military_service boolean default false,
  union_member boolean default false,
  submitted_at timestamptz not null default now()
);

-- survey_values_history: every submission preserved
create table if not exists public.survey_values_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  religion text,
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
  submitted_at timestamptz not null default now()
);

-- RLS
alter table public.survey_demographic_history enable row level security;
alter table public.survey_values_history enable row level security;

create policy "Users can view own demographic history" on public.survey_demographic_history
  for select using (auth.uid() = user_id);
create policy "Users can insert own demographic history" on public.survey_demographic_history
  for insert with check (auth.uid() = user_id);

create policy "Users can view own values history" on public.survey_values_history
  for select using (auth.uid() = user_id);
create policy "Users can insert own values history" on public.survey_values_history
  for insert with check (auth.uid() = user_id);
