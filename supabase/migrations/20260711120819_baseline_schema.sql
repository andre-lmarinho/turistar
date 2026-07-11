-- Baseline schema for the travel-planner Supabase database.
--
-- This is the single source of truth for the `public` schema. It reconstructs
-- the tables, RPCs, RLS, grants and realtime publication that the app depends
-- on, aligned with the destructive rebuild that recreated production, and folds
-- in the access-control fixes that the rebuild did not carry:
--   * append_plan_events / update_plan_title / update_plan_dates require plan
--     membership (auth.uid()) instead of trusting is_public or a public token;
--   * event actor_id is derived from auth.uid(), never from the client payload;
--   * plans.edit_token is not selectable through the Data API (column grants);
--   * create_full_plan no longer overwrites a shared destination's coordinates;
--   * re-inviting an existing member no longer silently changes their tier;
--   * admin mutations serialize per plan to protect the "last admin" invariant;
--   * child rows cascade on plan delete, and owners get a DELETE policy.
--
-- The database already exists in production (it was rebuilt from
-- .idea/rebuild.sql), so this migration is written to be idempotent and
-- reconciling: it tolerates objects that already exist and still applies the
-- fixes above, without dropping any table or its data. It also runs cleanly on
-- an empty database (supabase db reset / a fresh environment).

set search_path = public, extensions;

create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if not exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'plan_member_tier' and n.nspname = 'public'
  ) then
    create type public.plan_member_tier as enum ('admin', 'member');
  end if;
end
$$;

-- Tables. `if not exists` leaves existing production tables (and their data)
-- untouched; new-environment runs create them. Foreign keys, the columns that
-- changed type, and the constraints the rebuild lacked are reconciled below so
-- both paths converge on the same shape.
create table if not exists public.budget_entries (
  id uuid not null default uuid_generate_v4(),
  plan_id uuid not null,
  description text,
  category text,
  amount numeric,
  constraint budget_entries_pkey primary key (id)
);

create table if not exists public.destinations (
  id uuid not null default uuid_generate_v4(),
  name text not null unique,
  country text,
  latitude double precision,
  longitude double precision,
  constraint destinations_pkey primary key (id)
);

create table if not exists public.plan_destinations (
  plan_id uuid not null,
  destination_id uuid not null,
  position integer not null default 0,
  constraint plan_destinations_pkey primary key (plan_id, destination_id)
);

create table if not exists public.plan_events (
  id uuid not null default gen_random_uuid(),
  plan_id uuid not null,
  version bigint not null,
  payload jsonb not null,
  created_at timestamp with time zone not null default now(),
  event_id uuid not null default gen_random_uuid(),
  event_type text not null,
  actor_id uuid not null,
  constraint plan_events_pkey primary key (id)
);

create table if not exists public.plan_members (
  plan_id uuid not null,
  user_id uuid not null,
  tier public.plan_member_tier not null default 'member'::public.plan_member_tier,
  created_at timestamp with time zone not null default now(),
  created_by uuid,
  constraint plan_members_pkey primary key (plan_id, user_id)
);

create table if not exists public.plan_share_links (
  plan_id uuid not null,
  token uuid not null default gen_random_uuid() unique,
  created_at timestamp with time zone not null default now(),
  created_by uuid not null,
  revoked_at timestamp with time zone,
  constraint plan_share_links_pkey primary key (plan_id)
);

create table if not exists public.plan_snapshots (
  plan_id uuid not null,
  version bigint not null default 0,
  state jsonb not null default jsonb_build_object('days', '[]'::jsonb),
  updated_at timestamp with time zone not null default now(),
  constraint plan_snapshots_pkey primary key (plan_id)
);

create table if not exists public.plans (
  id uuid not null default uuid_generate_v4(),
  user_id uuid,
  title text,
  start_date date,
  end_date date,
  created_at timestamp with time zone not null default now(),
  budget numeric,
  is_public boolean not null default true,
  public_slug text not null default translate(encode(gen_random_bytes(9), 'base64'::text), '/+'::text, '_-'::text),
  edit_token uuid not null default gen_random_uuid(),
  cover_image text,
  constraint plans_pkey primary key (id)
);

create table if not exists public.profiles (
  id uuid not null,
  created_at timestamp with time zone not null default now(),
  slug text not null unique,
  display_name text,
  avatar_url text,
  constraint profiles_pkey primary key (id)
);

-- Align the event version counter with plan_snapshots.version (bigint). Widening
-- integer -> bigint preserves data and is a no-op when already bigint.
alter table public.plan_events alter column version type bigint;

