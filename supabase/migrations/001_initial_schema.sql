-- ── Extensions ─────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enums ──────────────────────────────────────────────────────────────────────
create type story_category as enum (
  'Adventure',
  'Learning',
  'Connecting',
  'Going wild',
  'Going solo'
);

create type story_status as enum (
  'published',
  'pending',
  'rejected'
);

-- ── Profiles ───────────────────────────────────────────────────────────────────
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

-- Auto-create a profile row whenever a new user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── Stories ────────────────────────────────────────────────────────────────────
create table stories (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references profiles(id) on delete cascade,
  title      text        not null,
  moment     text        not null,
  worth_it   text        not null,
  advice     text,                          -- optional (Q3)
  category   story_category not null,
  status     story_status   not null default 'published',
  created_at timestamptz not null default now()
);

-- ── Saves ──────────────────────────────────────────────────────────────────────
create table saves (
  id       uuid        primary key default gen_random_uuid(),
  user_id  uuid        not null references profiles(id) on delete cascade,
  story_id uuid        not null references stories(id) on delete cascade,
  is_done  boolean     not null default false,
  saved_at timestamptz not null default now(),
  unique (user_id, story_id)
);

-- ── Row Level Security ─────────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table stories  enable row level security;
alter table saves    enable row level security;

-- profiles
create policy "profiles: public read"
  on profiles for select using (true);

create policy "profiles: own update"
  on profiles for update using (auth.uid() = id);

-- stories
create policy "stories: public read published"
  on stories for select using (status = 'published');

create policy "stories: authenticated insert"
  on stories for insert with check (auth.uid() = user_id);

create policy "stories: own update"
  on stories for update using (auth.uid() = user_id);

create policy "stories: own delete"
  on stories for delete using (auth.uid() = user_id);

-- saves
create policy "saves: own read"
  on saves for select using (auth.uid() = user_id);

create policy "saves: authenticated insert"
  on saves for insert with check (auth.uid() = user_id);

create policy "saves: own update"
  on saves for update using (auth.uid() = user_id);

create policy "saves: own delete"
  on saves for delete using (auth.uid() = user_id);
