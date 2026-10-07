begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

insert into auth.users (id, email, raw_user_meta_data) values
  ('c1000000-0000-4000-8000-000000000001', 'events-owner@example.test', '{"username":"events-owner"}'),
  ('c2000000-0000-4000-8000-000000000002', 'events-member@example.test', '{"username":"events-member"}'),
  ('c3000000-0000-4000-8000-000000000003', 'events-outsider@example.test', '{"username":"events-outsider"}');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'c1000000-0000-4000-8000-000000000001', true);
select set_config('test.plan_id', result_plan_id::text, true)
from public.create_full_plan('Event fixture', 'Test destination');
select is((select count(*) from public.plan_members where plan_id = current_setting('test.plan_id')::uuid
  and user_id = 'c1000000-0000-4000-8000-000000000001' and tier = 'admin'),
  1::bigint, 'Creating a plan grants its owner admin membership');
select is((select version from public.plan_snapshots where plan_id = current_setting('test.plan_id')::uuid),
  0::bigint, 'Creating a plan initializes its snapshot');
select throws_ok($$select public.create_full_plan('Spoofed owner', 'Destination', _user_id :=
  'c2000000-0000-4000-8000-000000000002')$$, 'P0001', 'create_full_plan: user_id does not match auth.uid',
  'Plan creation rejects a client-supplied different owner');

select is((public.append_plan_events(current_setting('test.plan_id')::uuid, 0,
  '[{"type":"activity.created","actor_id":"c3000000-0000-4000-8000-000000000003","payload":{
    "dayId":"day-1","position":"a0","activity":{"id":"activity-1","title":"No location","color":"blue","lat":null,"lng":null}}}]',
  '{"days":[],"marker":"saved"}') ->> 'version')::bigint,
  1::bigint, 'Appending an event advances the snapshot version');
select is((select payload #> '{activity,lat}' from public.plan_events
  where plan_id = current_setting('test.plan_id')::uuid), 'null'::jsonb,
  'An activity with no coordinates persists JSON null');
select is((select actor_id from public.plan_events where plan_id = current_setting('test.plan_id')::uuid),
  'c1000000-0000-4000-8000-000000000001'::uuid, 'The persisted actor is the authenticated caller');
select is((select state from public.plan_snapshots where plan_id = current_setting('test.plan_id')::uuid),
  '{"days":[],"marker":"saved"}'::jsonb, 'The event and supplied snapshot persist together');

select is(public.append_plan_events(current_setting('test.plan_id')::uuid, 0,
  '[{"type":"day.removed","payload":{"dayId":"day-1"}}]', '{"marker":"stale"}'),
  '{"version":1,"inserted_events":[]}'::jsonb, 'A stale writer receives a conflict without appended events');
select is((select state ->> 'marker' from public.plan_snapshots where plan_id = current_setting('test.plan_id')::uuid),
  'saved', 'A version conflict preserves the snapshot');
select is((select count(*) from public.plan_events where plan_id = current_setting('test.plan_id')::uuid),
  1::bigint, 'A version conflict preserves the event log');

-- The first event is valid; failure of the second must undo the entire batch.
select throws_ok($$select public.append_plan_events(current_setting('test.plan_id')::uuid, 1,
  '[{"type":"day.removed","payload":{"dayId":"day-1"}},
    {"id":"cc000000-0000-4000-8000-000000000001","type":"activity.created","payload":{}}]',
  '{"marker":"partial"}')$$, '22023',
  'validate_plan_event_payload: invalid activity.created payload for event_id=cc000000-0000-4000-8000-000000000001',
  'A malformed event rejects the whole batch');
select is((select count(*) from public.plan_events where plan_id = current_setting('test.plan_id')::uuid),
  1::bigint, 'Batch failure rolls back previously inserted events');
select is((select version from public.plan_snapshots where plan_id = current_setting('test.plan_id')::uuid),
  1::bigint, 'Batch failure preserves the snapshot version');
select is((select state ->> 'marker' from public.plan_snapshots where plan_id = current_setting('test.plan_id')::uuid),
  'saved', 'Batch failure preserves the snapshot state');

reset role;
insert into public.plan_members (plan_id, user_id, tier) values
  (current_setting('test.plan_id')::uuid, 'c2000000-0000-4000-8000-000000000002', 'member');
set local role authenticated;
select set_config('request.jwt.claim.sub', 'c2000000-0000-4000-8000-000000000002', true);
select is((public.append_plan_events(current_setting('test.plan_id')::uuid, 1,
  '[{"type":"day.removed","payload":{"dayId":"day-1"}}]') ->> 'version')::bigint,
  2::bigint, 'An invited member can append events');
select set_config('request.jwt.claim.sub', 'c3000000-0000-4000-8000-000000000003', true);
select throws_ok($$select public.append_plan_events(current_setting('test.plan_id')::uuid, 2,
  '[{"type":"day.removed","payload":{"dayId":"day-1"}}]', '{"marker":"unauthorized"}')$$,
  'P0001', 'append_plan_events: not authorized for plan_id=' || current_setting('test.plan_id')
    || ' user_id=c3000000-0000-4000-8000-000000000003', 'An outsider cannot append events');
reset role;
select is((select count(*) from public.plan_events where plan_id = current_setting('test.plan_id')::uuid),
  2::bigint, 'An unauthorized append leaves the event log unchanged');
select is((select state ->> 'marker' from public.plan_snapshots where plan_id = current_setting('test.plan_id')::uuid),
  'saved', 'An unauthorized append leaves the snapshot unchanged');

select * from finish();
rollback;
