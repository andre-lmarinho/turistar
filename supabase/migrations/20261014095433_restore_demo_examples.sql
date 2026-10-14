begin;

-- Baselines and reset bookkeeping are maintenance data, never client-editable.
alter table public.demo_baseline enable row level security;
alter table public.demo_reset_state enable row level security;
revoke all on public.demo_baseline, public.demo_reset_state from anon, authenticated;

-- Older baselines omitted destination/slug data, even when a plan was deleted.
-- Upgrade only the two existing curated examples; fresh installs seed them later.
update public.demo_baseline b
set plan = jsonb_build_object(
  'public_slug', fixture.slug, 'destination_name', fixture.destination,
  'destination_country', fixture.country, 'latitude', fixture.latitude,
  'longitude', fixture.longitude
) || b.plan || jsonb_build_object('start_offset_days', fixture.start_offset)
from (values
  ('555386c3-df5b-4032-a4bc-03fdfa952105'::uuid, 'xGAJQ3na6Zlh', 'Rome', 'IT', 41.8933203, 12.4829321, -1),
  ('564b630b-4aad-439c-9dde-c28d538ab4ea'::uuid, 'QMXjVVskVsFb', 'Boipeba', 'BR', -13.5824298, -38.9294512, 30)
) as fixture(id, slug, destination, country, latitude, longitude, start_offset)
where b.plan_id = fixture.id;

create or replace function public.maybe_reset_demo()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  demo_uid uuid;
  last_reset timestamptz;
  today date := (now() at time zone 'America/Bahia')::date;
  first_day date;
  start_day date;
  end_day date;
  shifted_days jsonb;
  restored_state jsonb;
  b record;
begin
  select id into demo_uid from auth.users where email = 'demo@turistar.me';
  if demo_uid is null or not exists (select 1 from public.demo_baseline) then
    return false;
  end if;

  -- The demo session may restore itself. SQL maintenance/seed runs as postgres.
  if auth.uid() is distinct from demo_uid
    and not (auth.uid() is null and session_user in ('postgres', 'supabase_admin')) then
    return false;
  end if;

  insert into public.demo_reset_state (id, last_reset_at)
  values (true, 'epoch'::timestamptz) on conflict (id) do nothing;
  select r.last_reset_at into last_reset
  from public.demo_reset_state r where r.id = true for update;
  if last_reset > now() - interval '1 hour' then
    return false;
  end if;

  -- Never take over a plan that now belongs to another account.
  if exists (
    select 1 from public.plans p join public.demo_baseline baseline on baseline.plan_id = p.id
    where p.user_id is distinct from demo_uid
  ) then
    raise exception 'maybe_reset_demo: baseline plan is not owned by demo user_id=%', demo_uid;
  end if;

  -- Match the itinerary writer's snapshot-first lock order before restoring plans.
  perform s.plan_id from public.plan_snapshots s
  join public.demo_baseline baseline on baseline.plan_id = s.plan_id
  order by s.plan_id for update of s;

  delete from public.plans p where p.user_id = demo_uid
    and not exists (select 1 from public.demo_baseline baseline where baseline.plan_id = p.id);
  delete from public.plan_events e
    where exists (select 1 from public.demo_baseline baseline where baseline.plan_id = e.plan_id);

  for b in select plan_id, plan, snapshot, budget from public.demo_baseline order by plan_id loop
    restored_state := b.snapshot->'state';
    first_day := (restored_state->'days'->0->>'id')::date;
    start_day := (b.plan->>'start_date')::date;
    end_day := (b.plan->>'end_date')::date;

    if b.plan ? 'start_offset_days' and first_day is not null then
      start_day := today + (b.plan->>'start_offset_days')::integer;
      select jsonb_agg(
        day || jsonb_build_object(
          'id', to_char(start_day + ((day->>'id')::date - first_day), 'YYYY-MM-DD'),
          'label', to_char(start_day + ((day->>'id')::date - first_day), 'Dy, DD Mon')
        ) order by ordinal
      ) into shifted_days
      from jsonb_array_elements(restored_state->'days') with ordinality as days(day, ordinal);
      restored_state := jsonb_set(restored_state, '{days}', shifted_days);
    end if;

    -- Metadata agrees with the restored calendar, including INSERT (no date trigger).
    if first_day is not null then
      start_day := (restored_state->'days'->0->>'id')::date;
      end_day := (restored_state->'days'->-1->>'id')::date;
    end if;

    insert into public.plans (
      id, user_id, title, start_date, end_date, budget, public_slug, cover_image,
      destination_name, destination_country, latitude, longitude
    ) values (
      b.plan_id, demo_uid, b.plan->>'title', start_day, end_day,
      (b.plan->>'budget')::numeric, b.plan->>'public_slug', b.plan->>'cover_image',
      b.plan->>'destination_name', b.plan->>'destination_country',
      (b.plan->>'latitude')::double precision, (b.plan->>'longitude')::double precision
    ) on conflict (id) do update set
      title = excluded.title, start_date = excluded.start_date, end_date = excluded.end_date,
      budget = excluded.budget, public_slug = excluded.public_slug, cover_image = excluded.cover_image,
      destination_name = excluded.destination_name, destination_country = excluded.destination_country,
      latitude = excluded.latitude, longitude = excluded.longitude;

    insert into public.plan_snapshots (plan_id, version, state, updated_at)
    values (b.plan_id, (b.snapshot->>'version')::bigint, restored_state, now())
    on conflict (plan_id) do update set
      version = excluded.version, state = excluded.state, updated_at = excluded.updated_at;

    delete from public.plan_members where plan_id = b.plan_id;
    insert into public.plan_members (plan_id, user_id, tier)
    values (b.plan_id, demo_uid, 'admin');

    delete from public.budget_entries where plan_id = b.plan_id;
    insert into public.budget_entries (id, plan_id, description, category, amount)
    select (entry->>'id')::uuid, b.plan_id, entry->>'description', entry->>'category',
      (entry->>'amount')::numeric from jsonb_array_elements(b.budget) as entries(entry);
  end loop;

  update public.profiles set display_name = 'Demo User', slug = 'demouser', avatar_url = null
  where id = demo_uid;
  update public.demo_reset_state set last_reset_at = now() where id = true;
  return true;
end;
$$;

revoke all on function public.maybe_reset_demo() from public, anon, authenticated;
grant execute on function public.maybe_reset_demo() to authenticated;

commit;
