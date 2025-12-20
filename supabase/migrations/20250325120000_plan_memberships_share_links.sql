-- Planner memberships and share links.
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_member_tier') THEN
    CREATE TYPE public.plan_member_tier AS ENUM ('admin', 'member');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.plan_members (
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier public.plan_member_tier NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES public.profiles(id),
  PRIMARY KEY (plan_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.plan_share_links (
  plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NOT NULL REFERENCES public.profiles(id),
  revoked_at timestamptz,
  PRIMARY KEY (plan_id),
  UNIQUE (token)
);

CREATE INDEX IF NOT EXISTS plan_members_plan_id_idx ON public.plan_members(plan_id);
CREATE INDEX IF NOT EXISTS plan_members_user_id_idx ON public.plan_members(user_id);

-- Backfill owners as admins when possible.
INSERT INTO public.plan_members (plan_id, user_id, tier, created_by)
SELECT p.id, p.user_id, 'admin', p.user_id
FROM public.plans p
JOIN public.profiles pr ON pr.id = p.user_id
WHERE p.user_id IS NOT NULL
ON CONFLICT (plan_id, user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_plan_member(_plan_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.plan_members pm
    WHERE pm.plan_id = _plan_id
      AND pm.user_id = (select auth.uid())
  )
  OR EXISTS (
    SELECT 1
    FROM public.plans p
    WHERE p.id = _plan_id
      AND p.user_id = (select auth.uid())
  );
$$;

CREATE OR REPLACE FUNCTION public.is_plan_admin(_plan_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.plans p
    WHERE p.id = _plan_id
      AND p.user_id = (select auth.uid())
  )
  OR EXISTS (
    SELECT 1
    FROM public.plan_members pm
    WHERE pm.plan_id = _plan_id
      AND pm.user_id = (select auth.uid())
      AND pm.tier = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.plan_admin_count(_plan_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public AS $$
  SELECT count(*)
  FROM public.plan_members pm
  WHERE pm.plan_id = _plan_id
    AND pm.tier = 'admin';
$$;

ALTER TABLE public.plan_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_share_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own profile" ON public.profiles;
CREATE POLICY "Select profiles for shared plans"
  ON public.profiles
  FOR SELECT
  USING (
    id = (select auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.plan_members pm_self
      JOIN public.plan_members pm_target ON pm_target.plan_id = pm_self.plan_id
      WHERE pm_self.user_id = (select auth.uid())
        AND pm_target.user_id = profiles.id
    )
  );

CREATE POLICY "Users insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users update their own profile"
  ON public.profiles
  FOR UPDATE
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users delete their own profile"
  ON public.profiles
  FOR DELETE
  USING ((select auth.uid()) = id);

CREATE POLICY "Select plan_members for members or owners"
  ON public.plan_members
  FOR SELECT
  USING (public.is_plan_member(plan_members.plan_id));

CREATE POLICY "Select plan_share_links for admins"
  ON public.plan_share_links
  FOR SELECT
  USING (public.is_plan_admin(plan_share_links.plan_id));

DROP POLICY IF EXISTS "Select own or public plans" ON public.plans;
CREATE POLICY "Select own, public, or member plans"
  ON public.plans
  FOR SELECT
  USING (
    is_public = true
    OR (select auth.uid()) = user_id
    OR public.is_plan_member(plans.id)
  );

DROP POLICY IF EXISTS "Select plan_destinations for own or public plans" ON public.plan_destinations;
CREATE POLICY "Select plan_destinations for own, public, or member plans"
  ON public.plan_destinations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.plans p
      WHERE p.id = plan_destinations.plan_id
        AND (
          p.is_public = true
          OR p.user_id = (select auth.uid())
          OR public.is_plan_member(plan_destinations.plan_id)
        )
    )
  );

DROP POLICY IF EXISTS "Select plan_snapshots for own or public plans" ON public.plan_snapshots;
CREATE POLICY "Select plan_snapshots for own, public, or member plans"
  ON public.plan_snapshots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.plans p
      WHERE p.id = plan_snapshots.plan_id
        AND (
          p.is_public = true
          OR p.user_id = (select auth.uid())
          OR public.is_plan_member(plan_snapshots.plan_id)
        )
    )
  );

DO $$
BEGIN
  IF to_regclass('public.plan_days') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Select plan_days for own or public plans" ON public.plan_days;
    CREATE POLICY "Select plan_days for own, public, or member plans"
      ON public.plan_days
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.plans p
          WHERE p.id = plan_days.plan_id
            AND (
              p.is_public = true
              OR p.user_id = (select auth.uid())
              OR public.is_plan_member(plan_days.plan_id)
            )
        )
      );
  END IF;
