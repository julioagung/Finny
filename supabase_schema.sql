-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/ajrcqcsedlyullwcehza/sql)

-- Access codes table (kamu generate, user pakai untuk register)
create table if not exists public.access_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  used boolean default false,
  used_by uuid references auth.users(id),
  used_at timestamptz,
  created_at timestamptz default now()
);

-- User profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'User',
  photo_url text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Wallets
create table if not exists public.wallets (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null default 'bank',
  balance numeric not null default 0,
  icon text default '💳',
  color text default '#4A90D9',
  created_at timestamptz default now()
);

-- Categories
create table if not exists public.categories (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('income','expense')),
  icon text default '📦',
  color text default '#ccc'
);

-- Transactions
create table if not exists public.transactions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('income','expense','transfer')),
  amount numeric not null,
  category_id text,
  wallet_id text not null,
  to_wallet_id text,
  date date not null,
  note text default '',
  created_at timestamptz default now()
);

-- Budgets
create table if not exists public.budgets (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category_id text not null,
  "limit" numeric not null,
  period text default 'monthly'
);

-- Savings goals
create table if not exists public.savings_goals (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  deadline date,
  icon text default '🎯',
  color text default '#E91E8C'
);

-- Recurring transactions
create table if not exists public.recurring_transactions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('income','expense')),
  amount numeric not null,
  category_id text,
  wallet_id text not null,
  day_of_month integer not null,
  note text default ''
);

-- Enable RLS on all tables
alter table public.access_codes enable row level security;
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.recurring_transactions enable row level security;

-- RLS Policies: user hanya bisa akses data miliknya sendiri
create policy "users own wallets" on public.wallets for all using (auth.uid() = user_id);
create policy "users own categories" on public.categories for all using (auth.uid() = user_id);
create policy "users own transactions" on public.transactions for all using (auth.uid() = user_id);
create policy "users own budgets" on public.budgets for all using (auth.uid() = user_id);
create policy "users own goals" on public.savings_goals for all using (auth.uid() = user_id);
create policy "users own recurring" on public.recurring_transactions for all using (auth.uid() = user_id);
create policy "users own profile" on public.profiles for all using (auth.uid() = id);

-- Access codes: anyone can read (to validate), only admin can insert
create policy "anyone can read access codes" on public.access_codes for select using (true);
create policy "admin can insert access codes" on public.access_codes for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);
create policy "admin can update access codes" on public.access_codes for update using (
  exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
);

-- Auto-create profile when user registers
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'User'));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
