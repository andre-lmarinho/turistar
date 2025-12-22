-- Fix plan member invites and ensure owners are added to memberships.
BEGIN;

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
  SELECT pr.id INTO target_user
  FROM auth.users u
  JOIN public.profiles pr ON pr.id = u.id
  WHERE lower(u.email) = normalized_email
  LIMIT 1;

  IF target_user IS NULL THEN
    RAISE EXCEPTION 'User not registered';
  END IF;

  RETURN QUERY
    INSERT INTO public.plan_members (plan_id, user_id, tier, created_by)
    VALUES (_plan_id, target_user, COALESCE(_tier, 'member'), (select auth.uid()))
    ON CONFLICT ON CONSTRAINT plan_members_pkey DO UPDATE
      SET tier = EXCLUDED.tier
    RETURNING plan_members.user_id, plan_members.tier;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_full_plan(
  _title text,
  _dest_name text,
  _dest_lat double precision DEFAULT NULL,
  _dest_long double precision DEFAULT NULL,
  _dest_country text DEFAULT NULL,
  _start_date date DEFAULT NULL,
  _end_date date DEFAULT NULL,
  _user_id uuid DEFAULT NULL
)
RETURNS TABLE(result_plan_id uuid, result_public_slug text, result_edit_token uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  destination_pk uuid;
  normalized_title text;
  normalized_dest text;
  normalized_country text;
BEGIN
  normalized_title := NULLIF(BTRIM(_title), '');
  normalized_dest := NULLIF(BTRIM(_dest_name), '');
  normalized_country := NULLIF(upper(BTRIM(_dest_country)), '');

  INSERT INTO public.plans (title, start_date, end_date, user_id)
  VALUES (normalized_title, _start_date, _end_date, _user_id)
  RETURNING id, public_slug, edit_token
  INTO result_plan_id, result_public_slug, result_edit_token;

  IF normalized_dest IS NOT NULL THEN
    INSERT INTO public.destinations (name, latitude, longitude, country)
    VALUES (normalized_dest, _dest_lat, _dest_long, normalized_country)
    ON CONFLICT (name) DO UPDATE
      SET latitude = COALESCE(EXCLUDED.latitude, public.destinations.latitude),
          longitude = COALESCE(EXCLUDED.longitude, public.destinations.longitude),
          country = COALESCE(EXCLUDED.country, public.destinations.country)
    RETURNING id INTO destination_pk;

    INSERT INTO public.plan_destinations (plan_id, destination_id, position)
    VALUES (result_plan_id, destination_pk, 0)
    ON CONFLICT (plan_id, destination_id) DO NOTHING;
  END IF;

  INSERT INTO public.plan_snapshots (plan_id)
  VALUES (result_plan_id)
  ON CONFLICT (plan_id) DO NOTHING;

  IF _user_id IS NOT NULL THEN
    INSERT INTO public.plan_members (plan_id, user_id, tier, created_by)
    VALUES (result_plan_id, _user_id, 'admin', _user_id)
    ON CONFLICT (plan_id, user_id) DO NOTHING;
  END IF;

  RETURN QUERY SELECT result_plan_id, result_public_slug, result_edit_token;
END;
$$;

INSERT INTO public.plan_members (plan_id, user_id, tier, created_by)
SELECT p.id, p.user_id, 'admin', p.user_id
FROM public.plans p
JOIN public.profiles pr ON pr.id = p.user_id
WHERE p.user_id IS NOT NULL
ON CONFLICT (plan_id, user_id) DO NOTHING;

COMMIT;