END$$;

DO $$
BEGIN
  IF to_regclass('public.budget_entries') IS NOT NULL THEN
    DROP POLICY IF EXISTS "Select budget_entries for own or public plans" ON public.budget_entries;
    CREATE POLICY "Select budget_entries for own, public, or member plans"
      ON public.budget_entries
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.plans p
          WHERE p.id = budget_entries.plan_id
            AND (
              p.is_public = true
              OR p.user_id = (select auth.uid())
              OR public.is_plan_member(budget_entries.plan_id)
            )
        )
      );
  END IF;
END$$;

DROP POLICY IF EXISTS "Select plan_events for own or public plans" ON public.plan_events;
CREATE POLICY "Select plan_events for own, public, or member plans"
  ON public.plan_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.plans p
      WHERE p.id = plan_events.plan_id
        AND (
          p.is_public = true
          OR p.user_id = (select auth.uid())
          OR public.is_plan_member(plan_events.plan_id)
        )
    )
  );

DROP POLICY IF EXISTS "Insert plan_events for own plans" ON public.plan_events;
CREATE POLICY "Insert plan_events for member plans"
  ON public.plan_events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.plans p
      WHERE p.id = plan_events.plan_id
        AND (
          p.user_id = (select auth.uid())
          OR public.is_plan_member(plan_events.plan_id)
        )
    )
  );

DROP POLICY IF EXISTS "Select destinations for public or owner plans" ON public.destinations;
CREATE POLICY "Select destinations for public, owner, or member plans"
  ON public.destinations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.plan_destinations pd
      JOIN public.plans p ON p.id = pd.plan_id
      WHERE pd.destination_id = public.destinations.id
        AND (
          p.is_public = true
          OR p.user_id = (select auth.uid())
          OR public.is_plan_member(p.id)
        )
    )
  );

CREATE OR REPLACE FUNCTION public.add_plan_member_by_email(
  _plan_id uuid,
  _email text,
  _tier public.plan_member_tier DEFAULT 'member'
)
RETURNS TABLE(user_id uuid, tier public.plan_member_tier)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth AS $$
DECLARE
  normalized_email text;
  target_user uuid;
