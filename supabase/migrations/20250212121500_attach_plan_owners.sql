-- Adds user ownership support to the create_full_plan RPC so plans.user_id is
-- captured at insert-time, and includes a helper block to backfill existing
-- plans once per environment.
CREATE OR REPLACE FUNCTION public.create_full_plan(
  _title text,
  _dest_name text,
  _dest_lat double precision DEFAULT NULL,
  _dest_long double precision DEFAULT NULL,
  _start_date date DEFAULT NULL,
  _end_date date DEFAULT NULL,
  _user_id uuid DEFAULT NULL
)
RETURNS TABLE(plan_id uuid, public_slug text, edit_token uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  destination_id uuid;
  normalized_title text;
  normalized_dest text;
BEGIN
  normalized_title := NULLIF(BTRIM(_title), '');
  normalized_dest := NULLIF(BTRIM(_dest_name), '');

  INSERT INTO public.plans (title, start_date, end_date, user_id)
  VALUES (normalized_title, _start_date, _end_date, _user_id)
  RETURNING id, public_slug, edit_token
  INTO plan_id, public_slug, edit_token;

  IF normalized_dest IS NOT NULL THEN
    INSERT INTO public.destinations (name, latitude, longitude)
    VALUES (normalized_dest, _dest_lat, _dest_long)
    ON CONFLICT (name) DO UPDATE
      SET latitude = COALESCE(EXCLUDED.latitude, public.destinations.latitude),
          longitude = COALESCE(EXCLUDED.longitude, public.destinations.longitude)
    RETURNING id INTO destination_id;

    INSERT INTO public.plan_destinations (plan_id, destination_id, position)
    VALUES (plan_id, destination_id, 0)
    ON CONFLICT (plan_id, destination_id) DO NOTHING;
  END IF;

  INSERT INTO public.plan_snapshots (plan_id)
  VALUES (plan_id)
  ON CONFLICT (plan_id) DO NOTHING;

  RETURN QUERY SELECT plan_id, public_slug, edit_token;
END;
$$;

-- Optional backfill: associate plans with the first UUID actor_id seen in
-- plan_events so legacy planners gain ownership without relying on edit tokens.
-- Run this once after deploying the updated RPC.
WITH owner_candidates AS (
  SELECT DISTINCT ON (plan_id)
    plan_id,
    actor_id::uuid AS user_id
  FROM public.plan_events
  WHERE actor_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  ORDER BY plan_id, created_at ASC
)
UPDATE public.plans AS plans
SET user_id = owner_candidates.user_id
FROM owner_candidates
WHERE plans.user_id IS NULL
  AND plans.id = owner_candidates.plan_id;