-- Foreign keys. Dropped-if-present then re-added so existing databases pick up
-- ON DELETE CASCADE (the rebuild created these without it, and had no FK on
-- plan_events at all). A plan can then be removed with a single owner-scoped
-- DELETE instead of a service-role loop.
alter table public.budget_entries drop constraint if exists budget_entries_plan_id_fkey;
alter table public.budget_entries
  add constraint budget_entries_plan_id_fkey foreign key (plan_id) references public.plans(id) on delete cascade;

alter table public.plan_destinations drop constraint if exists plan_destinations_plan_id_fkey;
alter table public.plan_destinations
  add constraint plan_destinations_plan_id_fkey foreign key (plan_id) references public.plans(id) on delete cascade;
alter table public.plan_destinations drop constraint if exists plan_destinations_destination_id_fkey;
alter table public.plan_destinations
  add constraint plan_destinations_destination_id_fkey foreign key (destination_id) references public.destinations(id);

alter table public.plan_events drop constraint if exists plan_events_plan_id_fkey;
alter table public.plan_events
  add constraint plan_events_plan_id_fkey foreign key (plan_id) references public.plans(id) on delete cascade;

alter table public.plan_members drop constraint if exists plan_members_plan_id_fkey;
alter table public.plan_members
  add constraint plan_members_plan_id_fkey foreign key (plan_id) references public.plans(id) on delete cascade;
alter table public.plan_members drop constraint if exists plan_members_user_id_fkey;
alter table public.plan_members
  add constraint plan_members_user_id_fkey foreign key (user_id) references public.profiles(id);
alter table public.plan_members drop constraint if exists plan_members_created_by_fkey;
alter table public.plan_members
  add constraint plan_members_created_by_fkey foreign key (created_by) references public.profiles(id);

alter table public.plan_share_links drop constraint if exists plan_share_links_plan_id_fkey;
alter table public.plan_share_links
  add constraint plan_share_links_plan_id_fkey foreign key (plan_id) references public.plans(id) on delete cascade;
alter table public.plan_share_links drop constraint if exists plan_share_links_created_by_fkey;
alter table public.plan_share_links
  add constraint plan_share_links_created_by_fkey foreign key (created_by) references public.profiles(id);

alter table public.plan_snapshots drop constraint if exists plan_snapshots_plan_id_fkey;
alter table public.plan_snapshots
  add constraint plan_snapshots_plan_id_fkey foreign key (plan_id) references public.plans(id) on delete cascade;

alter table public.plans drop constraint if exists plans_user_id_fkey;
alter table public.plans
  add constraint plans_user_id_fkey foreign key (user_id) references public.profiles(id);

alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles
  add constraint profiles_id_fkey foreign key (id) references auth.users(id);

-- Uniqueness the rebuild lacked: one row per (plan_id, version) for the event
-- log, and a unique public_slug (the code resolves plans by slug via maybeSingle).
alter table public.plan_events drop constraint if exists plan_events_plan_id_version_key;
alter table public.plan_events
  add constraint plan_events_plan_id_version_key unique (plan_id, version);

alter table public.plans drop constraint if exists plans_public_slug_key;
alter table public.plans
  add constraint plans_public_slug_key unique (public_slug);

-- Indexes backing foreign keys that are filtered/joined but not covered by a PK.
create index if not exists plan_members_created_by_idx on public.plan_members (created_by);
create index if not exists plan_share_links_created_by_idx on public.plan_share_links (created_by);

