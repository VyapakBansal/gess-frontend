-- GESS Supabase Schema
-- Apply this in the Supabase SQL Editor (or via migrations).
-- The frontend expects these tables, policies, and storage buckets.

-- =============================================================================
-- Extensions
-- =============================================================================
create extension if not exists "pgcrypto";

-- =============================================================================
-- Tables
-- =============================================================================

create table if not exists public.team (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  role text not null,
  description text,
  linkedin_url text,
  photo_url text,
  display_order int not null default 0,
  is_admin boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint team_description_length check (
    description is null or char_length(description) <= 280
  )
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  end_date date,
  location text,
  image_url text,
  tag text not null default 'other'
    check (tag in ('workshop', 'social', 'industry_night', 'competition', 'other')),
  is_featured boolean not null default false,
  status text not null default 'upcoming'
    check (status in ('upcoming', 'past')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint events_end_after_start check (
    end_date is null or end_date >= event_date
  )
);

create index if not exists team_display_order_idx on public.team (display_order);
create index if not exists team_active_idx on public.team (is_active);
create index if not exists events_status_idx on public.events (status);
create index if not exists events_featured_idx on public.events (is_featured);
create index if not exists events_date_idx on public.events (event_date desc);

-- =============================================================================
-- Helpers
-- =============================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select t.is_admin
      from public.team t
      where t.id = auth.uid()
        and t.is_active = true
    ),
    false
  );
$$;

create or replace function public.is_active_exec()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team t
    where t.id = auth.uid()
      and t.is_active = true
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_active_exec() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_active_exec() to authenticated;

-- =============================================================================
-- Row Level Security — team
-- =============================================================================

alter table public.team enable row level security;

drop policy if exists "Public can read active team" on public.team;
create policy "Public can read active team"
  on public.team
  for select
  to anon, authenticated
  using (is_active = true);

-- Authenticated executives can always read their own row (even if deactivated UI needs it)
drop policy if exists "Executives can read own team row" on public.team;
create policy "Executives can read own team row"
  on public.team
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Executives can update own team row" on public.team;
create policy "Executives can update own team row"
  on public.team
  for update
  to authenticated
  using (auth.uid() = id and is_active = true)
  with check (
    auth.uid() = id
    and is_active = true
    -- Non-admins cannot escalate privileges or change ordering
    and (
      public.is_admin()
      or (
        is_admin is not distinct from (select t.is_admin from public.team t where t.id = auth.uid())
        and display_order is not distinct from (select t.display_order from public.team t where t.id = auth.uid())
        and is_active is not distinct from (select t.is_active from public.team t where t.id = auth.uid())
      )
    )
  );

drop policy if exists "Admins can insert team rows" on public.team;
create policy "Admins can insert team rows"
  on public.team
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update any team row" on public.team;
create policy "Admins can update any team row"
  on public.team
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins can delete team rows" on public.team;
create policy "Admins can delete team rows"
  on public.team
  for delete
  to authenticated
  using (public.is_admin());

-- =============================================================================
-- Row Level Security — events
-- =============================================================================

alter table public.events enable row level security;

drop policy if exists "Public can read events" on public.events;
create policy "Public can read events"
  on public.events
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Executives can insert events" on public.events;
create policy "Executives can insert events"
  on public.events
  for insert
  to authenticated
  with check (public.is_active_exec());

drop policy if exists "Executives can update events" on public.events;
create policy "Executives can update events"
  on public.events
  for update
  to authenticated
  using (public.is_active_exec())
  with check (public.is_active_exec());

drop policy if exists "Executives can delete events" on public.events;
create policy "Executives can delete events"
  on public.events
  for delete
  to authenticated
  using (public.is_active_exec());

-- =============================================================================
-- Storage buckets
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'team-photos',
    'team-photos',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'event-images',
    'event-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read
drop policy if exists "Public read team photos" on storage.objects;
create policy "Public read team photos"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'team-photos');

drop policy if exists "Public read event images" on storage.objects;
create policy "Public read event images"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'event-images');

-- Executives manage own team photo path: {user_id}/...
drop policy if exists "Executives upload own team photos" on storage.objects;
create policy "Executives upload own team photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'team-photos'
    and public.is_active_exec()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Executives update own team photos" on storage.objects;
create policy "Executives update own team photos"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'team-photos'
    and public.is_active_exec()
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'team-photos'
    and public.is_active_exec()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Executives delete own team photos" on storage.objects;
create policy "Executives delete own team photos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'team-photos'
    and public.is_active_exec()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins may manage any team photo
drop policy if exists "Admins manage team photos" on storage.objects;
create policy "Admins manage team photos"
  on storage.objects
  for all
  to authenticated
  using (bucket_id = 'team-photos' and public.is_admin())
  with check (bucket_id = 'team-photos' and public.is_admin());

-- Any active executive can manage event images
drop policy if exists "Executives upload event images" on storage.objects;
create policy "Executives upload event images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'event-images' and public.is_active_exec());

drop policy if exists "Executives update event images" on storage.objects;
create policy "Executives update event images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'event-images' and public.is_active_exec())
  with check (bucket_id = 'event-images' and public.is_active_exec());

drop policy if exists "Executives delete event images" on storage.objects;
create policy "Executives delete event images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'event-images' and public.is_active_exec());

-- =============================================================================
-- Realtime / webhook notes (configure in Supabase Dashboard)
-- =============================================================================
-- 1. Database Webhooks (or Edge Function) on public.team and public.events
--    POST to https://YOUR_DOMAIN/api/revalidate
--    Header: x-revalidate-secret: <REVALIDATE_SECRET>
--    Body example: { "table": "team" } or { "type": "UPDATE", "table": "events", ... }
--
-- 2. Auth: disable public sign-ups. Use invite-only.
--
-- 3. Bootstrap first admin (run after creating the Auth user manually):
--    insert into public.team (id, display_name, role, is_admin, display_order)
--    values ('<auth-user-uuid>', 'Your Name', 'President', true, 1);
