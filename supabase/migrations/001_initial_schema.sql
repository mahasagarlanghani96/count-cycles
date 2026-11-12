-- CycleCare Initial Database Schema
-- All user data is protected by Row Level Security

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text,
  date_of_birth date,
  cycle_length_estimate integer check (cycle_length_estimate is null or (cycle_length_estimate >= 18 and cycle_length_estimate <= 45)),
  period_length_estimate integer check (period_length_estimate is null or (period_length_estimate >= 1 and period_length_estimate <= 14)),
  onboarding_completed boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- User preferences table
create table public.user_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  notifications_enabled boolean default true,
  period_reminder_days_before integer default 2 check (period_reminder_days_before >= 0 and period_reminder_days_before <= 7),
  daily_tracking_reminder boolean default false,
  reminder_time time default '09:00',
  show_ovulation_estimate boolean default false,
  use_contraception boolean default false,
  contraception_type text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Period records table
create table public.period_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  start_date date not null,
  end_date date,
  is_predicted boolean default false not null,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint valid_dates check (end_date is null or end_date >= start_date),
  constraint unique_period_start unique (user_id, start_date)
);

-- Daily logs table
create table public.daily_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  log_date date not null,
  flow_intensity text check (flow_intensity is null or flow_intensity in ('spotting', 'light', 'medium', 'heavy')),
  mood text check (mood is null or mood in ('happy', 'calm', 'energetic', 'anxious', 'sad', 'irritable', 'stressed', 'neutral')),
  energy_level integer check (energy_level is null or (energy_level >= 1 and energy_level <= 5)),
  sleep_quality integer check (sleep_quality is null or (sleep_quality >= 1 and sleep_quality <= 5)),
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint unique_daily_log unique (user_id, log_date)
);

-- Symptom logs table
create table public.symptom_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  log_date date not null,
  symptom_name text not null,
  severity text not null check (severity in ('mild', 'moderate', 'severe')),
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Reminders table
create table public.reminders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  reminder_type text not null check (reminder_type in ('period', 'tracking', 'care', 'custom')),
  scheduled_date date,
  scheduled_time time,
  is_recurring boolean default false,
  recurrence_pattern text,
  is_active boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes
create index idx_period_records_user_date on public.period_records(user_id, start_date desc);
create index idx_daily_logs_user_date on public.daily_logs(user_id, log_date desc);
create index idx_symptom_logs_user_date on public.symptom_logs(user_id, log_date desc);
create index idx_symptom_logs_name on public.symptom_logs(user_id, symptom_name);
create index idx_reminders_user_active on public.reminders(user_id, is_active) where is_active = true;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.period_records enable row level security;
alter table public.daily_logs enable row level security;
alter table public.symptom_logs enable row level security;
alter table public.reminders enable row level security;

-- RLS Policies: Users can only access their own data
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = user_id);
create policy "Users can delete own profile" on public.profiles for delete using (auth.uid() = user_id);

create policy "Users can view own preferences" on public.user_preferences for select using (auth.uid() = user_id);
create policy "Users can insert own preferences" on public.user_preferences for insert with check (auth.uid() = user_id);
create policy "Users can update own preferences" on public.user_preferences for update using (auth.uid() = user_id);
create policy "Users can delete own preferences" on public.user_preferences for delete using (auth.uid() = user_id);

create policy "Users can view own period records" on public.period_records for select using (auth.uid() = user_id);
create policy "Users can insert own period records" on public.period_records for insert with check (auth.uid() = user_id);
create policy "Users can update own period records" on public.period_records for update using (auth.uid() = user_id);
create policy "Users can delete own period records" on public.period_records for delete using (auth.uid() = user_id);

create policy "Users can view own daily logs" on public.daily_logs for select using (auth.uid() = user_id);
create policy "Users can insert own daily logs" on public.daily_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own daily logs" on public.daily_logs for update using (auth.uid() = user_id);
create policy "Users can delete own daily logs" on public.daily_logs for delete using (auth.uid() = user_id);

create policy "Users can view own symptom logs" on public.symptom_logs for select using (auth.uid() = user_id);
create policy "Users can insert own symptom logs" on public.symptom_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own symptom logs" on public.symptom_logs for update using (auth.uid() = user_id);
create policy "Users can delete own symptom logs" on public.symptom_logs for delete using (auth.uid() = user_id);

create policy "Users can view own reminders" on public.reminders for select using (auth.uid() = user_id);
create policy "Users can insert own reminders" on public.reminders for insert with check (auth.uid() = user_id);
create policy "Users can update own reminders" on public.reminders for update using (auth.uid() = user_id);
create policy "Users can delete own reminders" on public.reminders for delete using (auth.uid() = user_id);

-- Auto-create profile and preferences on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id) values (new.id);
  insert into public.user_preferences (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles for each row execute procedure public.update_updated_at();
create trigger update_user_preferences_updated_at before update on public.user_preferences for each row execute procedure public.update_updated_at();
create trigger update_period_records_updated_at before update on public.period_records for each row execute procedure public.update_updated_at();
create trigger update_daily_logs_updated_at before update on public.daily_logs for each row execute procedure public.update_updated_at();
create trigger update_symptom_logs_updated_at before update on public.symptom_logs for each row execute procedure public.update_updated_at();
create trigger update_reminders_updated_at before update on public.reminders for each row execute procedure public.update_updated_at();