-- Functions. `create or replace` applies the hardened bodies whether or not the
-- function already exists (the signatures match the rebuild, so no drop needed).
create or replace function public.is_plan_member(_plan_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.plan_members pm
    where pm.plan_id = _plan_id
      and pm.user_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.plans p
    where p.id = _plan_id
      and p.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_plan_admin(_plan_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.plans p
    where p.id = _plan_id
      and p.user_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.plan_members pm
    where pm.plan_id = _plan_id
      and pm.user_id = (select auth.uid())
      and pm.tier = 'admin'
  );
$$;

create or replace function public.plan_admin_count(_plan_id uuid)
returns integer
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select count(*)::integer
  from public.plan_members pm
  where pm.plan_id = _plan_id
    and pm.tier = 'admin';
$$;

create or replace function public.create_full_plan(
  _title text,
  _dest_name text,
  _dest_lat double precision default null,
  _dest_long double precision default null,
  _dest_country text default null,
  _start_date date default null,
  _end_date date default null,
  _user_id uuid default null,
  _cover_image text default null
)
returns table(result_plan_id uuid, result_public_slug text, result_edit_token uuid)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_auth_uid uuid;
  v_user_id uuid;
  v_destination_id uuid;
  v_title text;
  v_destination_name text;
  v_country text;
begin
  v_auth_uid := (select auth.uid());

  if v_auth_uid is null then
    raise exception 'create_full_plan: not authenticated';
  end if;

  v_user_id := coalesce(_user_id, v_auth_uid);

  if v_user_id <> v_auth_uid then
    raise exception 'create_full_plan: user_id does not match auth.uid';
  end if;

  v_title := nullif(btrim(_title), '');
  v_destination_name := nullif(btrim(_dest_name), '');
  v_country := nullif(upper(btrim(_dest_country)), '');

  insert into public.plans (title, start_date, end_date, user_id, cover_image)
  values (v_title, _start_date, _end_date, v_user_id, _cover_image)
  returning id, public_slug, edit_token
  into result_plan_id, result_public_slug, result_edit_token;

  if v_destination_name is not null then
    -- Destinations are a shared, name-unique catalog. Never overwrite an
    -- existing destination's coordinates from one plan's input; first write
    -- wins and later plans just link to the existing row.
    insert into public.destinations (name, latitude, longitude, country)
    values (v_destination_name, _dest_lat, _dest_long, v_country)
    on conflict (name) do nothing
    returning id into v_destination_id;

    if v_destination_id is null then
      select id into v_destination_id
      from public.destinations
      where name = v_destination_name;
    end if;

    insert into public.plan_destinations (plan_id, destination_id, position)
    values (result_plan_id, v_destination_id, 0)
    on conflict (plan_id, destination_id) do nothing;
  end if;

  insert into public.plan_snapshots (plan_id)
  values (result_plan_id)
  on conflict (plan_id) do nothing;

  insert into public.plan_members (plan_id, user_id, tier, created_by)
  values (result_plan_id, v_user_id, 'admin', v_user_id)
  on conflict (plan_id, user_id) do nothing;

  return query select result_plan_id, result_public_slug, result_edit_token;
end;
$$;

create or replace function public.get_user_planners()
returns table (
  id uuid,
  title text,
  start_date date,
  end_date date,
  created_at timestamp with time zone,
  public_slug text,
  edit_token text,
  destination_name text,
  latest_snapshot_at timestamp with time zone,
  cover_image text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with current_user_id as (
    select auth.uid() as id
  ),
  user_plan_ids as (
    select p.id as plan_id
    from public.plans p, current_user_id cu
    where p.user_id = cu.id
    union
    select pm.plan_id
    from public.plan_members pm, current_user_id cu
    where pm.user_id = cu.id
  ),
  plan_first_destinations as (
    select distinct on (pd.plan_id)
      pd.plan_id,
      d.name as destination_name
    from public.plan_destinations pd
    join public.destinations d on d.id = pd.destination_id
    where pd.plan_id in (select plan_id from user_plan_ids)
    order by pd.plan_id, pd.position asc
  )
  select
    p.id,
    p.title,
    p.start_date,
    p.end_date,
    p.created_at,
    p.public_slug,
    p.edit_token::text,
    pfd.destination_name,
    ps.updated_at as latest_snapshot_at,
    p.cover_image
  from public.plans p
  join user_plan_ids upi on upi.plan_id = p.id
  left join public.plan_snapshots ps on ps.plan_id = p.id
  left join plan_first_destinations pfd on pfd.plan_id = p.id
  order by coalesce(ps.updated_at, p.created_at) desc
  limit 50;
$$;

-- Title/date edits are authorized by plan membership, not by the edit_token.
-- The _edit_token parameter is retained for call-site stability and ignored.
create or replace function public.update_plan_title(
  _plan_id uuid,
  _edit_token uuid,
  _new_title text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_auth_uid uuid;
  v_updated_count integer;
begin
  v_auth_uid := (select auth.uid());

  if v_auth_uid is null or not public.is_plan_member(_plan_id) then
    raise exception 'update_plan_title: not authorized for plan_id=% user_id=%', _plan_id, v_auth_uid;
  end if;

  update public.plans
  set title = nullif(btrim(_new_title), '')
  where id = _plan_id;

  get diagnostics v_updated_count = row_count;

  if v_updated_count = 0 then
    raise exception 'update_plan_title: no plan updated for plan_id=%', _plan_id
      using errcode = 'P0001';
  end if;
end;
$$;

create or replace function public.update_plan_dates(
  _plan_id uuid,
  _edit_token uuid,
  _start_date date,
  _end_date date
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_auth_uid uuid;
  v_updated_count integer;
begin
  v_auth_uid := (select auth.uid());

  if v_auth_uid is null or not public.is_plan_member(_plan_id) then
    raise exception 'update_plan_dates: not authorized for plan_id=% user_id=%', _plan_id, v_auth_uid;
  end if;

  update public.plans
  set start_date = _start_date,
      end_date = _end_date
  where id = _plan_id;

  get diagnostics v_updated_count = row_count;

  if v_updated_count = 0 then
    raise exception 'update_plan_dates: no plan updated for plan_id=%', _plan_id
      using errcode = 'P0001';
  end if;
end;
$$;

create or replace function public.append_plan_events(
  plan_id uuid,
  base_version bigint,
  events jsonb,
  snapshot_state jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_auth_uid uuid;
  v_current_version bigint;
  v_new_version bigint;
  v_event_record jsonb;
  v_inserted_events jsonb := '[]'::jsonb;
  v_event_id uuid;
  v_event_type text;
  v_event_payload jsonb;
  v_actor_id uuid;
  v_created_at timestamp with time zone;
begin
  v_auth_uid := (select auth.uid());

  -- Writing plan events requires membership. Public visibility only grants
  -- read access; it never authorizes a write.
  if v_auth_uid is null or not public.is_plan_member(append_plan_events.plan_id) then
    raise exception 'append_plan_events: not authorized for plan_id=% user_id=%', plan_id, v_auth_uid;
  end if;

  if not exists (select 1 from public.plans p where p.id = append_plan_events.plan_id) then
    raise exception 'append_plan_events: plan not found for plan_id=%', plan_id;
  end if;

  if jsonb_typeof(events) is distinct from 'array' then
    raise exception 'append_plan_events: events must be a JSON array for plan_id=%', plan_id;
  end if;

  insert into public.plan_snapshots (plan_id)
  values (append_plan_events.plan_id)
  on conflict on constraint plan_snapshots_pkey do nothing;

  select ps.version
  into v_current_version
  from public.plan_snapshots ps
  where ps.plan_id = append_plan_events.plan_id
  for update;

  if v_current_version is null then
    raise exception 'append_plan_events: snapshot not found for plan_id=%', plan_id;
  end if;

  if base_version <> v_current_version then
    return jsonb_build_object(
      'version', v_current_version,
      'inserted_events', '[]'::jsonb
    );
  end if;

  v_new_version := v_current_version;

  for v_event_record in
    select event_value
    from jsonb_array_elements(events) as event_items(event_value)
  loop
    v_event_type := nullif(btrim(v_event_record->>'type'), '');

    if v_event_type is null then
      raise exception 'append_plan_events: event type is required for plan_id=%', plan_id;
    end if;

    v_new_version := v_new_version + 1;
    v_event_id := coalesce(nullif(v_event_record->>'id', '')::uuid, gen_random_uuid());
    v_event_payload := coalesce(v_event_record->'payload', '{}'::jsonb);
    -- actor_id is the authenticated caller, never a client-supplied value.
    v_actor_id := v_auth_uid;
    v_created_at := now();

    insert into public.plan_events (event_id, plan_id, version, event_type, payload, actor_id, created_at)
    values (
      v_event_id,
      append_plan_events.plan_id,
      v_new_version,
      v_event_type,
      v_event_payload,
      v_actor_id,
      v_created_at
    );

    v_inserted_events := v_inserted_events || jsonb_build_object(
      'event_id', v_event_id,
      'plan_id', append_plan_events.plan_id,
      'version', v_new_version,
      'event_type', v_event_type,
      'payload', v_event_payload,
      'actor_id', v_actor_id,
      'created_at', v_created_at
    );
  end loop;

  update public.plan_snapshots ps
  set version = v_new_version,
      state = coalesce(snapshot_state, ps.state),
      updated_at = now()
  where ps.plan_id = append_plan_events.plan_id;

  return jsonb_build_object(
    'version', v_new_version,
    'inserted_events', v_inserted_events
  );
end;
$$;

create or replace function public.add_plan_member_by_email(
  _plan_id uuid,
  _email text,
  _tier public.plan_member_tier default 'member'
)
returns table(user_id uuid, tier public.plan_member_tier)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_auth_uid uuid;
  v_normalized_email text;
  v_target_user uuid;
begin
  v_auth_uid := (select auth.uid());

  if v_auth_uid is null then
    raise exception 'add_plan_member_by_email: not authenticated for plan_id=%', _plan_id;
  end if;

  if not public.is_plan_admin(_plan_id) then
    raise exception 'add_plan_member_by_email: not authorized for plan_id=% user_id=%', _plan_id, v_auth_uid;
  end if;

  v_normalized_email := lower(btrim(_email));

  select pr.id into v_target_user
  from auth.users u
  join public.profiles pr on pr.id = u.id
  where lower(u.email) = v_normalized_email
  limit 1;

  if v_target_user is null then
    raise exception 'add_plan_member_by_email: user not registered for plan_id=% email=%', _plan_id, v_normalized_email;
  end if;

  -- Re-inviting an existing member is a no-op on tier: an invite must not
  -- silently promote or demote, which would bypass the last-admin guard.
  insert into public.plan_members (plan_id, user_id, tier, created_by)
  values (_plan_id, v_target_user, coalesce(_tier, 'member'), v_auth_uid)
  on conflict on constraint plan_members_pkey do nothing;

  return query
    select pm.user_id, pm.tier
    from public.plan_members pm
    where pm.plan_id = _plan_id
      and pm.user_id = v_target_user;
end;
$$;

create or replace function public.update_plan_member_tier(
  _plan_id uuid,
  _user_id uuid,
  _tier public.plan_member_tier
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_auth_uid uuid;
  v_target_tier public.plan_member_tier;
  v_admin_count integer;
  v_plan_owner uuid;
begin
  v_auth_uid := (select auth.uid());

  if v_auth_uid is null then
    raise exception 'update_plan_member_tier: not authenticated for plan_id=%', _plan_id;
  end if;

  if not public.is_plan_admin(_plan_id) then
    raise exception 'update_plan_member_tier: not authorized for plan_id=% user_id=%', _plan_id, v_auth_uid;
  end if;

  -- Serialize administrative mutations per plan so concurrent transactions
  -- cannot race past the last-admin invariant.
  perform pg_advisory_xact_lock(hashtextextended(_plan_id::text, 0));

  select p.user_id into v_plan_owner
  from public.plans p
  where p.id = _plan_id;

  if v_plan_owner is not null and v_plan_owner = _user_id then
    raise exception 'update_plan_member_tier: owner tier cannot be changed for plan_id=% user_id=%', _plan_id, _user_id;
  end if;

  select pm.tier into v_target_tier
  from public.plan_members pm
  where pm.plan_id = _plan_id
    and pm.user_id = _user_id;

  if v_target_tier is null then
    raise exception 'update_plan_member_tier: member not found for plan_id=% user_id=%', _plan_id, _user_id;
  end if;

  if v_target_tier = 'admin' and _tier = 'member' then
    select public.plan_admin_count(_plan_id) into v_admin_count;

    if v_admin_count <= 1 then
      raise exception 'update_plan_member_tier: plan must have at least one admin for plan_id=%', _plan_id;
    end if;
  end if;

  update public.plan_members
  set tier = _tier
  where plan_id = _plan_id
    and user_id = _user_id;
end;
$$;

create or replace function public.remove_plan_member(
  _plan_id uuid,
  _user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_auth_uid uuid;
  v_target_tier public.plan_member_tier;
  v_admin_count integer;
  v_plan_owner uuid;
begin
  v_auth_uid := (select auth.uid());

  if v_auth_uid is null then
    raise exception 'remove_plan_member: not authenticated for plan_id=%', _plan_id;
  end if;

  if not public.is_plan_admin(_plan_id) then
    raise exception 'remove_plan_member: not authorized for plan_id=% user_id=%', _plan_id, v_auth_uid;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(_plan_id::text, 0));

  select p.user_id into v_plan_owner
  from public.plans p
  where p.id = _plan_id;

  if v_plan_owner is not null and v_plan_owner = _user_id then
    raise exception 'remove_plan_member: owner cannot be removed for plan_id=% user_id=%', _plan_id, _user_id;
  end if;

  select pm.tier into v_target_tier
  from public.plan_members pm
  where pm.plan_id = _plan_id
    and pm.user_id = _user_id;

  if v_target_tier is null then
    raise exception 'remove_plan_member: member not found for plan_id=% user_id=%', _plan_id, _user_id;
  end if;

  if v_target_tier = 'admin' then
    select public.plan_admin_count(_plan_id) into v_admin_count;

    if v_admin_count <= 1 then
      raise exception 'remove_plan_member: plan must have at least one admin for plan_id=%', _plan_id;
    end if;
  end if;

  delete from public.plan_members
  where plan_id = _plan_id
    and user_id = _user_id;
end;
$$;

create or replace function public.leave_plan(_plan_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_self_id uuid;
  v_self_tier public.plan_member_tier;
  v_admin_count integer;
  v_plan_owner uuid;
  v_new_owner uuid;
begin
  v_self_id := (select auth.uid());

  if v_self_id is null then
    raise exception 'leave_plan: not authenticated for plan_id=%', _plan_id;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(_plan_id::text, 0));

  select p.user_id into v_plan_owner
  from public.plans p
  where p.id = _plan_id;

  select pm.tier into v_self_tier
  from public.plan_members pm
  where pm.plan_id = _plan_id
    and pm.user_id = v_self_id;

  if v_self_tier is null then
    raise exception 'leave_plan: member not found for plan_id=% user_id=%', _plan_id, v_self_id;
  end if;

  if v_self_tier = 'admin' then
    select public.plan_admin_count(_plan_id) into v_admin_count;

    if v_admin_count <= 1 then
      raise exception 'leave_plan: plan must have at least one admin for plan_id=%', _plan_id;
    end if;
  end if;

  if v_plan_owner is not null and v_plan_owner = v_self_id then
    select pm.user_id into v_new_owner
    from public.plan_members pm
    where pm.plan_id = _plan_id
      and pm.tier = 'admin'
      and pm.user_id <> v_self_id
    order by pm.created_at asc
    limit 1;

    if v_new_owner is null then
      raise exception 'leave_plan: plan must have at least one admin for plan_id=%', _plan_id;
    end if;

    update public.plans
    set user_id = v_new_owner
    where id = _plan_id;
  end if;

  delete from public.plan_members
  where plan_id = _plan_id
    and user_id = v_self_id;
end;
$$;

create or replace function public.create_plan_share_link(_plan_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_auth_uid uuid;
  v_token uuid;
begin
  v_auth_uid := (select auth.uid());

  if v_auth_uid is null then
    raise exception 'create_plan_share_link: not authenticated for plan_id=%', _plan_id;
  end if;

  if not public.is_plan_admin(_plan_id) then
    raise exception 'create_plan_share_link: not authorized for plan_id=% user_id=%', _plan_id, v_auth_uid;
  end if;

  v_token := gen_random_uuid();

  insert into public.plan_share_links (plan_id, token, created_by, created_at, revoked_at)
  values (_plan_id, v_token, v_auth_uid, now(), null)
  on conflict (plan_id) do update
    set token = excluded.token,
        created_by = excluded.created_by,
        created_at = excluded.created_at,
        revoked_at = null
  returning token into v_token;

  return v_token;
end;
$$;

create or replace function public.revoke_plan_share_link(_plan_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_auth_uid uuid;
  v_updated_count integer;
begin
  v_auth_uid := (select auth.uid());

  if v_auth_uid is null then
    raise exception 'revoke_plan_share_link: not authenticated for plan_id=%', _plan_id;
  end if;

  if not public.is_plan_admin(_plan_id) then
    raise exception 'revoke_plan_share_link: not authorized for plan_id=% user_id=%', _plan_id, v_auth_uid;
  end if;

  update public.plan_share_links
  set revoked_at = now()
  where plan_id = _plan_id
    and revoked_at is null;

  get diagnostics v_updated_count = row_count;

  return v_updated_count > 0;
end;
$$;

create or replace function public.accept_plan_share_link(_token uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_self_id uuid;
  v_target_plan uuid;
begin
  v_self_id := (select auth.uid());

  if v_self_id is null then
    raise exception 'accept_plan_share_link: not authenticated for token=%', _token;
  end if;

  select psl.plan_id into v_target_plan
  from public.plan_share_links psl
  where psl.token = _token
    and psl.revoked_at is null;

  if v_target_plan is null then
    raise exception 'Invalid or expired share link';
  end if;

  insert into public.plan_members (plan_id, user_id, tier, created_by)
  values (v_target_plan, v_self_id, 'member', v_self_id)
  on conflict on constraint plan_members_pkey do nothing;

  return v_target_plan;
end;
$$;

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.destinations enable row level security;
alter table public.plan_destinations enable row level security;
alter table public.plan_events enable row level security;
alter table public.plan_members enable row level security;
alter table public.plan_share_links enable row level security;
alter table public.plan_snapshots enable row level security;
alter table public.budget_entries enable row level security;

-- Policies. Dropped-if-present then recreated so existing databases converge on
-- the definitions below (and pick up the new owner DELETE policy).
drop policy if exists "Profiles are selectable by owner" on public.profiles;
create policy "Profiles are selectable by owner"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Profiles are selectable by shared plan members" on public.profiles;
create policy "Profiles are selectable by shared plan members"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.plan_members pm_self
      join public.plan_members pm_target on pm_target.plan_id = pm_self.plan_id
      where pm_self.user_id = (select auth.uid())
        and pm_target.user_id = profiles.id
    )
  );

drop policy if exists "Users insert their own profile" on public.profiles;
create policy "Users insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "Users delete their own profile" on public.profiles;
create policy "Users delete their own profile"
  on public.profiles
  for delete
  to authenticated
  using (id = (select auth.uid()));

drop policy if exists "Public plans are readable" on public.plans;
create policy "Public plans are readable"
  on public.plans
  for select
  to anon, authenticated
  using (is_public = true);

drop policy if exists "Members can read their plans" on public.plans;
create policy "Members can read their plans"
  on public.plans
  for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_plan_member(plans.id));

drop policy if exists "Members can update editable plan fields" on public.plans;
create policy "Members can update editable plan fields"
  on public.plans
  for update
  to authenticated
  using (user_id = (select auth.uid()) or public.is_plan_member(plans.id))
  with check (user_id = (select auth.uid()) or public.is_plan_member(plans.id));

drop policy if exists "Owners can delete their plans" on public.plans;
create policy "Owners can delete their plans"
  on public.plans
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Public plan destinations are readable" on public.plan_destinations;
create policy "Public plan destinations are readable"
  on public.plan_destinations
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.plans p
      where p.id = plan_destinations.plan_id
        and p.is_public = true
    )
  );

drop policy if exists "Member plan destinations are readable" on public.plan_destinations;
create policy "Member plan destinations are readable"
  on public.plan_destinations
  for select
  to authenticated
  using (public.is_plan_member(plan_destinations.plan_id));

drop policy if exists "Public destinations are readable through public plans" on public.destinations;
create policy "Public destinations are readable through public plans"
  on public.destinations
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.plan_destinations pd
      join public.plans p on p.id = pd.plan_id
      where pd.destination_id = destinations.id
        and p.is_public = true
    )
  );

drop policy if exists "Member destinations are readable" on public.destinations;
create policy "Member destinations are readable"
  on public.destinations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.plan_destinations pd
      where pd.destination_id = destinations.id
        and public.is_plan_member(pd.plan_id)
    )
  );

