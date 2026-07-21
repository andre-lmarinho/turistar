-- Denormalize a plan's primary destination onto the plans table and retire the
-- destinations / plan_destinations catalog.
--
-- Why: every plan only ever received ONE destination (position 0), so the shared
-- name-unique catalog + M:N join was a 1:1 relationship in disguise. It also
-- coupled unrelated users' plans (a single shared "Paris" row) and made
-- destination creation an OPTIONAL step in create_full_plan, so plans could
-- exist with no destination at all (missing map pins, null card subtitle).
-- Folding name / country / coordinates onto plans makes the destination an
-- attribute written in the same insert as the plan, removing the join and the
-- failure mode. The "x cities · y countries" dashboard stat needs the country,
-- so it is denormalized too (previously write-only on destinations).

set search_path = public, extensions;

-- 1. New columns on plans.
alter table public.plans add column if not exists destination_name text;
alter table public.plans add column if not exists destination_country text;
alter table public.plans add column if not exists latitude double precision;
alter table public.plans add column if not exists longitude double precision;

-- The SELECT grant on plans is column-scoped (so edit_token was never readable
-- through the Data API), which makes new columns invisible to the API roles
-- until granted: selecting them fails with 42501. Column grants are additive
-- over the existing list. Anon is included because public plans expose their
-- destination on the read-only plan page and its metadata. No UPDATE grant:
-- these columns are written only through the SECURITY DEFINER create_full_plan.
grant select (destination_name, destination_country, latitude, longitude)
  on table public.plans to anon, authenticated;

-- 2. Backfill from each plan's first (lowest-position) destination. Guarded on
--    the catalog still existing so the whole file stays re-runnable after step 5
--    drops it; the destination_name null check keeps the fill itself idempotent.
do $$
begin
  if to_regclass('public.plan_destinations') is null then
    return;
  end if;

  update public.plans p
  set destination_name = src.name,
      destination_country = src.country,
      latitude = src.latitude,
      longitude = src.longitude
  from (
    select distinct on (pd.plan_id)
      pd.plan_id,
      d.name,
      d.country,
      d.latitude,
      d.longitude
    from public.plan_destinations pd
    join public.destinations d on d.id = pd.destination_id
    order by pd.plan_id, pd.position asc
  ) src
  where src.plan_id = p.id
    and p.destination_name is null;
end
$$;

-- 3. create_full_plan writes the destination straight onto the plan (no catalog).
--    Signature is unchanged, so existing EXECUTE grants carry over.
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
returns table(result_plan_id uuid, result_public_slug text)
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_auth_uid uuid;
  v_user_id uuid;
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

  insert into public.plans (
    title, start_date, end_date, user_id, cover_image,
    destination_name, destination_country, latitude, longitude
  )
  values (
    v_title, _start_date, _end_date, v_user_id, _cover_image,
    v_destination_name, v_country, _dest_lat, _dest_long
  )
  returning id, public_slug into result_plan_id, result_public_slug;

  insert into public.plan_snapshots (plan_id)
  values (result_plan_id)
  on conflict (plan_id) do nothing;

  insert into public.plan_members (plan_id, user_id, tier, created_by)
  values (result_plan_id, v_user_id, 'admin', v_user_id)
  on conflict (plan_id, user_id) do nothing;

  return query select result_plan_id, result_public_slug;
end;
$$;

-- 4. get_user_planners reads the denormalized column (drops the CTE + join).
create or replace function public.get_user_planners()
returns table (
  id uuid,
  title text,
  start_date date,
  end_date date,
  created_at timestamp with time zone,
  public_slug text,
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
  )
  select
    p.id,
    p.title,
    p.start_date,
    p.end_date,
    p.created_at,
    p.public_slug,
    p.destination_name,
    ps.updated_at as latest_snapshot_at,
    p.cover_image
  from public.plans p
  join user_plan_ids upi on upi.plan_id = p.id
  left join public.plan_snapshots ps on ps.plan_id = p.id
  order by coalesce(ps.updated_at, p.created_at) desc
  limit 50;
$$;

-- 5. Retire the catalog. CASCADE also removes their RLS policies, grants and
--    foreign keys. Nothing else references them (verified: only the two
--    functions above, now rewritten).
drop table if exists public.plan_destinations cascade;
drop table if exists public.destinations cascade;
