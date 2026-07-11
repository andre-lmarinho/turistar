begin;

-- Edit access is granted only by authenticated plan membership. The legacy
-- token was neither required by the RPCs nor safe to expose through the Data API.
drop function if exists public.update_plan_title(uuid, uuid, text);
drop function if exists public.update_plan_dates(uuid, uuid, date, date);
drop function if exists public.get_user_planners();
drop function if exists public.create_full_plan(text, text, double precision, double precision, text, date, date, uuid, text);

alter table public.plans drop column if exists edit_token;

create function public.create_full_plan(
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
  returning id, public_slug into result_plan_id, result_public_slug;

  if v_destination_name is not null then
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

  return query select result_plan_id, result_public_slug;
end;
$$;

create function public.get_user_planners()
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

create function public.update_plan_title(
  _plan_id uuid,
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

create function public.update_plan_dates(
  _plan_id uuid,
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
grant execute on function public.update_plan_title(uuid, text) to authenticated, service_role;
grant execute on function public.update_plan_dates(uuid, date, date) to authenticated, service_role;

commit;