drop policy if exists "Public snapshots are readable" on public.plan_snapshots;
create policy "Public snapshots are readable"
  on public.plan_snapshots
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.plans p
      where p.id = plan_snapshots.plan_id
        and p.is_public = true
    )
  );

drop policy if exists "Member snapshots are readable" on public.plan_snapshots;
create policy "Member snapshots are readable"
  on public.plan_snapshots
  for select
  to authenticated
  using (public.is_plan_member(plan_snapshots.plan_id));

drop policy if exists "Public events are readable" on public.plan_events;
create policy "Public events are readable"
  on public.plan_events
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.plans p
      where p.id = plan_events.plan_id
        and p.is_public = true
    )
  );

drop policy if exists "Member events are readable" on public.plan_events;
create policy "Member events are readable"
  on public.plan_events
  for select
  to authenticated
  using (public.is_plan_member(plan_events.plan_id));

drop policy if exists "Plan members are readable by same plan members" on public.plan_members;
create policy "Plan members are readable by same plan members"
  on public.plan_members
  for select
  to authenticated
  using (public.is_plan_member(plan_members.plan_id));

drop policy if exists "Plan members are hidden from anonymous users" on public.plan_members;
create policy "Plan members are hidden from anonymous users"
  on public.plan_members
  for select
  to anon
  using (false);

