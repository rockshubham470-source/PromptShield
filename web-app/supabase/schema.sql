-- Supabase Schema for PromptShield
-- This schema defines the tables needed for the PromptShield dashboard

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text not null,
  tier text not null default 'free' check (tier in ('free', 'professional', 'business', 'enterprise')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- API Keys table
create table public.api_keys (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  key_hash text not null unique,
  prefix text not null,
  last_used_at timestamp with time zone,
  expires_at timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Detection Rules table
create table public.detection_rules (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  pattern text not null,
  description text,
  is_active boolean default true,
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Detections table
create table public.detections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  rule_id uuid references public.detection_rules on delete set null,
  content text not null,
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  confidence decimal(3,2) not null check (confidence >= 0 and confidence <= 1),
  detected_at timestamp with time zone default timezone('utc'::text, now()) not null,
  metadata jsonb default '{}'::jsonb
);

-- Notifications table
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  message text not null,
  category text not null check (category in ('security', 'billing', 'system')),
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Usage metrics table (for tracking API calls, etc.)
create table public.usage_metrics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  metric_type text not null,
  metric_value integer not null default 0,
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.api_keys enable row level security;
alter table public.detection_rules enable row level security;
alter table public.detections enable row level security;
alter table public.notifications enable row level security;
alter table public.usage_metrics enable row level security;

-- RLS Policies

-- Users: Users can only read/update their own data
create policy "Users can view own user data" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own user data" on public.users
  for update using (auth.uid() = id);

-- API Keys: Users can only manage their own API keys
create policy "Users can view own API keys" on public.api_keys
  for select using (auth.uid() = user_id);

create policy "Users can insert own API keys" on public.api_keys
  for insert with check (auth.uid() = user_id);

create policy "Users can update own API keys" on public.api_keys
  for update using (auth.uid() = user_id);

create policy "Users can delete own API keys" on public.api_keys
  for delete using (auth.uid() = user_id);

-- Detection Rules: Users can only manage their own rules
create policy "Users can view own detection rules" on public.detection_rules
  for select using (auth.uid() = user_id);

create policy "Users can insert own detection rules" on public.detection_rules
  for insert with check (auth.uid() = user_id);

create policy "Users can update own detection rules" on public.detection_rules
  for update using (auth.uid() = user_id);

create policy "Users can delete own detection rules" on public.detection_rules
  for delete using (auth.uid() = user_id);

-- Detections: Users can only view their own detections
create policy "Users can view own detections" on public.detections
  for select using (auth.uid() = user_id);

-- Notifications: Users can only manage their own notifications
create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can insert own notifications" on public.notifications
  for insert with check (auth.uid() = user_id);

create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

create policy "Users can delete own notifications" on public.notifications
  for delete using (auth.uid() = user_id);

-- Usage Metrics: Users can only view their own metrics
create policy "Users can view own usage metrics" on public.usage_metrics
  for select using (auth.uid() = user_id);

create policy "Users can insert own usage metrics" on public.usage_metrics
  for insert with check (auth.uid() = user_id);

-- Updated at trigger
create function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language 'plpgsql';

create trigger update_users_updated_at before update on public.users
  for each row execute procedure public.update_updated_at_column();
create trigger update_api_keys_updated_at before update on public.api_keys
  for each row execute procedure public.update_updated_at_column();
create trigger update_detection_rules_updated_at before update on public.detection_rules
  for each row execute procedure public.update_updated_at_column();
create trigger update_detections_updated_at before update on public.detections
  for each row execute procedure public.update_updated_at_column();
create trigger update_notifications_updated_at before update on public.notifications
  for each row execute procedure public.update_updated_at_column();
create trigger update_usage_metrics_updated_at before update on public.usage_metrics
  for each row execute procedure public.update_updated_at_column();