-- Strengthen auth security defaults and optimize RLS/initplan + FK performance.
BEGIN;

-- Try to enable leaked password protection and broaden MFA options (TOTP + WebAuthn).
-- Falls back to notices if the helper isn't available in the target runtime.
DO $$
DECLARE
  has_two_arg boolean := to_regprocedure('auth.set_config(text,text)') IS NOT NULL;
  has_three_arg boolean := to_regprocedure('auth.set_config(text,text,boolean)') IS NOT NULL;
BEGIN
  IF has_three_arg THEN
    PERFORM auth.set_config('password.hibp.enabled', 'true', true);
    PERFORM auth.set_config('mfa.totp.enroll_enabled', 'true', true);
    PERFORM auth.set_config('mfa.totp.verify_enabled', 'true', true);
    PERFORM auth.set_config('mfa.webauthn.enroll_enabled', 'true', true);
    PERFORM auth.set_config('mfa.webauthn.verify_enabled', 'true', true);
  ELSIF has_two_arg THEN
    PERFORM auth.set_config('password.hibp.enabled', 'true');
    PERFORM auth.set_config('mfa.totp.enroll_enabled', 'true');
    PERFORM auth.set_config('mfa.totp.verify_enabled', 'true');
    PERFORM auth.set_config('mfa.webauthn.enroll_enabled', 'true');
    PERFORM auth.set_config('mfa.webauthn.verify_enabled', 'true');
  ELSE
    RAISE NOTICE 'auth.set_config() not available; enable HIBP + MFA options in the dashboard.';
  END IF;
END$$;

-- RLS: wrap auth helpers in sub-selects to avoid per-row initplan re-evaluation.
DROP POLICY IF EXISTS "Users manage their own profile" ON public.profiles;
CREATE POLICY "Users manage their own profile"
  ON public.profiles
  FOR ALL
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Select own or public plans" ON public.plans;
CREATE POLICY "Select own or public plans"
  ON public.plans
  FOR SELECT
  USING (is_public = true OR (select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users insert their plans" ON public.plans;
CREATE POLICY "Users insert their plans"
  ON public.plans
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users update their plans" ON public.plans;
CREATE POLICY "Users update their plans"
  ON public.plans
  FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Select plan_destinations for own or public plans" ON public.plan_destinations;
CREATE POLICY "Select plan_destinations for own or public plans"
  ON public.plan_destinations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.plans p
      WHERE p.id = plan_destinations.plan_id
        AND (p.is_public = true OR p.user_id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Select plan_snapshots for own or public plans" ON public.plan_snapshots;
CREATE POLICY "Select plan_snapshots for own or public plans"
  ON public.plan_snapshots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.plans p
      WHERE p.id = plan_snapshots.plan_id
        AND (p.is_public = true OR p.user_id = (select auth.uid()))
    )
  );

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
            AND (p.is_public = true OR p.user_id = (select auth.uid()))
        )
      );
  END IF;
END$$;

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
            AND (p.is_public = true OR p.user_id = (select auth.uid()))
        )
      );
  END IF;
END$$;

DROP POLICY IF EXISTS "Select plan_events for own or public plans" ON public.plan_events;
CREATE POLICY "Select plan_events for own or public plans"
  ON public.plan_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.plans p
      WHERE p.id = plan_events.plan_id
        AND (p.is_public = true OR p.user_id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Insert plan_events for own plans" ON public.plan_events;
CREATE POLICY "Insert plan_events for own plans"
  ON public.plan_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.plans p
      WHERE p.id = plan_events.plan_id
        AND p.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Select destinations for public or owner plans" ON public.destinations;
CREATE POLICY "Select destinations for public or owner plans"
  ON public.destinations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.plan_destinations pd
      JOIN public.plans p ON p.id = pd.plan_id
      WHERE pd.destination_id = public.destinations.id
        AND (p.is_public = true OR p.user_id = (select auth.uid()))
    )
  );

-- FK coverage indexes for better join performance.
CREATE INDEX IF NOT EXISTS budget_entries_plan_id_idx ON public.budget_entries(plan_id);
CREATE INDEX IF NOT EXISTS plan_destinations_destination_id_idx ON public.plan_destinations(destination_id);
CREATE INDEX IF NOT EXISTS plans_user_id_idx ON public.plans(user_id);

COMMIT;
