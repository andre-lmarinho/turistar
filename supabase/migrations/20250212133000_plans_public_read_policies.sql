-- Broaden read policies so public plans are viewable via public_slug and
-- owners keep full access. Applies to plans and related tables used in the
-- public planner experience.
BEGIN;

-- plans
DROP POLICY IF EXISTS "Users select their plans" ON public.plans;
CREATE POLICY "Select own or public plans"
  ON public.plans
  FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

-- inserts/updates remain owner-scoped
DROP POLICY IF EXISTS "Users insert their plans" ON public.plans;
CREATE POLICY "Users insert their plans"
  ON public.plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update their plans" ON public.plans;
CREATE POLICY "Users update their plans"
  ON public.plans
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- plan_destinations
DROP POLICY IF EXISTS "Users select plan_destinations via plans" ON public.plan_destinations;
CREATE POLICY "Select plan_destinations for own or public plans"
  ON public.plan_destinations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.plans p
      WHERE p.id = plan_destinations.plan_id
        AND (p.is_public = true OR p.user_id = auth.uid())
    )
  );

-- plan_snapshots
DROP POLICY IF EXISTS "Users select plan_snapshots via plans" ON public.plan_snapshots;
CREATE POLICY "Select plan_snapshots for own or public plans"
  ON public.plan_snapshots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.plans p
      WHERE p.id = plan_snapshots.plan_id
        AND (p.is_public = true OR p.user_id = auth.uid())
    )
  );

-- plan_days (if present)
DO $$
BEGIN
  IF to_regclass('public.plan_days') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Select plan_days for own or public plans" ON public.plan_days;
    CREATE POLICY "Select plan_days for own or public plans"
      ON public.plan_days
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.plans p
          WHERE p.id = plan_days.plan_id
            AND (p.is_public = true OR p.user_id = auth.uid())
        )
      );
  END IF;
END$$;

-- budget_entries (if present)
DO $$
BEGIN
  IF to_regclass('public.budget_entries') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Select budget_entries for own or public plans" ON public.budget_entries;
    CREATE POLICY "Select budget_entries for own or public plans"
      ON public.budget_entries
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.plans p
          WHERE p.id = budget_entries.plan_id
            AND (p.is_public = true OR p.user_id = auth.uid())
        )
      );
  END IF;
END$$;

COMMIT;
