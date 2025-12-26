-- Allow owners to leave when another admin exists by transferring ownership.
BEGIN;

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
  new_owner uuid;
BEGIN
  self_id := (select auth.uid());
  IF self_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT user_id INTO plan_owner
  FROM public.plans
  WHERE id = _plan_id;

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

  IF plan_owner IS NOT NULL AND plan_owner = self_id THEN
    SELECT pm.user_id INTO new_owner
    FROM public.plan_members pm
    WHERE pm.plan_id = _plan_id
      AND pm.tier = 'admin'
      AND pm.user_id <> self_id
    ORDER BY pm.created_at
    LIMIT 1;

    IF new_owner IS NULL THEN
      RAISE EXCEPTION 'Plan must have at least one admin';
    END IF;

    UPDATE public.plans
    SET user_id = new_owner
    WHERE id = _plan_id;
  END IF;

  DELETE FROM public.plan_members
  WHERE plan_id = _plan_id
    AND user_id = self_id;
END;
$$;

COMMIT;