drop policy if exists "Share links are readable by admins" on public.plan_share_links;
create policy "Share links are readable by admins"
  on public.plan_share_links
  for select
  to authenticated
  using (public.is_plan_admin(plan_share_links.plan_id));

drop policy if exists "Public budget entries are readable" on public.budget_entries;
create policy "Public budget entries are readable"
  on public.budget_entries
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.plans p
      where p.id = budget_entries.plan_id
        and p.is_public = true
    )
  );

drop policy if exists "Member budget entries are readable" on public.budget_entries;
create policy "Member budget entries are readable"
  on public.budget_entries
  for select
  to authenticated
  using (public.is_plan_member(budget_entries.plan_id));

drop policy if exists "Members can insert budget entries" on public.budget_entries;
create policy "Members can insert budget entries"
  on public.budget_entries
  for insert
  to authenticated
  with check (public.is_plan_member(budget_entries.plan_id));

drop policy if exists "Members can update budget entries" on public.budget_entries;
create policy "Members can update budget entries"
  on public.budget_entries
  for update
  to authenticated
  using (public.is_plan_member(budget_entries.plan_id))
  with check (public.is_plan_member(budget_entries.plan_id));

drop policy if exists "Members can delete budget entries" on public.budget_entries;
create policy "Members can delete budget entries"
  on public.budget_entries
  for delete
  to authenticated
  using (public.is_plan_member(budget_entries.plan_id));

