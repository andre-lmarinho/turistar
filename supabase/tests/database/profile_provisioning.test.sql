begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

-- Insert into the real Auth table so its provisioning trigger runs.
insert into auth.users (id, email, raw_user_meta_data) values
  ('e1000000-0000-4000-8000-000000000001', 'profile-test@example.test',
   '{"username":"profile-test","full_name":"Initial name","avatar_url":"initial-avatar"}');

select is((select slug from public.profiles where id = 'e1000000-0000-4000-8000-000000000001'),
  'profile-test', 'Auth signup creates the requested profile slug');
select is((select display_name from public.profiles where id = 'e1000000-0000-4000-8000-000000000001'),
  'Initial name', 'Auth metadata supplies the initial display name');
select is((select avatar_url from public.profiles where id = 'e1000000-0000-4000-8000-000000000001'),
  'initial-avatar', 'Auth metadata supplies the initial avatar');

insert into auth.users (id, email, raw_user_meta_data) values
  ('e2000000-0000-4000-8000-000000000002', 'collision-test@example.test', '{"username":"profile-test"}'),
  ('e3000000-0000-4000-8000-000000000003', 'fallback-test@example.test', '{"username":"INVALID USERNAME"}'),
  ('e4000000-0000-4000-8000-000000000004', 'long-slug-test@example.test', jsonb_build_object('username', repeat('a', 28))),
  ('e5000000-0000-4000-8000-000000000005', 'long-collision-test@example.test', jsonb_build_object('username', repeat('a', 28)));
select is((select slug from public.profiles where id = 'e2000000-0000-4000-8000-000000000002'),
  'profile-test-e2000000', 'A duplicate requested slug gets a user-specific fallback');
select matches((select slug from public.profiles where id = 'e3000000-0000-4000-8000-000000000003'),
  '^traveler-[a-f0-9]{19}$', 'Invalid metadata gets a valid generated slug');
select ok((select length(slug) <= 28 from public.profiles where id = 'e5000000-0000-4000-8000-000000000005'),
  'Collision fallback respects the application username length');

update public.profiles set slug = 'custom-profile', display_name = 'Custom name', avatar_url = 'custom-avatar'
where id = 'e1000000-0000-4000-8000-000000000001';
update auth.users set raw_user_meta_data = '{"username":"replacement","full_name":"Replacement name"}'
where id = 'e1000000-0000-4000-8000-000000000001';
select is((select slug from public.profiles where id = 'e1000000-0000-4000-8000-000000000001'),
  'custom-profile', 'Later Auth metadata changes preserve the profile slug');
select is((select display_name from public.profiles where id = 'e1000000-0000-4000-8000-000000000001'),
  'Custom name', 'Later Auth metadata changes preserve the display name');
select is((select avatar_url from public.profiles where id = 'e1000000-0000-4000-8000-000000000001'),
  'custom-avatar', 'Later Auth metadata changes preserve the avatar');

-- Occupy every candidate: a failed profile insert must roll back the Auth user.
insert into auth.users (id, email, raw_user_meta_data)
select ('b' || lpad(i::text, 7, '0') || '-0000-4000-8000-' || lpad(i::text, 12, '0'))::uuid,
  'blocked-' || i || '@example.test', jsonb_build_object('username',
    case when i = 0 then 'blocked'
      when i = 1 then 'blocked-e6000000'
      else 'blocked-e6000000-' || i end)
from generate_series(0, 9) i;
select throws_ok($$
  insert into auth.users (id, email, raw_user_meta_data) values
    ('e6000000-0000-4000-8000-000000000006', 'blocked-test@example.test', '{"username":"blocked"}')
$$, 'P0001', 'Profile provisioning could not allocate a slug for userId=e6000000-0000-4000-8000-000000000006',
  'Exhausted slug candidates fail signup instead of leaving a partial account');
select is((select count(*) from auth.users where id = 'e6000000-0000-4000-8000-000000000006'),
  0::bigint, 'Failed provisioning rolls back the Auth user');
select is((select count(*) from public.profiles where id = 'e6000000-0000-4000-8000-000000000006'),
  0::bigint, 'Failed provisioning leaves no profile');

select ok(not has_column_privilege('authenticated', 'public.profiles', 'id', 'INSERT'),
  'Authenticated clients cannot provision profiles');
select ok(not has_table_privilege('authenticated', 'public.profiles', 'DELETE'),
  'Authenticated clients cannot remove profiles independently of Auth');
select ok(not has_function_privilege('authenticated', 'public.provision_user_profile()', 'EXECUTE'),
  'The trigger function is not exposed to authenticated callers');

select * from finish();
rollback;
