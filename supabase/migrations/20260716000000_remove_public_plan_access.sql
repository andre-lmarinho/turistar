begin;

-- Read/edit/create is authenticated-membership only. Anonymous access is removed:
-- `is_public` was never written (always true by default) and made every plan
-- world-readable via the Data API. `public_slug` remains the share capability,
-- but resolving it now requires a logged-in viewer (see getPlannerExperience).

-- Drop the anon SELECT policies. The matching "Member ... are readable" policies
-- (to authenticated + is_plan_member) already cover all legitimate reads.
drop policy if exists "Public plans are readable" on public.plans;
drop policy if exists "Public plan destinations are readable" on public.plan_destinations;
drop policy if exists "Public destinations are readable through public plans" on public.destinations;
drop policy if exists "Public snapshots are readable" on public.plan_snapshots;
drop policy if exists "Public events are readable" on public.plan_events;
drop policy if exists "Public budget entries are readable" on public.budget_entries;

-- Redundant once anon has no grants at all.
drop policy if exists "Plan members are hidden from anonymous users" on public.plan_members;

-- Revoke every anon table grant. Nothing in public is reachable by anon anymore.
revoke select on table public.plans from anon;
revoke select on table public.destinations from anon;
revoke select on table public.plan_destinations from anon;
revoke select on table public.plan_snapshots from anon;
revoke select on table public.plan_events from anon;
revoke select on table public.budget_entries from anon;
revoke select on table public.plan_members from anon;
revoke usage on type public.plan_member_tier from anon;

-- Re-grant plans SELECT to authenticated without the dropped column.
revoke select on table public.plans from authenticated;
grant select (id, user_id, title, start_date, end_date, created_at, budget, public_slug, cover_image)
  on table public.plans to authenticated;

alter table public.plans drop column if exists is_public;

commit;