-- Supabase seeds `public` with default privileges that grant every table and
-- routine directly to anon/authenticated. That is why `revoke ... from public`
-- (the pattern the rebuild used) is a no-op: the access is granted to the API
-- roles by name, not to PUBLIC. Revoke it wholesale so the explicit grants
-- below are the entire privilege set — least privilege, and edit_token / the
-- SECURITY DEFINER RPCs are actually out of anon's reach.
revoke all on all tables in schema public from anon, authenticated;
-- Routines need PUBLIC revoked too: Postgres grants EXECUTE to PUBLIC on every
-- new function, and anon/authenticated inherit it. Revoke both the PUBLIC grant
-- and the named Supabase default grants, then re-grant execute explicitly.
revoke all on all routines in schema public from public, anon, authenticated;

grant usage on type public.plan_member_tier to anon, authenticated, service_role;

-- Column-scoped so edit_token is never selectable through the Data API.
grant select (id, user_id, title, start_date, end_date, created_at, budget, is_public, public_slug, cover_image)
  on table public.plans to anon, authenticated;
grant update (title, start_date, end_date, budget, cover_image) on table public.plans to authenticated;
grant delete on table public.plans to authenticated;

grant select on table public.destinations to anon, authenticated;
grant select on table public.plan_destinations to anon, authenticated;
grant select on table public.plan_snapshots to anon, authenticated;
grant select on table public.plan_events to anon, authenticated;
grant select on table public.budget_entries to anon, authenticated;
grant insert (plan_id, description, category, amount) on table public.budget_entries to authenticated;
grant update (description, category, amount) on table public.budget_entries to authenticated;
grant delete on table public.budget_entries to authenticated;
grant select on table public.plan_members to anon, authenticated;
grant select on table public.plan_share_links to authenticated;
grant select on table public.profiles to authenticated;
grant insert (id, slug, display_name, avatar_url) on table public.profiles to authenticated;
-- id is included because PostgREST upserts (INSERT ... ON CONFLICT DO UPDATE)
-- write every payload column, including the conflict target, in the UPDATE.
grant update (id, slug, display_name, avatar_url) on table public.profiles to authenticated;
grant delete on table public.profiles to authenticated;

