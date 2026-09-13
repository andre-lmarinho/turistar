-- Read summaries directly from confirmed snapshots; never hydrate each planner.
create function public.get_user_plan_summaries()
returns table (
  id uuid, title text, start_date date, end_date date,
  destination_name text, destination_country text,
  latitude double precision, longitude double precision,
  updated_at timestamptz, cover_image text, activity_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with user_plan_ids as (
    select p.id from public.plans p where p.user_id = (select auth.uid())
    union
    select pm.plan_id from public.plan_members pm where pm.user_id = (select auth.uid())
  )
  select p.id, p.title, p.start_date, p.end_date,
    p.destination_name, p.destination_country, p.latitude, p.longitude,
    coalesce(ps.updated_at, p.created_at), p.cover_image,
    coalesce((
      select sum(case when jsonb_typeof(day->'activities') = 'array'
        then jsonb_array_length(day->'activities') else 0 end)
      from jsonb_array_elements(case when jsonb_typeof(ps.state->'days') = 'array'
        then ps.state->'days' else '[]'::jsonb end) as day
    ), 0)::bigint
  from public.plans p
  join user_plan_ids accessible on accessible.id = p.id
  left join public.plan_snapshots ps on ps.plan_id = p.id
  -- No LIMIT: the map uses all plans; the service limits the cards to 50.
  order by coalesce(ps.updated_at, p.created_at) desc, p.id;
$$;

revoke all on function public.get_user_plan_summaries() from public, anon;
grant execute on function public.get_user_plan_summaries() to authenticated;

-- Keep get_user_planners during rollout so older app instances still work.