BEGIN
  IF (select auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_plan_admin(_plan_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  normalized_email := lower(trim(_email));
  SELECT u.id INTO target_user
  FROM auth.users u
  WHERE lower(u.email) = normalized_email
  LIMIT 1;

  IF target_user IS NULL THEN
    RAISE EXCEPTION 'User not registered';
  END IF;

  RETURN QUERY
    INSERT INTO public.plan_members (plan_id, user_id, tier, created_by)
    VALUES (_plan_id, target_user, COALESCE(_tier, 'member'), (select auth.uid()))
    ON CONFLICT (plan_id, user_id) DO UPDATE
      SET tier = EXCLUDED.tier
    RETURNING plan_members.user_id, plan_members.tier;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_plan_member_tier(
  _plan_id uuid,
  _user_id uuid,
  _tier public.plan_member_tier
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  target_tier public.plan_member_tier;
  admin_count integer;
  plan_owner uuid;
BEGIN
  IF (select auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_plan_admin(_plan_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT user_id INTO plan_owner
  FROM public.plans
  WHERE id = _plan_id;

  IF plan_owner IS NOT NULL AND plan_owner = _user_id THEN
    RAISE EXCEPTION 'Owner tier cannot be changed';
  END IF;

  SELECT tier INTO target_tier
  FROM public.plan_members
  WHERE plan_id = _plan_id
    AND user_id = _user_id;

  IF target_tier IS NULL THEN
    RAISE EXCEPTION 'Member not found';
  END IF;

  IF target_tier = 'admin' AND _tier = 'member' THEN
    SELECT public.plan_admin_count(_plan_id) INTO admin_count;
    IF admin_count <= 1 THEN
      RAISE EXCEPTION 'Plan must have at least one admin';
    END IF;
  END IF;

  UPDATE public.plan_members
  SET tier = _tier
  WHERE plan_id = _plan_id
    AND user_id = _user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_plan_member(
  _plan_id uuid,
  _user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  target_tier public.plan_member_tier;
  admin_count integer;
  plan_owner uuid;
BEGIN
  IF (select auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_plan_admin(_plan_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT user_id INTO plan_owner
  FROM public.plans
  WHERE id = _plan_id;

  IF plan_owner IS NOT NULL AND plan_owner = _user_id THEN
    RAISE EXCEPTION 'Owner cannot be removed';
  END IF;

  SELECT tier INTO target_tier
  FROM public.plan_members
  WHERE plan_id = _plan_id
    AND user_id = _user_id;

  IF target_tier IS NULL THEN
    RAISE EXCEPTION 'Member not found';
  END IF;

  IF target_tier = 'admin' THEN
    SELECT public.plan_admin_count(_plan_id) INTO admin_count;
    IF admin_count <= 1 THEN
      RAISE EXCEPTION 'Plan must have at least one admin';
    END IF;
  END IF;

  DELETE FROM public.plan_members
  WHERE plan_id = _plan_id
    AND user_id = _user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.leave_plan(_plan_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  self_id uuid;
  self_tier public.plan_member_tier;
  admin_count integer;
  plan_owner uuid;
BEGIN
  self_id := (select auth.uid());
  IF self_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT user_id INTO plan_owner
  FROM public.plans
  WHERE id = _plan_id;

  IF plan_owner IS NOT NULL AND plan_owner = self_id THEN
    RAISE EXCEPTION 'Owner cannot leave';
  END IF;

  SELECT tier INTO self_tier
  FROM public.plan_members
  WHERE plan_id = _plan_id
    AND user_id = self_id;

  IF self_tier IS NULL THEN
    RAISE EXCEPTION 'Member not found';
  END IF;

  IF self_tier = 'admin' THEN
    SELECT public.plan_admin_count(_plan_id) INTO admin_count;
    IF admin_count <= 1 THEN
      RAISE EXCEPTION 'Plan must have at least one admin';
    END IF;
  END IF;

  DELETE FROM public.plan_members
  WHERE plan_id = _plan_id
    AND user_id = self_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_plan_share_link(_plan_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  link_token uuid;
BEGIN
  IF (select auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_plan_admin(_plan_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  link_token := gen_random_uuid();

  INSERT INTO public.plan_share_links (plan_id, token, created_by, created_at, revoked_at)
  VALUES (_plan_id, link_token, (select auth.uid()), now(), null)
  ON CONFLICT (plan_id) DO UPDATE
    SET token = EXCLUDED.token,
        created_by = EXCLUDED.created_by,
        created_at = EXCLUDED.created_at,
        revoked_at = null
  RETURNING token INTO link_token;

  RETURN link_token;
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_plan_share_link(_plan_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  updated_count integer;
BEGIN
  IF (select auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT public.is_plan_admin(_plan_id) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.plan_share_links
  SET revoked_at = now()
  WHERE plan_id = _plan_id
    AND revoked_at IS NULL;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_plan_share_link(_token uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  self_id uuid;
  target_plan uuid;
BEGIN
  self_id := (select auth.uid());
  IF self_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT plan_id INTO target_plan
  FROM public.plan_share_links
  WHERE token = _token
    AND revoked_at IS NULL;

  IF target_plan IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired link';
  END IF;

  INSERT INTO public.plan_members (plan_id, user_id, tier, created_by)
  VALUES (target_plan, self_id, 'member', self_id)
  ON CONFLICT (plan_id, user_id) DO NOTHING;

  RETURN target_plan;
END;
$$;

COMMIT;