grant all privileges on table public.profiles to service_role;
grant all privileges on table public.plans to service_role;
grant all privileges on table public.destinations to service_role;
grant all privileges on table public.plan_destinations to service_role;
grant all privileges on table public.plan_events to service_role;
grant all privileges on table public.plan_members to service_role;
grant all privileges on table public.plan_share_links to service_role;
grant all privileges on table public.plan_snapshots to service_role;
grant all privileges on table public.budget_entries to service_role;

grant execute on function public.is_plan_member(uuid) to authenticated, service_role;
grant execute on function public.is_plan_admin(uuid) to authenticated, service_role;
grant execute on function public.plan_admin_count(uuid) to authenticated, service_role;
grant execute on function public.create_full_plan(
  text,
  text,
  double precision,
  double precision,
  text,
  date,
  date,
  uuid,
  text
) to authenticated, service_role;
grant execute on function public.get_user_planners() to authenticated, service_role;
grant execute on function public.update_plan_title(uuid, uuid, text) to authenticated, service_role;
grant execute on function public.update_plan_dates(uuid, uuid, date, date) to authenticated, service_role;
grant execute on function public.append_plan_events(uuid, bigint, jsonb, jsonb) to authenticated, service_role;
grant execute on function public.add_plan_member_by_email(uuid, text, public.plan_member_tier) to authenticated, service_role;
grant execute on function public.update_plan_member_tier(uuid, uuid, public.plan_member_tier) to authenticated, service_role;
grant execute on function public.remove_plan_member(uuid, uuid) to authenticated, service_role;
grant execute on function public.leave_plan(uuid) to authenticated, service_role;
grant execute on function public.create_plan_share_link(uuid) to authenticated, service_role;
grant execute on function public.revoke_plan_share_link(uuid) to authenticated, service_role;
grant execute on function public.accept_plan_share_link(uuid) to authenticated, service_role;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'plan_events'
    ) then
    execute 'alter publication supabase_realtime add table public.plan_events';
  end if;
end
$$;
