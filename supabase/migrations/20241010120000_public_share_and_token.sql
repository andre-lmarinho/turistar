-- 1) Extension to generate tokens
create extension if not exists pgcrypto;

-- 2) New columns on plans
alter table public.plans
  add column if not exists is_public boolean not null default true,
  add column if not exists public_slug text not null default translate(encode(gen_random_bytes(9), 'base64'), '/+', '_-'),
  add column if not exists edit_token uuid not null default gen_random_uuid();

create unique index if not exists idx_plans_public_slug on public.plans(public_slug);

-- 3) RLS ON
alter table public.plans enable row level security;
alter table public.plan_days enable row level security;
alter table public.activities enable row level security;
alter table public.plan_destinations enable row level security;
alter table public.catalog enable row level security;

-- 4) Policies (public SELECT and unrestricted INSERT on plans)
-- plans
drop policy if exists plans_insert_any on public.plans;
create policy plans_insert_any
on public.plans for insert
to anon
with check (true);

drop policy if exists plans_select_public on public.plans;
create policy plans_select_public
on public.plans for select
to anon
using (is_public = true);

-- plan_days
drop policy if exists plan_days_select_public on public.plan_days;
create policy plan_days_select_public
on public.plan_days for select
to anon
using (exists (
  select 1 from public.plans p
  where p.id = plan_id and p.is_public = true
));

-- activities
drop policy if exists activities_select_public on public.activities;
create policy activities_select_public
on public.activities for select
to anon
using (exists (
  select 1
  from public.plan_days d
  join public.plans p on p.id = d.plan_id
  where d.id = day_id and p.is_public = true
));

-- plan_destinations
drop policy if exists plan_destinations_select_public on public.plan_destinations;
create policy plan_destinations_select_public
on public.plan_destinations for select
to anon
using (exists (
  select 1 from public.plans p
  where p.id = plan_id and p.is_public = true
));

-- catalog: public read only
drop policy if exists catalog_select_public on public.catalog;
create policy catalog_select_public
on public.catalog for select
to anon
using (true);

-- 5) Update create_full_plan to return plan_id, public_slug, edit_token
create or replace function create_full_plan(
  _title text,
  _dest_name text,
  _dest_lat double precision,
  _dest_long double precision,
  _start_date date,
  _end_date date
)
returns table (plan_id uuid, public_slug text, edit_token uuid)
language plpgsql
as $$
declare
  v_plan_id uuid;
  v_dest_id uuid;
  v_slug text;
  v_token uuid;
begin
  if _start_date is null or _end_date is null or _start_date > _end_date then
    raise exception 'Invalid date range: % .. %', _start_date, _end_date
      using errcode = '22007';
  end if;

  insert into public.plans(title, user_id, start_date, end_date)
  values (_title, null, _start_date, _end_date)
  returning id, public_slug, edit_token into v_plan_id, v_slug, v_token;

  insert into public.destinations(name, latitude, longitude)
  values (_dest_name, _dest_lat, _dest_long)
  on conflict (name) do update
    set latitude = excluded.latitude,
        longitude = excluded.longitude
  returning id into v_dest_id;

  insert into public.plan_destinations(plan_id, destination_id, position)
  values (v_plan_id, v_dest_id, 0);

  insert into public.plan_days(plan_id, date, position, destination_id)
  select v_plan_id,
         gs::date,
         row_number() over (order by gs) - 1,
         v_dest_id
  from generate_series(_start_date, _end_date, interval '1 day') as gs;

  return query select v_plan_id, v_slug, v_token;
end;
$$;

-- 6) Editing RPCs protected by edit_token
-- a) Update plan title
create or replace function update_plan_title(
  _plan_id uuid,
  _edit_token uuid,
  _new_title text
) returns void
language plpgsql
security definer
as $$
begin
  if not exists (select 1 from public.plans where id = _plan_id and edit_token = _edit_token) then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  update public.plans set title = _new_title where id = _plan_id;
end;
$$;

-- b) Add activity to a day
create or replace function add_activity(
  _day_id uuid,
  _edit_token uuid,
  _title text,
  _start_time time without time zone,
  _duration int,
  _catalog_id text,
  _budget numeric,
  _image_url text,
  _color text,
  _address text,
  _position int
) returns uuid
language plpgsql
security definer
as $$
declare
  v_plan_id uuid;
  v_id uuid;
begin
  select d.plan_id into v_plan_id from public.plan_days d where d.id = _day_id;

  if v_plan_id is null
     or not exists (select 1 from public.plans where id = v_plan_id and edit_token = _edit_token) then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  insert into public.activities(
    day_id, title, start_time, duration, catalog_id, budget, image_url, color, address, position
  ) values (
    _day_id, _title, _start_time, _duration, _catalog_id, _budget, _image_url, _color, _address, _position
  )
  returning id into v_id;

  return v_id;
end;
$$;
