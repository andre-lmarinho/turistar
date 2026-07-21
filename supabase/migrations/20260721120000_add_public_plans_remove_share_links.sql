begin;

-- Reintroduce opt-in public plans (the capability #458 removed), but SAFE this time.
-- The #458 incident was `is_public DEFAULT true`: every plan was world-readable by accident.
-- Here the column defaults to FALSE, so a plan is private until its owner explicitly publishes.
-- Anonymous read is capability-scoped: anon may SELECT a plan and its public-safe children
-- ONLY when plans.is_public = true. plan_members and plan_events stay closed to anon entirely.

-- 1. Visibility flag with a safe default.
alter table public.plans add column if not exists is_public boolean not null default false;

-- 2. Anon/authenticated SELECT policies gated on is_public (mirror the pre-#458 policies).
--    plan_events is intentionally omitted: the public view reads the latest snapshot, never the
--    event log.
drop policy if exists "Public plans are readable" on public.plans;
create policy "Public plans are readable"
  on public.plans
  for select
  to anon, authenticated
  using (is_public = true);

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

-- Author byline (avatar + display name) on public plan pages, scoped to owners of public plans.
drop policy if exists "Public plan owner profiles are readable" on public.profiles;
create policy "Public plan owner profiles are readable"
  on public.profiles
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.plans p
      where p.user_id = profiles.id
        and p.is_public = true
    )
  );

-- 3. Grants. Anon gets column-scoped SELECT (edit_token is never selectable). plan_members and
--    plan_events are deliberately NOT granted to anon.
grant select (id, user_id, title, start_date, end_date, created_at, budget, is_public, public_slug, cover_image)
  on table public.plans to anon;
grant select on table public.destinations to anon;
grant select on table public.plan_destinations to anon;
grant select on table public.plan_snapshots to anon;
grant select on table public.budget_entries to anon;
grant select (id, slug, display_name, avatar_url) on table public.profiles to anon;

-- 4. Authenticated needs is_public back in SELECT (to read own/shared visibility) and UPDATE
--    (owners/members toggle it). Column grants are additive over the existing full-set grants.
grant select (is_public) on table public.plans to authenticated;
grant update (is_public) on table public.plans to authenticated;

-- 5. Remove the share-link capability entirely (feature deleted). Email membership invites are
--    unaffected (add_plan_member_by_email). CASCADE drops the admin-read policy on the table.
drop function if exists public.accept_plan_share_link(uuid);
drop function if exists public.create_plan_share_link(uuid);
drop function if exists public.revoke_plan_share_link(uuid);
drop table if exists public.plan_share_links cascade;

commit;
