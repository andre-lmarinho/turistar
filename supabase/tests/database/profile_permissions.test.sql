begin;
create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;
select no_plan();

insert into auth.users (id, email, raw_user_meta_data) values
  ('a1000000-0000-4000-8000-000000000001', 'rls-owner@example.test', '{"username":"rls-owner"}'),
  ('a2000000-0000-4000-8000-000000000002', 'rls-member@example.test', '{"username":"rls-member"}'),
  ('a3000000-0000-4000-8000-000000000003', 'rls-outsider@example.test', '{"username":"rls-outsider"}');
insert into public.plans (id, user_id, title) values
  ('aa000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'RLS fixture');
insert into public.plan_members (plan_id, user_id, tier) values
  ('aa000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'admin'),
  ('aa000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000002', 'member');

set local role authenticated;
select set_config('request.jwt.claim.sub', 'a1000000-0000-4000-8000-000000000001', true);
select results_eq($$select slug from public.profiles where id in (
  'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000002',
  'a3000000-0000-4000-8000-000000000003') order by slug$$,
  $$values ('rls-member'::text), ('rls-owner'::text)$$,
  'A member can read their own profile and shared-plan profiles, not outsiders');
update public.profiles set display_name = 'Edited owner' where id = 'a1000000-0000-4000-8000-000000000001';
select is((select display_name from public.profiles where id = 'a1000000-0000-4000-8000-000000000001'),
  'Edited owner', 'Authenticated users can edit their own profile');
select results_eq($$update public.profiles set display_name = 'Stolen name'
  where id = 'a2000000-0000-4000-8000-000000000002' returning id$$,
  $$select null::uuid where false$$, 'Shared-plan visibility does not permit editing another profile');
select throws_ok($$insert into public.profiles (id, slug) values
  ('a1000000-0000-4000-8000-000000000001', 'manual-profile')$$,
  '42501', 'permission denied for table profiles', 'Authenticated clients cannot insert profiles');
select throws_ok($$delete from public.profiles where id = 'a1000000-0000-4000-8000-000000000001'$$,
  '42501', 'permission denied for table profiles', 'Authenticated clients cannot delete their profile');

select set_config('request.jwt.claim.sub', 'a3000000-0000-4000-8000-000000000003', true);
select is((select count(*) from public.profiles where id in (
  'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000002')),
  0::bigint, 'An outsider cannot read unrelated profiles');
select is((select count(*) from public.plans where id = 'aa000000-0000-4000-8000-000000000001'),
  0::bigint, 'An outsider cannot read a private plan');

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select throws_ok($$select id from public.profiles$$, '42501', 'permission denied for table profiles',
  'Anonymous callers cannot read profiles');
select throws_ok($$select id from public.plans$$, '42501', 'permission denied for table plans',
  'Anonymous callers cannot read plans');

reset role;
select is((select display_name from public.profiles where id = 'a2000000-0000-4000-8000-000000000002'),
  'rls-member', 'Denied updates leave the other profile unchanged');
select * from finish();
rollback;
